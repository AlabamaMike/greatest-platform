package config

import (
	"log"
	"os"
	"time"

	"github.com/joho/godotenv"
)

type Config struct {
	// Server
	Port        string
	Environment string

	// Database
	DBHost     string
	DBPort     string
	DBUser     string
	DBPassword string
	DBName     string

	// Redis
	RedisHost     string
	RedisPort     string
	RedisPassword string

	// Kafka
	KafkaBrokers    []string
	KafkaTopicPrefix string

	// Service URLs
	AuthServiceURL string
	AIMLServiceURL string

	// WebSocket
	WSEnabled      bool
	WSPingInterval time.Duration

	// Alert System
	AlertBroadcastEnabled bool
	SMSGatewayURL         string
	EmailGatewayURL       string

	// Geospatial
	DefaultMapCenterLat float64
	DefaultMapCenterLon float64
	DefaultMapZoom      int
}

func Load() *Config {
	// Load .env file if it exists
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	return &Config{
		Port:        getEnv("PORT", "3007"),
		Environment: getEnv("NODE_ENV", "development"),

		DBHost:     getEnv("DB_HOST", "localhost"),
		DBPort:     getEnv("DB_PORT", "5432"),
		DBUser:     getEnv("DB_USER", "nexus"),
		DBPassword: getEnv("DB_PASSWORD", "nexus_secure_pass"),
		DBName:     getEnv("DB_NAME", "nexus_crisis"),

		RedisHost:     getEnv("REDIS_HOST", "localhost"),
		RedisPort:     getEnv("REDIS_PORT", "6379"),
		RedisPassword: getEnv("REDIS_PASSWORD", ""),

		KafkaBrokers:    []string{getEnv("KAFKA_BROKERS", "localhost:9092")},
		KafkaTopicPrefix: getEnv("KAFKA_TOPIC_PREFIX", "nexus.crisis"),

		AuthServiceURL: getEnv("AUTH_SERVICE_URL", "http://localhost:3001"),
		AIMLServiceURL: getEnv("AI_ML_SERVICE_URL", "http://localhost:8001"),

		WSEnabled:      getEnv("WS_ENABLED", "true") == "true",
		WSPingInterval: 30 * time.Second,

		AlertBroadcastEnabled: getEnv("ALERT_BROADCAST_ENABLED", "true") == "true",
		SMSGatewayURL:         getEnv("SMS_GATEWAY_URL", ""),
		EmailGatewayURL:       getEnv("EMAIL_GATEWAY_URL", ""),

		DefaultMapCenterLat: 0.0,
		DefaultMapCenterLon: 0.0,
		DefaultMapZoom:      2,
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
