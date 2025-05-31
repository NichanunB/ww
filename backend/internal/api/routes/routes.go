package routes

import (
	apiHandlers "backend/internal/api/handlers"
	apiMiddleware "backend/internal/api/middleware"
	"backend/internal/config"
	"backend/internal/models"
	"backend/internal/services"
	"database/sql"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

// SetupAPIRoutes configures all API routes
func SetupAPIRoutes(router *gin.Engine, db *sql.DB, cfg *config.Config) {
    // Initialize services
    authService := services.NewAuthService(db, cfg)
    projectService := services.NewProjectService(db)
    characterService := services.NewCharacterService(db)

    // Initialize API handlers
    authHandler := apiHandlers.NewAuthAPIHandler(authService)
    projectHandler := apiHandlers.NewProjectAPIHandler(projectService, characterService)

    // API middleware
    router.Use(apiMiddleware.CORSMiddleware(cfg.CORS.AllowedOrigins))
    router.Use(apiMiddleware.APILoggingMiddleware())
    router.Use(apiMiddleware.SecurityLoggingMiddleware())
    router.Use(apiMiddleware.PerformanceLoggingMiddleware(time.Second * 2)) // Log requests > 2s

    // API v1 routes
    v1 := router.Group("/api/v1")
    {
        // Health check
        v1.GET("/health", func(c *gin.Context) {
            c.JSON(http.StatusOK, models.APIResponse{
                Success: true,
                Message: "API is healthy",
                Data: gin.H{
                    "service": "novelsync-api",
                    "version": "1.0.0",
                    "timestamp": time.Now().UTC(),
                },
            })
        })

        // Public routes (no authentication required)
        public := v1.Group("")
        {
            // Authentication routes
            auth := public.Group("/auth")
            {
                auth.POST("/register", authHandler.Register)
                auth.POST("/login", authHandler.Login)
                auth.POST("/refresh", authHandler.RefreshToken)
            }

            // Public project routes
            projects := public.Group("/projects")
            {
                projects.GET("", projectHandler.GetAllProjects)
                projects.GET("/:id/public", projectHandler.GetPublicProject) // If implementing public projects
            }
        }

        // Protected routes (authentication required)
        protected := v1.Group("")
        protected.Use(apiMiddleware.APIAuthMiddleware(authService))
        {
            // User/Profile routes
            user := protected.Group("/user")
            {
                user.GET("/profile", authHandler.GetProfile)
                user.PUT("/profile", authHandler.UpdateProfile)
                user.POST("/logout", authHandler.Logout)
                user.GET("/validate", authHandler.ValidateToken)
            }

            // Project routes
            projects := protected.Group("/projects")
            {
                // CRUD operations
                projects.POST("", projectHandler.CreateProject)
                projects.GET("/my", projectHandler.GetUserProjects)
                projects.GET("/:id", projectHandler.GetProject)
                projects.PUT("/:id", projectHandler.UpdateProject)
                projects.DELETE("/:id", projectHandler.DeleteProject)
                
                // Project data operations
                projects.POST("/:id/save", projectHandler.SaveProjectData)
                projects.POST("/:id/autosave", projectHandler.AutoSave)
                
                // Character and relationship endpoints
                projects.GET("/:id/characters", projectHandler.GetProjectCharacters)
                projects.GET("/:id/relationships", projectHandler.GetProjectRelationships)
                
                // File upload endpoints (if implementing)
                projects.POST("/:id/upload/cover", projectHandler.UploadCoverImage)
                projects.POST("/:id/upload/character-image", projectHandler.UploadCharacterImage)
            }

            // Admin routes (if implementing role-based access)
            admin := protected.Group("/admin")
            admin.Use(apiMiddleware.AdminOnlyMiddleware()) // Would need to implement this
            {
                admin.GET("/users", func(c *gin.Context) {
                    c.JSON(http.StatusNotImplemented, models.APIResponse{
                        Success: false,
                        Error:   "Admin endpoints not implemented",
                    })
                })
                admin.GET("/stats", func(c *gin.Context) {
                    c.JSON(http.StatusNotImplemented, models.APIResponse{
                        Success: false,
                        Error:   "Admin endpoints not implemented",
                    })
                })
            }
        }

        // Optional authenticated routes (work with or without auth)
        optional := v1.Group("")
        optional.Use(apiMiddleware.OptionalAPIAuthMiddleware(authService))
        {
            // Routes that provide different responses based on authentication
            optional.GET("/projects/featured", func(c *gin.Context) {
                projects, err := projectService.GetAllProjects()
                if err != nil {
                    c.JSON(http.StatusInternalServerError, models.APIResponse{
                        Success: false,
                        Error:   "Failed to fetch featured projects",
                    })
                    return
                }
                
                c.JSON(http.StatusOK, models.APIResponse{
                    Success: true,
                    Data:    projects,
                })
            })
        }
    }

    // Legacy API routes (for backward compatibility)
    legacy := router.Group("/api")
    {
        // Map old routes to new ones
        legacy.POST("/register", authHandler.Register)
        legacy.POST("/login", authHandler.Login)
        legacy.GET("/projects", projectHandler.GetAllProjects)
        
        // Protected legacy routes
        legacyProtected := legacy.Group("")
        legacyProtected.Use(apiMiddleware.APIAuthMiddleware(authService))
        {
            legacyProtected.GET("/user/profile", authHandler.GetProfile)
            legacyProtected.PUT("/user/profile", authHandler.UpdateProfile)
            legacyProtected.GET("/projects/my", projectHandler.GetUserProjects)
            legacyProtected.POST("/projects", projectHandler.CreateProject)
            legacyProtected.GET("/projects/:id", projectHandler.GetProject)
            legacyProtected.PUT("/projects/:id", projectHandler.UpdateProject)
            legacyProtected.DELETE("/projects/:id", projectHandler.DeleteProject)
            legacyProtected.POST("/projects/:id/save", projectHandler.SaveProjectData)
            legacyProtected.POST("/projects/:id/autosave", projectHandler.AutoSave)
        }
    }

    // 404 handler for API routes
    router.NoRoute(func(c *gin.Context) {
        if strings.HasPrefix(c.Request.URL.Path, "/api") {
            c.JSON(http.StatusNotFound, models.APIResponse{
                Success: false,
                Error:   "API endpoint not found",
            })
        } else {
            c.JSON(http.StatusNotFound, gin.H{
                "error": "Page not found",
            })
        }
    })

    // Global error handler
    router.Use(func(c *gin.Context) {
        defer func() {
            if err := recover(); err != nil {
                log.Printf("[PANIC] %v", err)
                c.JSON(http.StatusInternalServerError, models.APIResponse{
                    Success: false,
                    Error:   "Internal server error",
                })
            }
        }()
        c.Next()
    })
}