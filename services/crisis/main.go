package main

import (
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/gofiber/websocket/v2"
	"github.com/nexus-platform/crisis-service/config"
	"github.com/nexus-platform/crisis-service/database"
	"github.com/nexus-platform/crisis-service/handlers"
	"github.com/nexus-platform/crisis-service/models"
	"github.com/nexus-platform/crisis-service/services"
)


func main() {
	// Load configuration
	cfg := config.Load()

	// Initialize Fiber app
	app := fiber.New(fiber.Config{
		AppName:      "Nexus Crisis Response Service",
		ServerHeader: "Nexus-Crisis",
		ErrorHandler: errorHandler,
	})

	// Middleware
	app.Use(recover.New())
	app.Use(logger.New(logger.Config{
		Format: "[${time}] ${status} - ${method} ${path} (${latency})\n",
	}))
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
		AllowMethods: "GET, POST, PUT, PATCH, DELETE, OPTIONS",
	}))

	// Initialize services
	log.Println("🚀 Starting Nexus Crisis Response Service...")

	// Database
	if err := database.Connect(cfg); err != nil {
		log.Fatalf("❌ Database connection failed: %v", err)
	}

	if err := database.Migrate(); err != nil {
		log.Fatalf("❌ Database migration failed: %v", err)
	}

	// Redis
	if err := services.InitRedis(cfg); err != nil {
		log.Printf("⚠️  Redis connection failed: %v (continuing without cache)", err)
	}

	// Kafka
	services.InitKafka(cfg)

	// WebSocket
	if cfg.WSEnabled {
		handlers.InitWebSocket()
	}

	// Routes
	setupRoutes(app, cfg)

	// Graceful shutdown
	go func() {
		sigChan := make(chan os.Signal, 1)
		signal.Notify(sigChan, os.Interrupt, syscall.SIGTERM)
		<-sigChan

		log.Println("\n🛑 Shutting down gracefully...")

		// Cleanup
		if services.Kafka != nil {
			services.Kafka.Close()
		}
		if services.Redis != nil {
			services.Redis.Close()
		}
		database.Close()

		app.Shutdown()
		os.Exit(0)
	}()

	// Start server
	log.Printf("✅ Server ready on port %s", cfg.Port)
	log.Println("🆘 Real-time crisis mapping - Coordinating emergency response!")
	log.Println("🗺️  Features: Incident reporting, Resource coordination, Early warnings, Volunteer management")

	if err := app.Listen(":" + cfg.Port); err != nil {
		log.Fatalf("❌ Server failed to start: %v", err)
	}
}

func setupRoutes(app *fiber.App, cfg *config.Config) {
	// Health check
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status":    "healthy",
			"service":   "crisis-response-service",
			"version":   "1.0.0",
			"timestamp": c.Context().Time().Format("2006-01-02T15:04:05Z07:00"),
		})
	})

	// API v1 routes
	api := app.Group("/api/v1/crisis")

	// Incidents
	api.Post("/incidents", handlers.CreateIncident)
	api.Get("/incidents", handlers.GetIncidents)
	api.Get("/incidents/:id", handlers.GetIncident)
	api.Patch("/incidents/:id", handlers.UpdateIncident)
	api.Post("/incidents/:id/verify", handlers.VerifyIncident)
	api.Post("/incidents/:id/updates", handlers.AddIncidentUpdate)
	api.Get("/incidents/:id/resources", handlers.GetResourcesByIncident)
	api.Get("/incidents/:id/volunteers", handlers.GetVolunteersByIncident)

	// Crisis Map
	api.Get("/map", handlers.GetMapData)

	// Resources
	api.Post("/resources", handlers.RegisterResource)
	api.Get("/resources", handlers.GetResources)
	api.Post("/resources/:id/deploy", handlers.DeployResource)

	// Alerts (CAP-compliant)
	api.Post("/alerts", handlers.CreateAlert)
	api.Get("/alerts", handlers.GetAlerts)
	api.Get("/alerts/:id", handlers.GetAlert)
	api.Post("/alerts/:id/cancel", handlers.CancelAlert)

	// Volunteers
	api.Post("/volunteers", handlers.RegisterVolunteer)
	api.Get("/volunteers", handlers.GetVolunteers)
	api.Get("/volunteers/:id", handlers.GetVolunteer)
	api.Post("/volunteers/:id/deploy", handlers.DeployVolunteer)
	api.Patch("/volunteers/:id/availability", handlers.UpdateVolunteerAvailability)
	api.Post("/volunteers/match", handlers.MatchVolunteers)

	// WebSocket
	if cfg.WSEnabled {
		app.Get("/ws", websocket.New(handlers.HandleWebSocket))
		api.Get("/ws/stats", handlers.GetWebSocketStats)
	}

	// Stats and analytics
	api.Get("/stats", func(c *fiber.Ctx) error {
		// Get counts from database
		var incidentCount, resourceCount, volunteerCount, alertCount int64
		database.DB.Model(&models.Incident{}).Count(&incidentCount)
		database.DB.Model(&models.Resource{}).Count(&resourceCount)
		database.DB.Model(&models.Volunteer{}).Count(&volunteerCount)
		database.DB.Model(&models.Alert{}).Count(&alertCount)

		return c.JSON(fiber.Map{
			"success": true,
			"data": fiber.Map{
				"total_incidents":   incidentCount,
				"total_resources":   resourceCount,
				"total_volunteers":  volunteerCount,
				"total_alerts":      alertCount,
				"websocket_enabled": cfg.WSEnabled,
			},
		})
	})
}

func errorHandler(c *fiber.Ctx, err error) error {
	code := fiber.StatusInternalServerError

	if e, ok := err.(*fiber.Error); ok {
		code = e.Code
	}

	return c.Status(code).JSON(fiber.Map{
		"success": false,
		"error":   err.Error(),
		"code":    code,
	})
}
