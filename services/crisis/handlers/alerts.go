package handlers

import (
	"fmt"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/nexus-platform/crisis-service/database"
	"github.com/nexus-platform/crisis-service/models"
	"github.com/nexus-platform/crisis-service/services"
)

// CreateAlert handles POST /api/v1/crisis/alerts
func CreateAlert(c *fiber.Ctx) error {
	var req struct {
		Sender      string               `json:"sender"`
		Status      string               `json:"status"`
		MessageType string               `json:"msg_type"`
		Scope       string               `json:"scope"`
		Event       string               `json:"event"`
		Category    string               `json:"category"`
		Urgency     string               `json:"urgency"`
		Severity    models.SeverityLevel `json:"severity"`
		Certainty   string               `json:"certainty"`
		Headline    string               `json:"headline"`
		Description string               `json:"description"`
		Instruction string               `json:"instruction"`
		Effective   *time.Time           `json:"effective"`
		Onset       *time.Time           `json:"onset"`
		Expires     *time.Time           `json:"expires"`
		AreaDesc    string               `json:"area_desc"`
		Polygons    []string             `json:"polygons"`
		Circles     []string             `json:"circles"`
		IncidentID  *string              `json:"incident_id"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Invalid request body",
		})
	}

	// Validate required fields (CAP standard)
	if req.Sender == "" || req.Event == "" || req.Description == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Sender, event, and description are required (CAP standard)",
		})
	}

	// Generate CAP identifier
	identifier := fmt.Sprintf("nexus-crisis-%s-%d", req.Sender, time.Now().Unix())

	alert := models.Alert{
		Identifier:  identifier,
		Sender:      req.Sender,
		Sent:        time.Now(),
		Status:      req.Status,
		MessageType: req.MessageType,
		Scope:       req.Scope,
		Event:       req.Event,
		Category:    req.Category,
		Urgency:     req.Urgency,
		Severity:    req.Severity,
		Certainty:   req.Certainty,
		Headline:    req.Headline,
		Description: req.Description,
		Instruction: req.Instruction,
		Effective:   req.Effective,
		Onset:       req.Onset,
		Expires:     req.Expires,
		AreaDesc:    req.AreaDesc,
		Polygons:    req.Polygons,
		Circles:     req.Circles,
	}

	// Link to incident if provided
	if req.IncidentID != nil {
		incidentUUID, err := uuid.Parse(*req.IncidentID)
		if err == nil {
			alert.IncidentID = &incidentUUID
		}
	}

	if err := database.DB.Create(&alert).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to create alert",
		})
	}

	// Broadcast alert if enabled
	go BroadcastAlert(alert)

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"message": "Alert created successfully (CAP-compliant)",
		"data":    alert,
	})
}

// GetAlerts handles GET /api/v1/crisis/alerts
func GetAlerts(c *fiber.Ctx) error {
	var alerts []models.Alert

	query := database.DB.Model(&models.Alert{})

	// Filter by active alerts (not expired)
	if active := c.Query("active"); active == "true" {
		now := time.Now()
		query = query.Where("expires IS NULL OR expires > ?", now)
	}

	// Filter by severity
	if severity := c.Query("severity"); severity != "" {
		query = query.Where("severity = ?", severity)
	}

	// Filter by category
	if category := c.Query("category"); category != "" {
		query = query.Where("category = ?", category)
	}

	// Pagination
	limit := c.QueryInt("limit", 50)
	offset := c.QueryInt("offset", 0)

	var total int64
	query.Count(&total)

	if err := query.Order("sent DESC").Limit(limit).Offset(offset).Find(&alerts).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to fetch alerts",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    alerts,
		"total":   total,
	})
}

// GetAlert handles GET /api/v1/crisis/alerts/:id
func GetAlert(c *fiber.Ctx) error {
	id := c.Params("id")

	var alert models.Alert
	if err := database.DB.Where("id = ?", id).First(&alert).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"error":   "Alert not found",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    alert,
	})
}

// BroadcastAlert broadcasts an alert to subscribers
func BroadcastAlert(alert models.Alert) {
	// Update broadcast status
	now := time.Now()
	alert.Broadcasted = true
	alert.BroadcastedAt = &now
	alert.Recipients = 0 // Would count actual recipients

	database.DB.Save(&alert)

	// Publish to Kafka
	services.Kafka.PublishAlertBroadcasted(alert.ID.String(), fiber.Map{
		"alert_id":    alert.ID,
		"identifier":  alert.Identifier,
		"event":       alert.Event,
		"severity":    alert.Severity,
		"urgency":     alert.Urgency,
		"headline":    alert.Headline,
		"description": alert.Description,
		"area_desc":   alert.AreaDesc,
		"timestamp":   alert.Sent,
	})

	// Broadcast via WebSocket to connected clients
	BroadcastToAll("alert", fiber.Map{
		"alert_id":    alert.ID,
		"event":       alert.Event,
		"severity":    alert.Severity,
		"headline":    alert.Headline,
		"description": alert.Description,
	})

	// Here you would also:
	// - Send SMS via SMS gateway
	// - Send emails via email service
	// - Push notifications to mobile apps
	// - Activate sirens/public warning systems
}

// CancelAlert handles POST /api/v1/crisis/alerts/:id/cancel
func CancelAlert(c *fiber.Ctx) error {
	id := c.Params("id")

	var alert models.Alert
	if err := database.DB.Where("id = ?", id).First(&alert).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"error":   "Alert not found",
		})
	}

	// Create cancellation alert (CAP standard)
	cancelAlert := models.Alert{
		Identifier:  fmt.Sprintf("%s-CANCEL", alert.Identifier),
		Sender:      alert.Sender,
		Sent:        time.Now(),
		Status:      "Actual",
		MessageType: "Cancel",
		Scope:       alert.Scope,
		Event:       alert.Event,
		Category:    alert.Category,
		Urgency:     "Past",
		Severity:    models.SeverityLow,
		Certainty:   "Observed",
		Headline:    fmt.Sprintf("CANCELLED: %s", alert.Headline),
		Description: "This alert has been cancelled",
	}

	if err := database.DB.Create(&cancelAlert).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to create cancellation",
		})
	}

	// Broadcast cancellation
	BroadcastToAll("alert_cancelled", fiber.Map{
		"original_alert_id": id,
		"cancel_alert_id":   cancelAlert.ID,
	})

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Alert cancelled successfully",
		"data":    cancelAlert,
	})
}
