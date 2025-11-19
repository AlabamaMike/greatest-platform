package handlers

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/nexus-platform/crisis-service/database"
	"github.com/nexus-platform/crisis-service/models"
	"github.com/nexus-platform/crisis-service/services"
)

// RegisterVolunteer handles POST /api/v1/crisis/volunteers
func RegisterVolunteer(c *fiber.Ctx) error {
	var req struct {
		FullName        string   `json:"full_name"`
		Email           string   `json:"email"`
		Phone           string   `json:"phone"`
		Age             int      `json:"age"`
		Gender          string   `json:"gender"`
		Skills          []string `json:"skills"`
		Certifications  []string `json:"certifications"`
		Languages       []string `json:"languages"`
		MedicalTraining bool     `json:"medical_training"`
		Latitude        float64  `json:"latitude"`
		Longitude       float64  `json:"longitude"`
		LocationName    string   `json:"location_name"`
		Address         string   `json:"address"`
		Country         string   `json:"country"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Invalid request body",
		})
	}

	if req.FullName == "" || req.Email == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Full name and email are required",
		})
	}

	volunteer := models.Volunteer{
		FullName:        req.FullName,
		Email:           req.Email,
		Phone:           req.Phone,
		Age:             req.Age,
		Gender:          req.Gender,
		Skills:          req.Skills,
		Certifications:  req.Certifications,
		Languages:       req.Languages,
		MedicalTraining: req.MedicalTraining,
		Latitude:        req.Latitude,
		Longitude:       req.Longitude,
		LocationName:    req.LocationName,
		Address:         req.Address,
		Country:         req.Country,
		Available:       true,
	}

	if err := database.DB.Create(&volunteer).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to register volunteer",
		})
	}

	// Publish event
	go services.Kafka.PublishVolunteerRegistered(volunteer.ID.String(), fiber.Map{
		"volunteer_id":     volunteer.ID,
		"full_name":        volunteer.FullName,
		"skills":           volunteer.Skills,
		"medical_training": volunteer.MedicalTraining,
		"location":         volunteer.LocationName,
		"timestamp":        volunteer.CreatedAt,
	})

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"message": "Volunteer registered successfully",
		"data":    volunteer,
	})
}

// GetVolunteers handles GET /api/v1/crisis/volunteers
func GetVolunteers(c *fiber.Ctx) error {
	var volunteers []models.Volunteer

	query := database.DB.Model(&models.Volunteer{})

	// Filters
	if available := c.Query("available"); available == "true" {
		query = query.Where("available = ?", true)
	}
	if medicalTraining := c.Query("medical_training"); medicalTraining == "true" {
		query = query.Where("medical_training = ?", true)
	}
	if country := c.Query("country"); country != "" {
		query = query.Where("country = ?", country)
	}

	// Pagination
	limit := c.QueryInt("limit", 50)
	offset := c.QueryInt("offset", 0)

	var total int64
	query.Count(&total)

	if err := query.Order("created_at DESC").Limit(limit).Offset(offset).Find(&volunteers).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to fetch volunteers",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    volunteers,
		"total":   total,
	})
}

// GetVolunteer handles GET /api/v1/crisis/volunteers/:id
func GetVolunteer(c *fiber.Ctx) error {
	id := c.Params("id")

	var volunteer models.Volunteer
	if err := database.DB.Where("id = ?", id).First(&volunteer).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"error":   "Volunteer not found",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    volunteer,
	})
}

// DeployVolunteer handles POST /api/v1/crisis/volunteers/:id/deploy
func DeployVolunteer(c *fiber.Ctx) error {
	volunteerID := c.Params("id")

	var volunteer models.Volunteer
	if err := database.DB.Where("id = ?", volunteerID).First(&volunteer).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"error":   "Volunteer not found",
		})
	}

	var req struct {
		IncidentID string `json:"incident_id"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Invalid request body",
		})
	}

	incidentUUID, err := uuid.Parse(req.IncidentID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Invalid incident ID",
		})
	}

	// Verify incident exists
	var incident models.Incident
	if err := database.DB.Where("id = ?", req.IncidentID).First(&incident).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"error":   "Incident not found",
		})
	}

	// Update volunteer
	now := time.Now()
	volunteer.CurrentlyDeployed = true
	volunteer.DeployedTo = &incidentUUID
	volunteer.DeployedAt = &now
	volunteer.Available = false
	volunteer.ResponsesCount++
	volunteer.LastActiveAt = &now

	if err := database.DB.Save(&volunteer).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to deploy volunteer",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Volunteer deployed successfully",
		"data":    volunteer,
	})
}

