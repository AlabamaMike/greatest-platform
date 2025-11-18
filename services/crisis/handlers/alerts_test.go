package handlers

import (
	"bytes"
	"encoding/json"
	"net/http/httptest"
	"testing"

	"github.com/gofiber/fiber/v2"
	"github.com/stretchr/testify/assert"
)

func TestCreateAlert(t *testing.T) {
	app := setupTestApp()
	app.Post("/alerts", CreateAlert)

	payload := map[string]interface{}{
		"type":        "earthquake",
		"severity":    "severe",
		"headline":    "Earthquake Warning",
		"description": "Magnitude 7.0 earthquake detected",
		"area": map[string]interface{}{
			"polygon": [][]float64{
				{40.0, -74.0},
				{41.0, -74.0},
				{41.0, -73.0},
				{40.0, -73.0},
			},
		},
		"expires": "2025-11-18T23:59:59Z",
	}

	body, _ := json.Marshal(payload)
	req := httptest.NewRequest("POST", "/alerts", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")

	resp, err := app.Test(req)
	assert.NoError(t, err)
	assert.NotNil(t, resp)
}

func TestGetAlerts(t *testing.T) {
	app := setupTestApp()
	app.Get("/alerts", GetAlerts)

	tests := []struct {
		name     string
		query    string
		expected int
	}{
		{
			name:     "Get all alerts",
			query:    "",
			expected: 200,
		},
		{
			name:     "Get active alerts",
			query:    "?status=active",
			expected: 200,
		},
		{
			name:     "Get alerts by type",
			query:    "?type=earthquake",
			expected: 200,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := httptest.NewRequest("GET", "/alerts"+tt.query, nil)
			resp, err := app.Test(req)

			assert.NoError(t, err)
			assert.Equal(t, tt.expected, resp.StatusCode)
		})
	}
}

func TestGetAlert(t *testing.T) {
	app := setupTestApp()
	app.Get("/alerts/:id", GetAlert)

	req := httptest.NewRequest("GET", "/alerts/123", nil)
	resp, err := app.Test(req)

	assert.NoError(t, err)
	assert.NotNil(t, resp)
}

func TestCancelAlert(t *testing.T) {
	app := setupTestApp()
	app.Post("/alerts/:id/cancel", CancelAlert)

	payload := map[string]interface{}{
		"reason": "Threat has passed",
	}

	body, _ := json.Marshal(payload)
	req := httptest.NewRequest("POST", "/alerts/123/cancel", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")

	resp, err := app.Test(req)
	assert.NoError(t, err)
	assert.NotNil(t, resp)
}
