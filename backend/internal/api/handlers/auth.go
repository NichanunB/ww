package handlers

import (
    "net/http"
    "backend/internal/models"
    "backend/internal/services"
    "backend/internal/middleware"

    "github.com/gin-gonic/gin"
)

// AuthAPIHandler handles authentication API endpoints
type AuthAPIHandler struct {
    authService *services.AuthService
}

// NewAuthAPIHandler creates a new auth API handler
func NewAuthAPIHandler(authService *services.AuthService) *AuthAPIHandler {
    return &AuthAPIHandler{
        authService: authService,
    }
}

// Register handles user registration via API
func (h *AuthAPIHandler) Register(c *gin.Context) {
    var req models.RegisterRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, models.APIResponse{
            Success: false,
            Error:   "Invalid request format",
        })
        return
    }

    user, err := h.authService.Register(req)
    if err != nil {
        c.JSON(http.StatusConflict, models.APIResponse{
            Success: false,
            Error:   err.Error(),
        })
        return
    }

    c.JSON(http.StatusCreated, models.APIResponse{
        Success: true,
        Message: "User registered successfully",
        Data:    user,
    })
}

// Login handles user login via API
func (h *AuthAPIHandler) Login(c *gin.Context) {
    var req models.LoginRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, models.APIResponse{
            Success: false,
            Error:   "Invalid request format",
        })
        return
    }

    loginResponse, err := h.authService.Login(req)
    if err != nil {
        c.JSON(http.StatusUnauthorized, models.APIResponse{
            Success: false,
            Error:   "Invalid credentials",
        })
        return
    }

    c.JSON(http.StatusOK, models.APIResponse{
        Success: true,
        Message: "Login successful",
        Data:    loginResponse,
    })
}

// GetProfile handles getting user profile
func (h *AuthAPIHandler) GetProfile(c *gin.Context) {
    userID, exists := middleware.GetUserID(c)
    if !exists {
        c.JSON(http.StatusUnauthorized, models.APIResponse{
            Success: false,
            Error:   "User not authenticated",
        })
        return
    }

    profile, err := h.authService.GetUserProfile(userID)
    if err != nil {
        c.JSON(http.StatusNotFound, models.APIResponse{
            Success: false,
            Error:   "Profile not found",
        })
        return
    }

    c.JSON(http.StatusOK, models.APIResponse{
        Success: true,
        Data:    profile,
    })
}

// UpdateProfile handles updating user profile
func (h *AuthAPIHandler) UpdateProfile(c *gin.Context) {
    userID, exists := middleware.GetUserID(c)
    if !exists {
        c.JSON(http.StatusUnauthorized, models.APIResponse{
            Success: false,
            Error:   "User not authenticated",
        })
        return
    }

    var req models.UpdateProfileRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, models.APIResponse{
            Success: false,
            Error:   "Invalid request format",
        })
        return
    }

    profile, err := h.authService.UpdateProfile(userID, req)
    if err != nil {
        c.JSON(http.StatusInternalServerError, models.APIResponse{
            Success: false,
            Error:   "Failed to update profile",
        })
        return
    }

    c.JSON(http.StatusOK, models.APIResponse{
        Success: true,
        Message: "Profile updated successfully",
        Data:    profile,
    })
}

// ValidateToken handles token validation
func (h *AuthAPIHandler) ValidateToken(c *gin.Context) {
    userID, exists := middleware.GetUserID(c)
    if !exists {
        c.JSON(http.StatusUnauthorized, models.APIResponse{
            Success: false,
            Error:   "Invalid or expired token",
        })
        return
    }

    user, err := h.authService.GetUserByID(userID)
    if err != nil {
        c.JSON(http.StatusNotFound, models.APIResponse{
            Success: false,
            Error:   "User not found",
        })
        return
    }

    c.JSON(http.StatusOK, models.APIResponse{
        Success: true,
        Message: "Token is valid",
        Data: models.UserProfile{
            ID:           user.ID,
            UserName:     user.UserName,
            Email:        user.Email,
            ProfileImage: user.ProfileImage,
        },
    })
}

// Logout handles user logout
func (h *AuthAPIHandler) Logout(c *gin.Context) {
    // For JWT-based auth, logout is mainly client-side
    // But we can add token blacklisting here if needed
    
    c.JSON(http.StatusOK, models.APIResponse{
        Success: true,
        Message: "Logged out successfully",
    })
}

// RefreshToken handles token refresh (if implementing refresh tokens)
func (h *AuthAPIHandler) RefreshToken(c *gin.Context) {
    // Implementation for refresh token logic
    // This would require additional token management
    
    c.JSON(http.StatusNotImplemented, models.APIResponse{
        Success: false,
        Error:   "Refresh token not implemented",
    })
}