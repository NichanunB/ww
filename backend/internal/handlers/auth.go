// backend/internal/handlers/auth.go
package handlers

import (
    "fmt"
    "net/http"
    "backend/internal/middleware"
    "backend/internal/models"
    "backend/internal/services"

    "github.com/gin-gonic/gin"
)

type AuthHandler struct {
    authService *services.AuthService
}

func NewAuthHandler(authService *services.AuthService) *AuthHandler {
    return &AuthHandler{
        authService: authService,
    }
}

func (h *AuthHandler) Register(c *gin.Context) {
    var req models.RegisterRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, models.ErrorResponse{
            Error:   "invalid_request",
            Message: err.Error(),
        })
        return
    }

    user, err := h.authService.Register(req)
    if err != nil {
        c.JSON(http.StatusConflict, models.ErrorResponse{
            Error:   "registration_failed",
            Message: err.Error(),
        })
        return
    }

    c.JSON(http.StatusCreated, models.SuccessResponse{
        Message: "User registered successfully",
        Data:    user,
    })
}

func (h *AuthHandler) Login(c *gin.Context) {
    var req models.LoginRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, models.ErrorResponse{
            Error:   "invalid_request",
            Message: err.Error(),
        })
        return
    }

    loginResponse, err := h.authService.Login(req)
    if err != nil {
        c.JSON(http.StatusUnauthorized, models.ErrorResponse{
            Error:   "login_failed",
            Message: err.Error(),
        })
        return
    }

    c.JSON(http.StatusOK, loginResponse)
}

func (h *AuthHandler) GetProfile(c *gin.Context) {
    userID, exists := middleware.GetUserID(c)
    if !exists {
        c.JSON(http.StatusUnauthorized, models.ErrorResponse{
            Error:   "unauthorized",
            Message: "User not authenticated",
        })
        return
    }

    profile, err := h.authService.GetUserProfile(userID)
    if err != nil {
        c.JSON(http.StatusNotFound, models.ErrorResponse{
            Error:   "profile_not_found",
            Message: err.Error(),
        })
        return
    }

    c.JSON(http.StatusOK, models.SuccessResponse{
        Message: "Profile retrieved successfully",
        Data:    profile,
    })
}

func (h *AuthHandler) UpdateProfile(c *gin.Context) {
    userID, exists := middleware.GetUserID(c)
    if !exists {
        c.JSON(http.StatusUnauthorized, models.ErrorResponse{
            Error:   "unauthorized",
            Message: "User not authenticated",
        })
        return
    }

    var req models.UpdateProfileRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        // Log the error for debugging
        fmt.Printf("JSON binding error: %v\n", err)
        c.JSON(http.StatusBadRequest, models.ErrorResponse{
            Error:   "invalid_request",
            Message: err.Error(),
        })
        return
    }

    // Log the request for debugging
    fmt.Printf("UpdateProfile request - UserID: %d, Request: %+v\n", userID, req)

    profile, err := h.authService.UpdateProfile(userID, req)
    if err != nil {
        // Log the error for debugging
        fmt.Printf("UpdateProfile service error: %v\n", err)
        c.JSON(http.StatusInternalServerError, models.ErrorResponse{
            Error:   "update_failed",
            Message: err.Error(),
        })
        return
    }

    c.JSON(http.StatusOK, models.SuccessResponse{
        Message: "Profile updated successfully",
        Data:    profile,
    })
}

func (h *AuthHandler) Logout(c *gin.Context) {
    // In a stateless JWT system, logout is typically handled client-side
    // by removing the token from storage. However, we can provide a logout endpoint
    // for consistency and future token blacklisting if needed.
    
    c.JSON(http.StatusOK, models.SuccessResponse{
        Message: "Logged out successfully",
    })
}

func (h *AuthHandler) ValidateToken(c *gin.Context) {
    userID, exists := middleware.GetUserID(c)
    if !exists {
        c.JSON(http.StatusUnauthorized, models.ErrorResponse{
            Error:   "invalid_token",
            Message: "Token is invalid or expired",
        })
        return
    }

    user, err := h.authService.GetUserByID(userID)
    if err != nil {
        c.JSON(http.StatusNotFound, models.ErrorResponse{
            Error:   "user_not_found",
            Message: "User associated with token not found",
        })
        return
    }

    c.JSON(http.StatusOK, models.SuccessResponse{
        Message: "Token is valid",
        Data: models.UserProfile{
            ID:           user.ID,
            UserName:     user.UserName,
            Email:        user.Email,
            ProfileImage: user.ProfileImage,
        },
    })
}