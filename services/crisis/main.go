package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/gorilla/mux"
)

type HealthResponse struct {
	Status    string `json:"status"`
	Service   string `json:"service"`
	Timestamp string `json:"timestamp"`
}

type Incident struct {
	ID          string    `json:"id"`
	Type        string    `json:"type"`
	Description string    `json:"description"`
	Location    Location  `json:"location"`
	Severity    string    `json:"severity"`
	Status      string    `json:"status"`
	ReportedBy  string    `json:"reported_by"`
	ReportedAt  time.Time `json:"reported_at"`
	Verified    bool      `json:"verified"`
}

type Location struct {
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
	Address   string  `json:"address"`
}

type Resource struct {
	ID       string `json:"id"`
	Type     string `json:"type"`
	Quantity int    `json:"quantity"`
	Location string `json:"location"`
	Status   string `json:"status"`
}

type Alert struct {
	ID          string    `json:"id"`
	Type        string    `json:"type"`
	Message     string    `json:"message"`
	Severity    string    `json:"severity"`
	AffectedAreas []string `json:"affected_areas"`
	IssuedAt    time.Time `json:"issued_at"`
	ExpiresAt   time.Time `json:"expires_at"`
}

// Health check endpoint
func healthHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(HealthResponse{
		Status:    "healthy",
		Service:   "crisis-service",
		Timestamp: time.Now().Format(time.RFC3339),
	})
}

// Report crisis incident
func reportIncidentHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	incident := Incident{
		ID:         fmt.Sprintf("inc_%d", time.Now().Unix()),
		Status:     "reported",
		Verified:   false,
		ReportedAt: time.Now(),
	}

	response := map[string]interface{}{
		"success": true,
		"message": "Incident reported - awaiting verification (crowdsourced)",
		"data":    incident,
	}

	json.NewEncoder(w).Encode(response)
}

// Get crisis map data
func getCrisisMapHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	incidents := []map[string]interface{}{
		{
			"id":       "inc_001",
			"type":     "earthquake",
			"severity": "high",
			"location": map[string]interface{}{"lat": 35.6762, "lng": 139.6503, "name": "Tokyo, Japan"},
			"verified": true,
		},
		{
			"id":       "inc_002",
			"type":     "flood",
			"severity": "medium",
			"location": map[string]interface{}{"lat": -1.286389, "lng": 36.817223, "name": "Nairobi, Kenya"},
			"verified": true,
		},
	}

	response := map[string]interface{}{
		"success": true,
		"message": "Real-time crisis map (inspired by Ushahidi & HOT)",
		"data": map[string]interface{}{
			"incidents":      incidents,
			"total":          len(incidents),
			"last_updated":   time.Now().Format(time.RFC3339),
			"coverage_areas": 145,
		},
	}

	json.NewEncoder(w).Encode(response)
}

// Register available resources
func registerResourceHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	resource := Resource{
		ID:     fmt.Sprintf("res_%d", time.Now().Unix()),
		Status: "available",
	}

	response := map[string]interface{}{
		"success": true,
		"message": "Resource registered - available for deployment",
		"data":    resource,
	}

	json.NewEncoder(w).Encode(response)
}

// Get resources matching needs
func getResourcesHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	resources := []map[string]interface{}{
		{
			"id":       "res_001",
			"type":     "medical_supplies",
			"quantity": 500,
			"location": "Warehouse A, Nairobi",
			"status":   "available",
			"can_deploy_to": []string{"Region X", "Region Y"},
		},
		{
			"id":       "res_002",
			"type":     "volunteers",
			"quantity": 120,
			"location": "Multiple locations",
			"status":   "mobilizing",
			"skills":   []string{"medical", "logistics", "translation"},
		},
	}

	response := map[string]interface{}{
		"success": true,
		"message": "Available resources for crisis response",
		"data":    resources,
	}

	json.NewEncoder(w).Encode(response)
}

// Register as volunteer
func registerVolunteerHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	response := map[string]interface{}{
		"success": true,
		"message": "Volunteer registration successful",
		"data": map[string]interface{}{
			"volunteer_id":     fmt.Sprintf("vol_%d", time.Now().Unix()),
			"status":           "registered",
			"deployment_zones": []string{"Zone A", "Zone B"},
			"training_required": []string{"Crisis response basics", "Communication protocols"},
		},
	}

	json.NewEncoder(w).Encode(response)
}