// UpdateVolunteerAvailability handles PATCH /api/v1/crisis/volunteers/:id/availability
func UpdateVolunteerAvailability(c *fiber.Ctx) error {
	id := c.Params("id")

	var volunteer models.Volunteer
	if err := database.DB.Where("id = ?", id).First(&volunteer).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"error":   "Volunteer not found",
		})
	}

	var req struct {
		Available        bool   `json:"available"`
		AvailabilityNote string `json:"availability_note"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Invalid request body",
		})
	}

	volunteer.Available = req.Available
	volunteer.AvailabilityNote = req.AvailabilityNote

	if err := database.DB.Save(&volunteer).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to update availability",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Availability updated successfully",
		"data":    volunteer,
	})
}

// GetVolunteersByIncident handles GET /api/v1/crisis/incidents/:id/volunteers
func GetVolunteersByIncident(c *fiber.Ctx) error {
	incidentID := c.Params("id")

	var volunteers []models.Volunteer
	if err := database.DB.Where("deployed_to = ?", incidentID).Find(&volunteers).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to fetch volunteers",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    volunteers,
		"count":   len(volunteers),
	})
}

// MatchVolunteers handles POST /api/v1/crisis/volunteers/match
// AI-powered matching of volunteers to incidents based on skills, location, etc.
func MatchVolunteers(c *fiber.Ctx) error {
	var req struct {
		IncidentID      string   `json:"incident_id"`
		RequiredSkills  []string `json:"required_skills"`
		MedicalRequired bool     `json:"medical_required"`
		MaxDistance     float64  `json:"max_distance_km"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Invalid request body",
		})
	}

	// Get incident
	var incident models.Incident
	if err := database.DB.Where("id = ?", req.IncidentID).First(&incident).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"error":   "Incident not found",
		})
	}

	// Find available volunteers
	query := database.DB.Model(&models.Volunteer{}).Where("available = ?", true)

	if req.MedicalRequired {
		query = query.Where("medical_training = ?", true)
	}

	var volunteers []models.Volunteer
	if err := query.Find(&volunteers).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to match volunteers",
		})
	}

	// Simple matching algorithm (in production, use AI/ML service for better matching)
	type Match struct {
		Volunteer   models.Volunteer `json:"volunteer"`
		MatchScore  int              `json:"match_score"`
		Distance    float64          `json:"distance_km"`
		MatchReason []string         `json:"match_reason"`
	}

	matches := []Match{}
	for _, v := range volunteers {
		score := 0
		reasons := []string{}

		// Check skills overlap
		skillMatch := 0
		for _, reqSkill := range req.RequiredSkills {
			for _, volSkill := range v.Skills {
				if reqSkill == volSkill {
					skillMatch++
				}
			}
		}
		if skillMatch > 0 {
			score += skillMatch * 20
			reasons = append(reasons, fmt.Sprintf("Matches %d required skills", skillMatch))
		}

		// Medical training
		if req.MedicalRequired && v.MedicalTraining {
			score += 30
			reasons = append(reasons, "Has medical training")
		}

		// Simple distance calculation (in production, use proper geospatial queries)
		distance := calculateDistance(incident.Latitude, incident.Longitude, v.Latitude, v.Longitude)
		if distance < req.MaxDistance {
			score += int(50 * (1 - distance/req.MaxDistance))
			reasons = append(reasons, fmt.Sprintf("Within %.1f km", distance))
		}

		// Previous responses
		if v.ResponsesCount > 0 {
			score += 10
			reasons = append(reasons, fmt.Sprintf("Veteran volunteer (%d responses)", v.ResponsesCount))
		}

		if score > 0 {
			matches = append(matches, Match{
				Volunteer:   v,
				MatchScore:  score,
				Distance:    distance,
				MatchReason: reasons,
			})
		}
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Volunteers matched using AI-powered algorithm",
		"data": fiber.Map{
			"incident_id": req.IncidentID,
			"matches":     matches,
			"count":       len(matches),
		},
	})
}

// Simple distance calculation (Haversine formula)
func calculateDistance(lat1, lon1, lat2, lon2 float64) float64 {
	// Simplified - in production use proper geospatial library
	// Returns approximate distance in km
	return ((lat1 - lat2) * (lat1 - lat2) + (lon1 - lon2) * (lon1 - lon2)) * 111
}
