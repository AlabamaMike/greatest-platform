package handlers

import (
	"bytes"
	"encoding/json"
	"net/http/httptest"
	"testing"

	"github.com/gofiber/fiber/v2"
	"github.com/stretchr/testify/assert"
)

func TestRegisterVolunteer(t *testing.T) {
	app := setupTestApp()
	app.Post("/volunteers", RegisterVolunteer)

	payload := map[string]interface{}{
		"name":         "John Doe",
		"email":        "john@example.com",
		"phone":        "+1234567890",
		"skills":       []string{"medical", "logistics"},
		"availability": "immediate",
		"location": map[string]interface{}{
			"latitude":  40.7128,
			"longitude": -74.0060,
		},
	}

	body, _ := json.Marshal(payload)
	req := httptest.NewRequest("POST", "/volunteers", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")

	resp, err := app.Test(req)
	assert.NoError(t, err)
	assert.NotNil(t, resp)
}

func TestGetVolunteers(t *testing.T) {
	app := setupTestApp()
	app.Get("/volunteers", GetVolunteers)

	req := httptest.NewRequest("GET", "/volunteers", nil)
	resp, err := app.Test(req)

	assert.NoError(t, err)
	assert.Equal(t, 200, resp.StatusCode)
}

func TestGetVolunteer(t *testing.T) {
	app := setupTestApp()
	app.Get("/volunteers/:id", GetVolunteer)

	req := httptest.NewRequest("GET", "/volunteers/123", nil)
	resp, err := app.Test(req)

	assert.NoError(t, err)
	assert.NotNil(t, resp)
}

func TestDeployVolunteer(t *testing.T) {
	app := setupTestApp()
	app.Post("/volunteers/:id/deploy", DeployVolunteer)

	payload := map[string]interface{}{
		"incidentId": "incident-123",
		"role":       "medical-support",
		"notes":      "Assigned to medical team",
	}

	body, _ := json.Marshal(payload)
	req := httptest.NewRequest("POST", "/volunteers/123/deploy", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")

	resp, err := app.Test(req)
	assert.NoError(t, err)
	assert.NotNil(t, resp)
}

func TestUpdateVolunteerAvailability(t *testing.T) {
	app := setupTestApp()
	app.Patch("/volunteers/:id/availability", UpdateVolunteerAvailability)

	payload := map[string]interface{}{
		"availability": "available",
		"location": map[string]interface{}{
			"latitude":  40.7128,
			"longitude": -74.0060,
		},
	}

	body, _ := json.Marshal(payload)
	req := httptest.NewRequest("PATCH", "/volunteers/123/availability", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")

	resp, err := app.Test(req)
	assert.NoError(t, err)
	assert.NotNil(t, resp)
}

func TestMatchVolunteers(t *testing.T) {
	app := setupTestApp()
	app.Post("/volunteers/match", MatchVolunteers)

	payload := map[string]interface{}{
		"incidentId": "incident-123",
		"requiredSkills": []string{"medical", "logistics"},
		"maxDistance":    50,
	}

	body, _ := json.Marshal(payload)
	req := httptest.NewRequest("POST", "/volunteers/match", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")

	resp, err := app.Test(req)
	assert.NoError(t, err)
	assert.NotNil(t, resp)
}