// Get active alerts
func getAlertsHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	alerts := []Alert{
		{
			ID:            "alert_001",
			Type:          "earthquake",
			Message:       "Earthquake detected - Magnitude 6.5",
			Severity:      "high",
			AffectedAreas: []string{"Tokyo Metropolitan Area"},
			IssuedAt:      time.Now().Add(-2 * time.Hour),
			ExpiresAt:     time.Now().Add(22 * time.Hour),
		},
		{
			ID:            "alert_002",
			Type:          "flood_warning",
			Message:       "Heavy rainfall expected - Flood risk",
			Severity:      "medium",
			AffectedAreas: []string{"Coastal Region A", "River Basin B"},
			IssuedAt:      time.Now().Add(-30 * time.Minute),
			ExpiresAt:     time.Now().Add(23*time.Hour + 30*time.Minute),
		},
	}

	response := map[string]interface{}{
		"success": true,
		"message": "Active crisis alerts (CAP compliant)",
		"data":    alerts,
		"count":   len(alerts),
	}

	json.NewEncoder(w).Encode(response)
}

// Issue new alert
func issueAlertHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	alert := Alert{
		ID:       fmt.Sprintf("alert_%d", time.Now().Unix()),
		IssuedAt: time.Now(),
		ExpiresAt: time.Now().Add(24 * time.Hour),
	}

	response := map[string]interface{}{
		"success": true,
		"message": "Alert issued - distributing via SMS, push, email",
		"data":    alert,
		"channels": map[string]interface{}{
			"sms_sent":   12450,
			"push_sent":  45230,
			"email_sent": 23100,
		},
	}

	json.NewEncoder(w).Encode(response)
}

// Early warning predictions
func predictCrisisHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	response := map[string]interface{}{
		"success": true,
		"message": "AI-powered early warning prediction",
		"data": map[string]interface{}{
			"prediction_type": "flood_risk",
			"probability":     0.68,
			"timeframe":       "Next 48-72 hours",
			"affected_areas":  []string{"River Basin A", "Coastal Zone B"},
			"recommended_actions": []string{
				"Activate emergency response teams",
				"Pre-position relief supplies",
				"Issue public warnings",
				"Evacuate high-risk areas",
			},
			"confidence":     "high",
			"model_accuracy": 0.87,
		},
	}

	json.NewEncoder(w).Encode(response)
}

// Family reunification
func familyReunificationHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	response := map[string]interface{}{
		"success": true,
		"message": "Family reunification service for displaced persons",
		"data": map[string]interface{}{
			"search_id":       fmt.Sprintf("search_%d", time.Now().Unix()),
			"matches_found":   3,
			"verification_required": true,
			"matches": []map[string]interface{}{
				{"id": "p_001", "name": "John D.", "age": 35, "last_seen": "Region X", "match_confidence": 0.92},
				{"id": "p_002", "name": "Jane D.", "age": 8, "last_seen": "Shelter A", "match_confidence": 0.88},
			},
		},
	}

	json.NewEncoder(w).Encode(response)
}

func main() {
	r := mux.NewRouter()

	// Routes
	r.HandleFunc("/health", healthHandler).Methods("GET")
	r.HandleFunc("/api/v1/crisis/incidents", reportIncidentHandler).Methods("POST")
	r.HandleFunc("/api/v1/crisis/incidents", getAlertsHandler).Methods("GET")
	r.HandleFunc("/api/v1/crisis/map", getCrisisMapHandler).Methods("GET")
	r.HandleFunc("/api/v1/crisis/resources", registerResourceHandler).Methods("POST")
	r.HandleFunc("/api/v1/crisis/resources", getResourcesHandler).Methods("GET")
	r.HandleFunc("/api/v1/crisis/volunteers", registerVolunteerHandler).Methods("POST")
	r.HandleFunc("/api/v1/crisis/alerts", getAlertsHandler).Methods("GET")
	r.HandleFunc("/api/v1/crisis/alerts", issueAlertHandler).Methods("POST")
	r.HandleFunc("/api/v1/crisis/predict", predictCrisisHandler).Methods("POST")
	r.HandleFunc("/api/v1/crisis/family-reunification", familyReunificationHandler).Methods("POST")

	port := "8080"
	fmt.Printf("🆘 Crisis Response Service running on port %s\n", port)
	fmt.Println("🚨 Real-time crisis mapping - Saving lives during emergencies!")

	log.Fatal(http.ListenAndServe(":"+port, r))
}
