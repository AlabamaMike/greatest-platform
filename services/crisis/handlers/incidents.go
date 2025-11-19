package handlers

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/nexus-platform/crisis-service/database"
	"github.com/nexus-platform/crisis-service/models"
	"github.com/nexus-platform/crisis-service/services"
)

// CreateIncident handles POST /api/v1/crisis/incidents
func CreateIncident(c *fiber.Ctx) error {
	var req struct {
		Title           string              `json:"title"`
		Description     string              `json:"description"`
		Type            models.IncidentType `json:"type"`
		Severity        models.SeverityLevel `json:"severity"`
		Latitude        float64             `json:"latitude"`
		Longitude       float64             `json:"longitude"`
		LocationName    string              `json:"location_name"`
		Address         string              `json:"address"`
		Country         string              `json:"country"`
		Region          string              `json:"region"`
		ReporterName    string              `json:"reporter_name"`
		ReporterContact string              `json:"reporter_contact"`
		AffectedPeople  int                 `json:"affected_people"`
		Casualties      int                 `json:"casualties"`
		ImageURLs       []string            `json:"image_urls"`
		VideoURLs       []string            `json:"video_urls"`
		Tags            []string            `json:"tags"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Invalid request body",
		})
	}

	// Validate required fields
	if req.Title == "" || req.Latitude == 0 || req.Longitude == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Title, latitude, and longitude are required",
		})
	}

	incident := models.Incident{
		Title:           req.Title,
		Description:     req.Description,
		Type:            req.Type,
		Status:          models.StatusReported,
		Severity:        req.Severity,
		Latitude:        req.Latitude,
		Longitude:       req.Longitude,
		LocationName:    req.LocationName,
		Address:         req.Address,
		Country:         req.Country,
		Region:          req.Region,
		ReporterName:    req.ReporterName,
		ReporterContact: req.ReporterContact,
		AffectedPeople:  req.AffectedPeople,
		Casualties:      req.Casualties,
		ImageURLs:       req.ImageURLs,
		VideoURLs:       req.VideoURLs,
		Tags:            req.Tags,
		Verified:        false,
	}

	if err := database.DB.Create(&incident).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to create incident",
		})
	}

	// Publish event to Kafka
	go services.Kafka.PublishIncidentCreated(incident.ID.String(), fiber.Map{
		"incident_id": incident.ID,
		"title":       incident.Title,
		"type":        incident.Type,
		"severity":    incident.Severity,
		"latitude":    incident.Latitude,
		"longitude":   incident.Longitude,
		"timestamp":   incident.CreatedAt,
	})

	// Broadcast via WebSocket
	go BroadcastIncidentUpdate(incident.ID.String(), "created", incident)

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"message": "Incident reported successfully",
		"data":    incident,
	})
}

// GetIncidents handles GET /api/v1/crisis/incidents
func GetIncidents(c *fiber.Ctx) error {
	var incidents []models.Incident

	query := database.DB.Model(&models.Incident{})

	// Filters
	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}
	if incidentType := c.Query("type"); incidentType != "" {
		query = query.Where("type = ?", incidentType)
	}
	if severity := c.Query("severity"); severity != "" {
		query = query.Where("severity = ?", severity)
	}
	if verified := c.Query("verified"); verified == "true" {
		query = query.Where("verified = ?", true)
	}

	// Pagination
	limit := c.QueryInt("limit", 50)
	offset := c.QueryInt("offset", 0)

	var total int64
	query.Count(&total)

	if err := query.Order("created_at DESC").Limit(limit).Offset(offset).Find(&incidents).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to fetch incidents",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    incidents,
		"total":   total,
		"limit":   limit,
		"offset":  offset,
	})
}

// GetIncident handles GET /api/v1/crisis/incidents/:id
func GetIncident(c *fiber.Ctx) error {
	id := c.Params("id")

	var incident models.Incident
	if err := database.DB.Where("id = ?", id).First(&incident).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"error":   "Incident not found",
		})
	}

	// Fetch related updates
	var updates []models.Update
	database.DB.Where("incident_id = ?", id).Order("created_at DESC").Find(&updates)

	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"incident": incident,
			"updates":  updates,
		},
	})
}

// UpdateIncident handles PATCH /api/v1/crisis/incidents/:id
func UpdateIncident(c *fiber.Ctx) error {
	id := c.Params("id")

	var incident models.Incident
	if err := database.DB.Where("id = ?", id).First(&incident).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"error":   "Incident not found",
		})
	}

	var req struct {
		Status         *models.IncidentStatus `json:"status"`
		Severity       *models.SeverityLevel  `json:"severity"`
		AffectedPeople *int                   `json:"affected_people"`
		Casualties     *int                   `json:"casualties"`
		UpdateNote     string                 `json:"update_note"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Invalid request body",
		})
	}

	// Update fields if provided
	if req.Status != nil {
		incident.Status = *req.Status
	}
	if req.Severity != nil {
		incident.Severity = *req.Severity
	}
	if req.AffectedPeople != nil {
		incident.AffectedPeople = *req.AffectedPeople
	}
	if req.Casualties != nil {
		incident.Casualties = *req.Casualties
	}

	if err := database.DB.Save(&incident).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to update incident",
		})
	}

	// Create update record if note provided
	if req.UpdateNote != "" {
		update := models.Update{
			IncidentID:  incident.ID,
			Title:       "Status Update",
			Description: req.UpdateNote,
			UpdateType:  "status_change",
			AuthorName:  "System", // Should be actual user
		}
		database.DB.Create(&update)
	}

	// Publish event
	go services.Kafka.PublishIncidentUpdated(incident.ID.String(), fiber.Map{
		"incident_id": incident.ID,
		"status":      incident.Status,
		"severity":    incident.Severity,
		"timestamp":   time.Now(),
	})

	// Broadcast update
	go BroadcastIncidentUpdate(incident.ID.String(), "updated", incident)

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Incident updated successfully",
		"data":    incident,
	})
}

