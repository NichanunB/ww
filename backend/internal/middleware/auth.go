package middleware

import (
    "net/http"
    "backend/internal/models"
    "backend/internal/services"
    "strings"

    "github.com/gin-gonic/gin"
)

func AuthMiddleware(authService *services.AuthService) gin.HandlerFunc {
    return func(c *gin.Context) {
        // Get token from Authorization header
        authHeader := c.GetHeader("Authorization")
        if authHeader == "" {
            c.JSON(http.StatusUnauthorized, models.ErrorResponse{
                Error:   "missing_token",
                Message: "Authorization token is required",
            })
            c.Abort()
            return
        }

        // Check if token has Bearer prefix
        tokenParts := strings.Split(authHeader, " ")
        if len(tokenParts) != 2 || tokenParts[0] != "Bearer" {
            c.JSON(http.StatusUnauthorized, models.ErrorResponse{
                Error:   "invalid_token_format",
                Message: "Token must be in 'Bearer <token>' format",
            })
            c.Abort()
            return
        }

        token := tokenParts[1]

        // Validate token
        userID, err := authService.ValidateToken(token)
        if err != nil {
            c.JSON(http.StatusUnauthorized, models.ErrorResponse{
                Error:   "invalid_token",
                Message: "Invalid or expired token",
            })
            c.Abort()
            return
        }

        // Store user ID in context for use in handlers
        c.Set("user_id", userID)
        c.Next()
    }
}

// Optional middleware - allows both authenticated and unauthenticated requests
func OptionalAuthMiddleware(authService *services.AuthService) gin.HandlerFunc {
    return func(c *gin.Context) {
        authHeader := c.GetHeader("Authorization")
        
        if authHeader != "" {
            tokenParts := strings.Split(authHeader, " ")
            if len(tokenParts) == 2 && tokenParts[0] == "Bearer" {
                token := tokenParts[1]
                if userID, err := authService.ValidateToken(token); err == nil {
                    c.Set("user_id", userID)
                }
            }
        }
        
        c.Next()
    }
}

// Helper function to get user ID from context
func GetUserID(c *gin.Context) (int, bool) {
    userID, exists := c.Get("user_id")
    if !exists {
        return 0, false
    }
    
    id, ok := userID.(int)
    return id, ok
}