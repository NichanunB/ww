// backend/internal/routes/routes.go
package routes

import (
    "database/sql"
    "net/http"
    "backend/internal/config"
    "backend/internal/handlers"
    "backend/internal/middleware"
    "backend/internal/models"
    "backend/internal/services"

    "github.com/gin-gonic/gin"
)

func SetupRoutes(router *gin.Engine, db *sql.DB, cfg *config.Config) {
    // Initialize services
    authService := services.NewAuthService(db, cfg)
    projectService := services.NewProjectService(db)

    // Initialize handlers
    authHandler := handlers.NewAuthHandler(authService)
    projectHandler := handlers.NewProjectHandler(projectService)

    // API v1 routes
    v1 := router.Group("/api")
    {
        // Public routes (no authentication required)
        public := v1.Group("")
        {
            // Authentication routes
            public.POST("/register", authHandler.Register)
            public.POST("/login", authHandler.Login)
            
            // Public project routes (for homepage)
            public.GET("/projects", projectHandler.GetAllProjects)
            
            // Health check
            public.GET("/ping", func(c *gin.Context) {
                c.JSON(http.StatusOK, gin.H{
                    "message": "pong",
                    "status":  "healthy",
                })
            })
        }

        // Protected routes (authentication required)
        protected := v1.Group("")
        protected.Use(middleware.AuthMiddleware(authService))
        {
            // User/Profile routes
            user := protected.Group("/user")
            {
                user.GET("/profile", authHandler.GetProfile)
                user.PUT("/profile", authHandler.UpdateProfile) // ✅ เพิ่ม PUT handler
                user.POST("/logout", authHandler.Logout)
                user.GET("/validate", authHandler.ValidateToken)
            }

            // Project routes
            projects := protected.Group("/projects")
            {
                // CRUD operations
                projects.POST("", projectHandler.CreateProject)
                projects.GET("/my", projectHandler.GetProjects) // Get user's projects
                projects.GET("/:id", projectHandler.GetProject)
                projects.PUT("/:id", projectHandler.UpdateProject)
                projects.DELETE("/:id", projectHandler.DeleteProject)
                
                // Special operations
                projects.POST("/:id/save", projectHandler.SaveProjectData)
                projects.POST("/:id/autosave", projectHandler.AutoSave)
            }
        }

        // Optional authenticated routes (work with or without auth)
        optional := v1.Group("")
        optional.Use(middleware.OptionalAuthMiddleware(authService))
        {
            // Routes that provide different responses based on authentication
            optional.GET("/projects/featured", func(c *gin.Context) {
                // This could show different content for authenticated vs non-authenticated users
                projects, err := projectService.GetAllProjects()
                if err != nil {
                    c.JSON(http.StatusInternalServerError, models.ErrorResponse{
                        Error:   "fetch_failed",
                        Message: err.Error(),
                    })
                    return
                }
                c.JSON(http.StatusOK, projects)
            })
        }
    }

    // Static file serving for uploads (if needed)
    router.Static("/uploads", cfg.Upload.Path)

    // 404 handler
    router.NoRoute(func(c *gin.Context) {
        c.JSON(http.StatusNotFound, models.ErrorResponse{
            Error:   "not_found",
            Message: "The requested resource was not found",
        })
    })

    // Add middleware for handling CORS preflight requests
    router.OPTIONS("/*path", func(c *gin.Context) {
        c.Status(http.StatusOK)
    })
}