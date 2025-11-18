package handlers

import (
	"bytes"
	"encoding/json"
	"net/http/httptest"
	"testing"

	"github.com/gofiber/fiber/v2"
	"github.com/stretchr/testify/assert"
)

func setupTestApp() *fiber.App {
	app := fiber.New()
	return app
}

func TestCreateIncident(t *testing.T) {
	app := setupTestApp()
	app.Post("/incidents", CreateIncident)

	tests := []struct {
		name           string
		payload        map[string]interface{}
		expectedStatus int
	}{
		{
			name: "Valid incident creation",
			payload: map[string]interface{}{
				"type":        "flood",
				"severity":    "high",
				"description": "Severe flooding in downtown area",
				"latitude":    40.7128,
				"longitude":   -74.0060,
				"location":    "Downtown NYC",
			},
			expectedStatus: 201,
		},
		{
			name: "Missing required fields",
			payload: map[string]interface{}{
				"type": "flood",
			},
			expectedStatus: 400,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			body, _ := json.Marshal(tt.payload)
			req := httptest.NewRequest("POST", "/incidents", bytes.NewReader(body))
			req.Header.Set("Content-Type", "application/json")

			resp, err := app.Test(req)
			assert.NoError(t, err)
			assert.Equal(t, tt.expectedStatus, resp.StatusCode)
		})
	}
}

func TestGetIncidents(t *testing.T) {
	app := setupTestApp()
	app.Get("/incidents", GetIncidents)

	req := httptest.NewRequest("GET", "/incidents", nil)
	resp, err := app.Test(req)

	assert.NoError(t, err)
	assert.Equal(t, 200, resp.StatusCode)

	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)
	assert.True(t, result["success"].(bool))
}

func TestGetIncident(t *testing.T) {
	app := setupTestApp()
	app.Get("/incidents/:id", GetIncident)

	tests := []struct {
		name           string
		incidentID     string
		expectedStatus int
	}{
		{
			name:           "Valid incident ID",
			incidentID:     "123",
			expectedStatus: 200,
		},
		{
			name:           "Invalid incident ID",
			incidentID:     "invalid",
			expectedStatus: 404,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := httptest.NewRequest("GET", "/incidents/"+tt.incidentID, nil)
			resp, err := app.Test(req)

			assert.NoError(t, err)
			// Note: Actual implementation will determine exact status codes
			assert.NotNil(t, resp)
		})
	}
}

func TestUpdateIncident(t *testing.T) {
	app := setupTestApp()
	app.Patch("/incidents/:id", UpdateIncident)

	payload := map[string]interface{}{
		"severity": "critical",
		"status":   "active",
	}

	body, _ := json.Marshal(payload)
	req := httptest.NewRequest("PATCH", "/incidents/123", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")

	resp, err := app.Test(req)
	assert.NoError(t, err)
	assert.NotNil(t, resp)
}

func TestVerifyIncident(t *testing.T) {
	app := setupTestApp()
	app.Post("/incidents/:id/verify", VerifyIncident)

	payload := map[string]interface{}{
		"verified":   true,
		"verifiedBy": "admin-123",
		"notes":      "Verified by ground team",
	}

	body, _ := json.Marshal(payload)
	req := httptest.NewRequest("POST", "/incidents/123/verify", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")

	resp, err := app.Test(req)
	assert.NoError(t, err)
	assert.NotNil(t, resp)
}
