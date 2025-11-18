package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// IncidentStatus represents the current status of an incident
type IncidentStatus string

const (
	StatusReported   IncidentStatus = "reported"
	StatusVerified   IncidentStatus = "verified"
	StatusResponding IncidentStatus = "responding"
	StatusResolved   IncidentStatus = "resolved"
	StatusFalseAlarm IncidentStatus = "false_alarm"
)

// IncidentType categorizes the type of crisis
type IncidentType string

const (
	TypeNaturalDisaster   IncidentType = "natural_disaster"
	TypeHealthEmergency   IncidentType = "health_emergency"
	TypeConflict          IncidentType = "conflict"
	TypeInfrastructure    IncidentType = "infrastructure"
	TypeEnvironmental     IncidentType = "environmental"
	TypeOther             IncidentType = "other"
)

// SeverityLevel indicates the severity of an incident
type SeverityLevel string

const (
	SeverityLow      SeverityLevel = "low"
	SeverityModerate SeverityLevel = "moderate"
	SeverityHigh     SeverityLevel = "high"
	SeverityCritical SeverityLevel = "critical"
)

// Incident represents a crisis incident report
type Incident struct {
	ID          uuid.UUID      `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Title       string         `gorm:"not null" json:"title"`
	Description string         `gorm:"type:text" json:"description"`
	Type        IncidentType   `gorm:"not null" json:"type"`
	Status      IncidentStatus `gorm:"default:'reported'" json:"status"`
	Severity    SeverityLevel  `gorm:"default:'moderate'" json:"severity"`

	// Geospatial data
	Latitude    float64 `gorm:"not null" json:"latitude"`
	Longitude   float64 `gorm:"not null" json:"longitude"`
	LocationName string `json:"location_name"`
	Address     string  `json:"address"`
	Country     string  `json:"country"`
	Region      string  `json:"region"`

	// Reporter information
	ReporterID   *uuid.UUID `gorm:"type:uuid" json:"reporter_id,omitempty"`
	ReporterName string     `json:"reporter_name"`
	ReporterContact string  `json:"reporter_contact"`

	// Impact assessment
	AffectedPeople int `json:"affected_people"`
	Casualties     int `json:"casualties"`

	// Media
	ImageURLs []string `gorm:"type:text[];column:image_urls" json:"image_urls"`
	VideoURLs []string `gorm:"type:text[];column:video_urls" json:"video_urls"`

	// Verification
	Verified       bool       `gorm:"default:false" json:"verified"`
	VerifiedBy     *uuid.UUID `gorm:"type:uuid" json:"verified_by,omitempty"`
	VerifiedAt     *time.Time `json:"verified_at,omitempty"`

	// Tags for categorization
	Tags []string `gorm:"type:text[]" json:"tags"`

	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

// Resource represents available resources for crisis response
type Resource struct {
	ID          uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Name        string    `gorm:"not null" json:"name"`
	Type        string    `gorm:"not null" json:"type"` // medical, shelter, food, water, transport, personnel
	Description string    `gorm:"type:text" json:"description"`

	// Availability
	Quantity  int  `json:"quantity"`
	Available bool `gorm:"default:true" json:"available"`

	// Location
	Latitude     float64 `json:"latitude"`
	Longitude    float64 `json:"longitude"`
	LocationName string  `json:"location_name"`
	Address      string  `json:"address"`

	// Provider information
	ProviderID      *uuid.UUID `gorm:"type:uuid" json:"provider_id,omitempty"`
	ProviderName    string     `json:"provider_name"`
	ProviderContact string     `json:"provider_contact"`
	Organization    string     `json:"organization"`

	// Deployment
	DeployedTo   *uuid.UUID `gorm:"type:uuid" json:"deployed_to,omitempty"` // Incident ID
	DeployedAt   *time.Time `json:"deployed_at,omitempty"`

	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

// Alert represents a crisis alert (CAP-compliant)
type Alert struct {
	ID         uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Identifier string    `gorm:"unique;not null" json:"identifier"` // CAP identifier

	// Alert metadata
	Sender      string    `gorm:"not null" json:"sender"`
	Sent        time.Time `gorm:"not null" json:"sent"`
	Status      string    `gorm:"not null" json:"status"` // Actual, Exercise, System, Test
	MessageType string    `gorm:"not null" json:"msg_type"` // Alert, Update, Cancel
	Scope       string    `gorm:"not null" json:"scope"` // Public, Restricted, Private

	// Event description
	Event       string        `gorm:"not null" json:"event"`
	Category    string        `gorm:"not null" json:"category"` // Geo, Met, Safety, Security, Rescue, Fire, Health, Env, Transport, Infra, CBRNE, Other
	Urgency     string        `gorm:"not null" json:"urgency"` // Immediate, Expected, Future, Past, Unknown
	Severity    SeverityLevel `gorm:"not null" json:"severity"`
	Certainty   string        `gorm:"not null" json:"certainty"` // Observed, Likely, Possible, Unlikely, Unknown

	// Alert content
	Headline    string `json:"headline"`
	Description string `gorm:"type:text;not null" json:"description"`
	Instruction string `gorm:"type:text" json:"instruction"`

	// Temporal
	Effective *time.Time `json:"effective,omitempty"`
	Onset     *time.Time `json:"onset,omitempty"`
	Expires   *time.Time `json:"expires,omitempty"`

	// Geographic area
	AreaDesc   string   `json:"area_desc"`
	Polygons   []string `gorm:"type:text[]" json:"polygons,omitempty"` // WGS-84 coordinate pairs
	Circles    []string `gorm:"type:text[]" json:"circles,omitempty"`  // latitude,longitude radius

	// Related incident
	IncidentID *uuid.UUID `gorm:"type:uuid" json:"incident_id,omitempty"`

	// Broadcast status
	Broadcasted   bool       `gorm:"default:false" json:"broadcasted"`
	BroadcastedAt *time.Time `json:"broadcasted_at,omitempty"`
	Recipients    int        `json:"recipients"`

	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

// Volunteer represents a registered volunteer
type Volunteer struct {
	ID       uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	UserID   *uuid.UUID `gorm:"type:uuid;unique" json:"user_id,omitempty"` // Link to auth service

	// Personal information
	FullName    string `gorm:"not null" json:"full_name"`
	Email       string `gorm:"not null" json:"email"`
	Phone       string `json:"phone"`
	Age         int    `json:"age"`
	Gender      string `json:"gender"`

	// Skills and qualifications
	Skills          []string `gorm:"type:text[]" json:"skills"`
	Certifications  []string `gorm:"type:text[]" json:"certifications"`
	Languages       []string `gorm:"type:text[]" json:"languages"`
	MedicalTraining bool     `gorm:"default:false" json:"medical_training"`

	// Location
	Latitude     float64 `json:"latitude"`
	Longitude    float64 `json:"longitude"`
	LocationName string  `json:"location_name"`
	Address      string  `json:"address"`
	Country      string  `json:"country"`

	// Availability
	Available       bool   `gorm:"default:true" json:"available"`
	AvailabilityNote string `json:"availability_note"`

	// Deployment
	CurrentlyDeployed bool       `gorm:"default:false" json:"currently_deployed"`
	DeployedTo        *uuid.UUID `gorm:"type:uuid" json:"deployed_to,omitempty"` // Incident ID
	DeployedAt        *time.Time `json:"deployed_at,omitempty"`

	// Background check
	BackgroundChecked   bool       `gorm:"default:false" json:"background_checked"`
	BackgroundCheckedAt *time.Time `json:"background_checked_at,omitempty"`

	// Metrics
	ResponsesCount    int       `gorm:"default:0" json:"responses_count"`
	HoursVolunteered  float64   `gorm:"default:0" json:"hours_volunteered"`
	LastActiveAt      *time.Time `json:"last_active_at,omitempty"`

	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

// Update represents an update to an incident
type Update struct {
	ID          uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	IncidentID  uuid.UUID `gorm:"type:uuid;not null" json:"incident_id"`

	// Update content
	Title       string `gorm:"not null" json:"title"`
	Description string `gorm:"type:text;not null" json:"description"`
	UpdateType  string `json:"update_type"` // status_change, new_info, resource_update, resolution

	// Author
	AuthorID   *uuid.UUID `gorm:"type:uuid" json:"author_id,omitempty"`
	AuthorName string     `json:"author_name"`

	// Media
	ImageURLs []string `gorm:"type:text[]" json:"image_urls"`

	CreatedAt time.Time      `json:"created_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}
