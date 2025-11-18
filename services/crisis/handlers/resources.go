package handlers

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/nexus-platform/crisis-service/database"
	"github.com/nexus-platform/crisis-service/models"
	"github.com/nexus-platform/crisis-service/services"
)

// RegisterResource handles POST /api/v1/crisis/resources
func RegisterResource(c *fiber.Ctx) error {
	var req struct {
		Name            string  `json:"name"`
		Type            string  `json:"type"`
		Description     string  `json:"description"`
		Quantity        int     `json:"quantity"`
		Latitude        float64 `json:"latitude"`
		Longitude       float64 `json:"longitude"`
		LocationName    string  `json:"location_name"`
		Address         string  `json:"address"`
		ProviderName    string  `json:"provider_name"`
		ProviderContact string  `json:"provider_contact"`
		Organization    string  `json:"organization"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Invalid request body",
		})
	}

	if req.Name == "" || req.Type == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Name and type are required",
		})
	}

	resource := models.Resource{
		Name:            req.Name,
		Type:            req.Type,
		Description:     req.Description,
		Quantity:        req.Quantity,
		Available:       true,
		Latitude:        req.Latitude,
		Longitude:       req.Longitude,
		LocationName:    req.LocationName,
		Address:         req.Address,
		ProviderName:    req.ProviderName,
		ProviderContact: req.ProviderContact,
		Organization:    req.Organization,
	}

	if err := database.DB.Create(&resource).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to register resource",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"message": "Resource registered successfully",
		"data":    resource,
	})
}

// GetResources handles GET /api/v1/crisis/resources
func GetResources(c *fiber.Ctx) error {
	var resources []models.Resource

	query := database.DB.Model(&models.Resource{})

	// Filters
	if resourceType := c.Query("type"); resourceType != "" {
		query = query.Where("type = ?", resourceType)
	}
	if available := c.Query("available"); available == "true" {
		query = query.Where("available = ?", true)
	}

	// Pagination
	limit := c.QueryInt("limit", 50)
	offset := c.QueryInt("offset", 0)

	var total int64
	query.Count(&total)

	if err := query.Order("created_at DESC").Limit(limit).Offset(offset).Find(&resources).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to fetch resources",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    resources,
		"total":   total,
	})
}

// DeployResource handles POST /api/v1/crisis/resources/:id/deploy
func DeployResource(c *fiber.Ctx) error {
	resourceID := c.Params("id")

	var resource models.Resource
	if err := database.DB.Where("id = ?", resourceID).First(&resource).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"error":   "Resource not found",
		})
	}

	var req struct {
		IncidentID string `json:"incident_id"`
		Quantity   int    `json:"quantity"`
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

	// Update resource
	now := time.Now()
	resource.DeployedTo = &incidentUUID
	resource.DeployedAt = &now
	resource.Available = false

	if err := database.DB.Save(&resource).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to deploy resource",
		})
	}

	// Publish event
	go services.Kafka.PublishResourceDeployed(resource.ID.String(), fiber.Map{
		"resource_id": resource.ID,
		"incident_id": req.IncidentID,
		"type":        resource.Type,
		"quantity":    req.Quantity,
		"timestamp":   now,
	})

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Resource deployed successfully",
		"data":    resource,
	})
}

// GetResourcesByIncident handles GET /api/v1/crisis/incidents/:id/resources
func GetResourcesByIncident(c *fiber.Ctx) error {
	incidentID := c.Params("id")

	var resources []models.Resource
	if err := database.DB.Where("deployed_to = ?", incidentID).Find(&resources).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to fetch resources",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    resources,
		"count":   len(resources),
	})
}
