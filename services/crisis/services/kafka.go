package services

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/nexus-platform/crisis-service/config"
	"github.com/segmentio/kafka-go"
)

type KafkaService struct {
	writer *kafka.Writer
	config *config.Config
}

var Kafka *KafkaService

// InitKafka initializes the Kafka service
func InitKafka(cfg *config.Config) {
	writer := &kafka.Writer{
		Addr:         kafka.TCP(cfg.KafkaBrokers...),
		Balancer:     &kafka.LeastBytes{},
		RequiredAcks: kafka.RequireOne,
		MaxAttempts:  3,
		BatchTimeout: 10 * time.Millisecond,
	}

	Kafka = &KafkaService{
		writer: writer,
		config: cfg,
	}

	log.Println("✅ Kafka service initialized")
}

// PublishEvent publishes an event to Kafka
func (k *KafkaService) PublishEvent(topic string, key string, data interface{}) error {
	payload, err := json.Marshal(data)
	if err != nil {
		return fmt.Errorf("failed to marshal event data: %w", err)
	}

	fullTopic := fmt.Sprintf("%s.%s", k.config.KafkaTopicPrefix, topic)

	message := kafka.Message{
		Topic: fullTopic,
		Key:   []byte(key),
		Value: payload,
		Time:  time.Now(),
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	err = k.writer.WriteMessages(ctx, message)
	if err != nil {
		return fmt.Errorf("failed to write message to Kafka: %w", err)
	}

	log.Printf("📤 Event published to %s: %s", fullTopic, key)
	return nil
}

// PublishIncidentCreated publishes incident.created event
func (k *KafkaService) PublishIncidentCreated(incidentID string, data interface{}) error {
	return k.PublishEvent("incident.created", incidentID, data)
}

// PublishIncidentUpdated publishes incident.updated event
func (k *KafkaService) PublishIncidentUpdated(incidentID string, data interface{}) error {
	return k.PublishEvent("incident.updated", incidentID, data)
}

// PublishAlertBroadcasted publishes alert.broadcasted event
func (k *KafkaService) PublishAlertBroadcasted(alertID string, data interface{}) error {
	return k.PublishEvent("alert.broadcasted", alertID, data)
}

// PublishResourceDeployed publishes resource.deployed event
func (k *KafkaService) PublishResourceDeployed(resourceID string, data interface{}) error {
	return k.PublishEvent("resource.deployed", resourceID, data)
}

// PublishVolunteerRegistered publishes volunteer.registered event
func (k *KafkaService) PublishVolunteerRegistered(volunteerID string, data interface{}) error {
	return k.PublishEvent("volunteer.registered", volunteerID, data)
}

// Close closes the Kafka writer
func (k *KafkaService) Close() error {
	return k.writer.Close()
}
