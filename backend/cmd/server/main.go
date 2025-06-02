package main

import (
    "log"
    "net/http"
    "backend/internal/config"
    "backend/internal/database"
    "backend/internal/routes"
    "os"

    "github.com/gin-contrib/cors"
    "github.com/gin-gonic/gin"
    "github.com/joho/godotenv"
)

func main() {
    // Load environment variables
    if err := godotenv.Load(); err != nil {
        log.Println("Warning: .env file not found, using system environment variables")
    }

    // Load configuration
    cfg := config.Load()

    // Initialize database
    db, err := database.Init(cfg.Database)
    if err != nil {
        log.Fatal("Failed to connect to database:", err)
    }
    defer db.Close()

    // Set Gin mode
    gin.SetMode(cfg.Server.Mode)

    // Create Gin router
    router := gin.Default()

    // CORS middleware
    corsConfig := cors.Config{
        AllowOrigins:     cfg.CORS.AllowedOrigins,
        AllowMethods:     cfg.CORS.AllowedMethods,
        AllowHeaders:     cfg.CORS.AllowedHeaders,
        AllowCredentials: true,
    }
    router.Use(cors.New(corsConfig))

    // Request logging middleware
    router.Use(gin.Logger())
    
    // Recovery middleware
    router.Use(gin.Recovery())

    // Health check endpoint
    router.GET("/health", func(c *gin.Context) {
        c.JSON(http.StatusOK, gin.H{
            "status":  "healthy",
            "service": "novelsync-backend",
        })
    })

    // Setup routes
    routes.SetupRoutes(router, db, cfg)

    // Create upload directory if it doesn't exist
    if err := os.MkdirAll(cfg.Upload.Path, 0755); err != nil {
        log.Printf("Warning: Failed to create upload directory: %v", err)
    }

    // Start server
    log.Printf("Server starting on port %s", cfg.Server.Port)
    log.Printf("CORS enabled for origins: %v", cfg.CORS.AllowedOrigins)
    
    if err := router.Run(":" + cfg.Server.Port); err != nil {
        log.Fatal("Failed to start server:", err)
    }
}