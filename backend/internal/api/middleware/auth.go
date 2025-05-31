package middleware

import (
	"backend/internal/models"
	"backend/internal/services"
	"fmt"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

// APIAuthMiddleware provides JWT authentication for API endpoints
func APIAuthMiddleware(authService *services.AuthService) gin.HandlerFunc {
    return func(c *gin.Context) {
        // Get token from Authorization header
        authHeader := c.GetHeader("Authorization")
        if authHeader == "" {
            c.JSON(http.StatusUnauthorized, models.APIResponse{
                Success: false,
                Error:   "Authorization token is required",
            })
            c.Abort()
            return
        }

        // Check if token has Bearer prefix
        tokenParts := strings.Split(authHeader, " ")
        if len(tokenParts) != 2 || tokenParts[0] != "Bearer" {
            c.JSON(http.StatusUnauthorized, models.APIResponse{
                Success: false,
                Error:   "Token must be in 'Bearer <token>' format",
            })
            c.Abort()
            return
        }

        token := tokenParts[1]

        // Validate token
        userID, err := authService.ValidateToken(token)
        if err != nil {
            c.JSON(http.StatusUnauthorized, models.APIResponse{
                Success: false,
                Error:   "Invalid or expired token",
            })
            c.Abort()
            return
        }

        // Store user ID in context for use in handlers
        c.Set("user_id", userID)
        c.Next()
    }
}

// OptionalAPIAuthMiddleware allows both authenticated and unauthenticated requests
func OptionalAPIAuthMiddleware(authService *services.AuthService) gin.HandlerFunc {
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

// CORSMiddleware handles CORS for API endpoints
func CORSMiddleware(allowedOrigins []string) gin.HandlerFunc {
    return func(c *gin.Context) {
        origin := c.Request.Header.Get("Origin")
        
        // Check if origin is allowed
        originAllowed := false
        for _, allowedOrigin := range allowedOrigins {
            if allowedOrigin == "*" || allowedOrigin == origin {
                originAllowed = true
                break
            }
        }

        if originAllowed {
            c.Header("Access-Control-Allow-Origin", origin)
        }
        
        c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        c.Header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, Authorization, X-Requested-With")
        c.Header("Access-Control-Allow-Credentials", "true")
        c.Header("Access-Control-Max-Age", "86400")

        if c.Request.Method == "OPTIONS" {
            c.AbortWithStatus(http.StatusOK)
            return
        }

        c.Next()
    }
}

// RateLimitMiddleware provides basic rate limiting
func RateLimitMiddleware() gin.HandlerFunc {
    // This is a simple implementation - in production you'd want to use Redis
    // or a proper rate limiting library
    return func(c *gin.Context) {
        // Implementation would go here
        c.Next()
    }
}

// LoggingMiddleware logs API requests
func LoggingMiddleware() gin.HandlerFunc {
    return gin.LoggerWithFormatter(func(param gin.LogFormatterParams) string {
        return fmt.Sprintf("[API] %s - [%s] \"%s %s %s %d %s \"%s\" %s\"\n",
            param.ClientIP,
            param.TimeStamp.Format("2006/01/02 - 15:04:05"),
            param.Method,
            param.Path,
            param.Request.Proto,
            param.StatusCode,
            param.Latency,
            param.Request.UserAgent(),
            param.ErrorMessage,
        )
    })
}