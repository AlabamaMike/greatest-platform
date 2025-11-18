package services

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/nexus-platform/crisis-service/config"
	"github.com/redis/go-redis/v9"
)

type RedisService struct {
	client *redis.Client
}

var Redis *RedisService

// InitRedis initializes the Redis service
func InitRedis(cfg *config.Config) error {
	client := redis.NewClient(&redis.Options{
		Addr:     fmt.Sprintf("%s:%s", cfg.RedisHost, cfg.RedisPort),
		Password: cfg.RedisPassword,
		DB:       0,
	})

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := client.Ping(ctx).Result()
	if err != nil {
		return fmt.Errorf("failed to connect to Redis: %w", err)
	}

	Redis = &RedisService{
		client: client,
	}

	log.Println("✅ Redis connected successfully")
	return nil
}

// Set stores a key-value pair with optional expiration
func (r *RedisService) Set(ctx context.Context, key string, value interface{}, expiration time.Duration) error {
	return r.client.Set(ctx, key, value, expiration).Err()
}

// Get retrieves a value by key
func (r *RedisService) Get(ctx context.Context, key string) (string, error) {
	return r.client.Get(ctx, key).Result()
}

// Delete removes a key
func (r *RedisService) Delete(ctx context.Context, key string) error {
	return r.client.Del(ctx, key).Err()
}

// Exists checks if a key exists
func (r *RedisService) Exists(ctx context.Context, key string) (bool, error) {
	count, err := r.client.Exists(ctx, key).Result()
	return count > 0, err
}

// Close closes the Redis connection
func (r *RedisService) Close() error {
	return r.client.Close()
}
