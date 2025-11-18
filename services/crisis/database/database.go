package database

import (
	"fmt"
	"log"

	"github.com/nexus-platform/crisis-service/config"
	"github.com/nexus-platform/crisis-service/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

// Connect establishes database connection and runs migrations
func Connect(cfg *config.Config) error {
	dsn := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		cfg.DBHost, cfg.DBPort, cfg.DBUser, cfg.DBPassword, cfg.DBName,
	)

	logLevel := logger.Silent
	if cfg.Environment == "development" {
		logLevel = logger.Info
	}

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logLevel),
	})
	if err != nil {
		return fmt.Errorf("failed to connect to database: %w", err)
	}

	DB = db

	log.Println("✅ Database connected successfully")

	return nil
}

// Migrate runs auto-migration for all models
func Migrate() error {
	log.Println("Running database migrations...")

	err := DB.AutoMigrate(
		&models.Incident{},
		&models.Resource{},
		&models.Alert{},
		&models.Volunteer{},
		&models.Update{},
	)

	if err != nil {
		return fmt.Errorf("failed to migrate database: %w", err)
	}

	log.Println("✅ Database migrations completed")

	return nil
}

// Close closes the database connection
func Close() error {
	sqlDB, err := DB.DB()
	if err != nil {
		return err
	}
	return sqlDB.Close()
}
