package handlers

import (
	"log"
	"sync"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/websocket/v2"
)

// WebSocket connection pool
var (
	clients   = make(map[*websocket.Conn]bool)
	clientsMu sync.RWMutex
	broadcast = make(chan Message, 256)
)

// Message represents a WebSocket message
type Message struct {
	Type string      `json:"type"`
	Data interface{} `json:"data"`
}

// InitWebSocket starts the broadcast goroutine
func InitWebSocket() {
	go handleBroadcast()
	log.Println("✅ WebSocket broadcast handler initialized")
}

// HandleWebSocket handles WebSocket upgrade and connection
func HandleWebSocket(c *websocket.Conn) {
	// Register client
	clientsMu.Lock()
	clients[c] = true
	clientCount := len(clients)
	clientsMu.Unlock()

	log.Printf("WebSocket client connected (total: %d)", clientCount)

	// Send welcome message
	c.WriteJSON(Message{
		Type: "connected",
		Data: fiber.Map{
			"message": "Connected to Nexus Crisis Response WebSocket",
			"features": []string{
				"real-time incident updates",
				"crisis alerts",
				"resource coordination",
				"volunteer notifications",
			},
		},
	})

	defer func() {
		// Unregister client
		clientsMu.Lock()
		delete(clients, c)
		clientCount := len(clients)
		clientsMu.Unlock()

		c.Close()
		log.Printf("WebSocket client disconnected (total: %d)", clientCount)
	}()

	// Listen for messages from client
	for {
		var msg Message
		if err := c.ReadJSON(&msg); err != nil {
			log.Printf("WebSocket read error: %v", err)
			break
		}

		// Handle incoming messages
		handleClientMessage(c, msg)
	}
}

// handleClientMessage processes messages from clients
func handleClientMessage(c *websocket.Conn, msg Message) {
	switch msg.Type {
	case "ping":
		c.WriteJSON(Message{
			Type: "pong",
			Data: fiber.Map{"timestamp": "now"},
		})

	case "subscribe":
		// In production, implement channel subscriptions
		// e.g., subscribe to specific incident, region, alert type
		c.WriteJSON(Message{
			Type: "subscribed",
			Data: msg.Data,
		})

	default:
		log.Printf("Unknown message type: %s", msg.Type)
	}
}

// handleBroadcast sends messages to all connected clients
func handleBroadcast() {
	for {
		msg := <-broadcast

		clientsMu.RLock()
		clientList := make([]*websocket.Conn, 0, len(clients))
		for client := range clients {
			clientList = append(clientList, client)
		}
		clientsMu.RUnlock()

		// Send to all clients
		for _, client := range clientList {
			if err := client.WriteJSON(msg); err != nil {
				log.Printf("WebSocket write error: %v", err)
				// Remove failed client
				clientsMu.Lock()
				delete(clients, client)
				clientsMu.Unlock()
				client.Close()
			}
		}
	}
}

// BroadcastToAll broadcasts a message to all connected clients
func BroadcastToAll(messageType string, data interface{}) {
	select {
	case broadcast <- Message{Type: messageType, Data: data}:
	default:
		log.Println("Broadcast channel full, dropping message")
	}
}

// BroadcastIncidentUpdate broadcasts incident updates
func BroadcastIncidentUpdate(incidentID string, action string, data interface{}) {
	BroadcastToAll("incident_update", fiber.Map{
		"incident_id": incidentID,
		"action":      action,
		"data":        data,
	})
}

// GetWebSocketStats returns WebSocket connection statistics
func GetWebSocketStats(c *fiber.Ctx) error {
	clientsMu.RLock()
	count := len(clients)
	clientsMu.RUnlock()

	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"connected_clients": count,
			"broadcast_queue":   len(broadcast),
		},
	})
}