// VerifyIncident handles POST /api/v1/crisis/incidents/:id/verify
func VerifyIncident(c *fiber.Ctx) error {
	id := c.Params("id")

	var incident models.Incident
	if err := database.DB.Where("id = ?", id).First(&incident).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"error":   "Incident not found",
		})
	}

	now := time.Now()
	incident.Verified = true
	incident.VerifiedAt = &now
	incident.Status = models.StatusVerified

	// In production, set VerifiedBy to actual user ID
	// verifierID := uuid.MustParse(c.Locals("user_id").(string))
	// incident.VerifiedBy = &verifierID

	if err := database.DB.Save(&incident).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to verify incident",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Incident verified successfully",
		"data":    incident,
	})
}

// GetMapData handles GET /api/v1/crisis/map
func GetMapData(c *fiber.Ctx) error {
	var incidents []models.Incident

	query := database.DB.Model(&models.Incident{}).Where("status != ?", models.StatusResolved)

	// Filter by bounds if provided
	if minLat := c.QueryFloat("min_lat", -90); minLat != -90 {
		maxLat := c.QueryFloat("max_lat", 90)
		minLon := c.QueryFloat("min_lon", -180)
		maxLon := c.QueryFloat("max_lon", 180)

		query = query.Where("latitude BETWEEN ? AND ?", minLat, maxLat).
			Where("longitude BETWEEN ? AND ?", minLon, maxLon)
	}

	if err := query.Find(&incidents).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to fetch map data",
		})
	}

	// Format for mapping
	mapData := make([]fiber.Map, len(incidents))
	for i, inc := range incidents {
		mapData[i] = fiber.Map{
			"id":         inc.ID,
			"title":      inc.Title,
			"type":       inc.Type,
			"severity":   inc.Severity,
			"status":     inc.Status,
			"latitude":   inc.Latitude,
			"longitude":  inc.Longitude,
			"location":   inc.LocationName,
			"verified":   inc.Verified,
			"created_at": inc.CreatedAt,
		}
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    mapData,
		"count":   len(mapData),
	})
}

// AddIncidentUpdate handles POST /api/v1/crisis/incidents/:id/updates
func AddIncidentUpdate(c *fiber.Ctx) error {
	id := c.Params("id")
	incidentID, err := uuid.Parse(id)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Invalid incident ID",
		})
	}

	var req struct {
		Title       string   `json:"title"`
		Description string   `json:"description"`
		UpdateType  string   `json:"update_type"`
		ImageURLs   []string `json:"image_urls"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Invalid request body",
		})
	}

	update := models.Update{
		IncidentID:  incidentID,
		Title:       req.Title,
		Description: req.Description,
		UpdateType:  req.UpdateType,
		AuthorName:  "System", // Should be actual user
		ImageURLs:   req.ImageURLs,
	}

	if err := database.DB.Create(&update).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to create update",
		})
	}

	// Broadcast update
	go BroadcastIncidentUpdate(id, "update_added", update)

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"message": "Update added successfully",
		"data":    update,
	})
}
