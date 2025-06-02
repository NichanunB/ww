package middleware

import (
    "fmt"
    "log"
    "time"

    "github.com/gin-gonic/gin"
)

// APILoggingMiddleware provides detailed logging for API requests
func APILoggingMiddleware() gin.HandlerFunc {
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

// DetailedRequestLoggingMiddleware logs request details
func DetailedRequestLoggingMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        start := time.Now()
        path := c.Request.URL.Path
        raw := c.Request.URL.RawQuery

        // Process request
        c.Next()

        // Log request details
        latency := time.Since(start)
        clientIP := c.ClientIP()
        method := c.Request.Method
        statusCode := c.Writer.Status()
        bodySize := c.Writer.Size()

        if raw != "" {
            path = path + "?" + raw
        }

        // Get user ID if available
        userIDInterface, exists := c.Get("user_id")
        userID := "anonymous"
        if exists {
            if uid, ok := userIDInterface.(int); ok {
                userID = fmt.Sprintf("user_%d", uid)
            }
        }

        log.Printf("[API] %s %s %s %d %v %d bytes - %s",
            clientIP,
            method,
            path,
            statusCode,
            latency,
            bodySize,
            userID,
        )

        // Log errors separately
        if len(c.Errors) > 0 {
            log.Printf("[API ERROR] %s %s - Errors: %v", method, path, c.Errors)
        }
    }
}

// SecurityLoggingMiddleware logs security-related events
func SecurityLoggingMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        // Log authentication attempts
        if c.Request.URL.Path == "/api/login" || c.Request.URL.Path == "/api/register" {
            log.Printf("[SECURITY] %s attempt from %s - Path: %s", 
                c.Request.Method, c.ClientIP(), c.Request.URL.Path)
        }

        // Log failed authentication
        c.Next()

        if c.Writer.Status() == 401 {
            log.Printf("[SECURITY] Unauthorized access attempt from %s - Path: %s", 
                c.ClientIP(), c.Request.URL.Path)
        }
    }
}

// PerformanceLoggingMiddleware logs slow requests
func PerformanceLoggingMiddleware(threshold time.Duration) gin.HandlerFunc {
    return func(c *gin.Context) {
        start := time.Now()
        
        c.Next()
        
        latency := time.Since(start)
        
        if latency > threshold {
            log.Printf("[PERFORMANCE] Slow request detected: %s %s took %v", 
                c.Request.Method, c.Request.URL.Path, latency)
        }
    }
}