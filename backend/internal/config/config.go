package config

import (
    "os"
    "strconv"
    "strings"
    "time"
)

type Config struct {
    Database DatabaseConfig
    Server   ServerConfig
    JWT      JWTConfig
    CORS     CORSConfig
    Upload   UploadConfig
    Session  SessionConfig
}

type DatabaseConfig struct {
    Host     string
    Port     string
    User     string
    Password string
    Name     string
}

type ServerConfig struct {
    Port string
    Mode string
}

type JWTConfig struct {
    Secret string
}

type CORSConfig struct {
    AllowedOrigins []string
    AllowedMethods []string
    AllowedHeaders []string
}

type UploadConfig struct {
    MaxSize int64
    Path    string
}

type SessionConfig struct {
    Duration time.Duration
}

func Load() *Config {
    return &Config{
        Database: DatabaseConfig{
            Host:     getEnv("DB_HOST", "localhost"),
            Port:     getEnv("DB_PORT", "3306"),
            User:     getEnv("DB_USER", "root"),
            Password: getEnv("DB_PASSWORD", ""),
            Name:     getEnv("DB_NAME", "novelsync"),
        },
        Server: ServerConfig{
            Port: getEnv("PORT", "8080"),
            Mode: getEnv("GIN_MODE", "debug"),
        },
        JWT: JWTConfig{
            Secret: getEnv("JWT_SECRET", "your-default-secret-change-this"),
        },
        CORS: CORSConfig{
            AllowedOrigins: strings.Split(getEnv("CORS_ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:5173"), ","),
            AllowedMethods: strings.Split(getEnv("CORS_ALLOWED_METHODS", "GET,POST,PUT,DELETE,OPTIONS"), ","),
            AllowedHeaders: strings.Split(getEnv("CORS_ALLOWED_HEADERS", "Origin,Content-Type,Accept,Authorization,X-Requested-With"), ","),
        },
        Upload: UploadConfig{
            MaxSize: getEnvInt64("MAX_UPLOAD_SIZE", 10485760), // 10MB
            Path:    getEnv("UPLOAD_PATH", "./uploads"),
        },
        Session: SessionConfig{
            Duration: getEnvDuration("SESSION_DURATION", 24*time.Hour),
        },
    }
}

func getEnv(key, defaultValue string) string {
    if value := os.Getenv(key); value != "" {
        return value
    }
    return defaultValue
}

func getEnvInt64(key string, defaultValue int64) int64 {
    if value := os.Getenv(key); value != "" {
        if parsed, err := strconv.ParseInt(value, 10, 64); err == nil {
            return parsed
        }
    }
    return defaultValue
}

func getEnvDuration(key string, defaultValue time.Duration) time.Duration {
    if value := os.Getenv(key); value != "" {
        if parsed, err := time.ParseDuration(value); err == nil {
            return parsed
        }
    }
    return defaultValue
}