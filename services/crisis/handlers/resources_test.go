package handlers

import (
	"bytes"
	"encoding/json"
	"net/http/httptest"
	"testing"

	"github.com/gofiber/fiber/v2"
	"github.com/stretchr/testify/assert"
)

func TestRegisterResource(t *testing.T) {
	app := setupTestApp()
	app.Post("/resources", RegisterResource)

	payload := map[string]interface{}{
		"type":     "ambulance",
		"name":     "Ambulance Unit 5",
		"capacity": 2,
		"status":   "available",
		"location": map[string]interface{}{
			"latitude":  40.7128,
			"longitude": -74.0060,
		},
		"equipment": []string{"defibrillator", "oxygen", "stretcher"},
	}

	body, _ := json.Marshal(payload)
	req := httptest.NewRequest("POST", "/resources", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")

	resp, err := app.Test(req)
	assert.NoError(t, err)
	assert.NotNil(t, resp)
}

func TestGetResources(t *testing.T) {
	app := setupTestApp()
	app.Get("/resources", GetResources)

	tests := []struct {
		name     string
		query    string
		expected int
	}{
		{
			name:     "Get all resources",
			query:    "",
			expected: 200,
		},
		{
			name:     "Get available resources",
			query:    "?status=available",
			expected: 200,
		},
		{
			name:     "Get resources by type",
			query:    "?type=ambulance",
			expected: 200,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := httptest.NewRequest("GET", "/resources"+tt.query, nil)
			resp, err := app.Test(req)

			assert.NoError(t, err)
			assert.Equal(t, tt.expected, resp.StatusCode)
		})
	}
}

func TestDeployResource(t *testing.T) {
	app := setupTestApp()
	app.Post("/resources/:id/deploy", DeployResource)

	payload := map[string]interface{}{
		"incidentId": "incident-123",
		"destination": map[string]interface{}{
			"latitude":  40.7580,
			"longitude": -73.9855,
		},
		"notes": "Deploy to Times Square",
	}

	body, _ := json.Marshal(payload)
	req := httptest.NewRequest("POST", "/resources/123/deploy", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")

	resp, err := app.Test(req)
	assert.NoError(t, err)
	assert.NotNil(t, resp)
}
