// backend/internal/models/user.go
package models

import (
    "time"
)

type User struct {
    ID           int       `json:"id" db:"id"`
    UserName     string    `json:"user_name" db:"user_name"`
    Email        string    `json:"email" db:"email"`
    PasswordHash string    `json:"-" db:"password_hash"` // Don't expose password hash in JSON
    ProfileImage *string   `json:"profile_image" db:"profile_image"`
    CreatedAt    time.Time `json:"created_at" db:"created_at"`
    UpdatedAt    time.Time `json:"updated_at" db:"updated_at"`
}

type LoginRequest struct {
    Email    string `json:"email" binding:"required,email"`
    Password string `json:"password" binding:"required,min=6"`
}

type RegisterRequest struct {
    UserName string `json:"user_name" binding:"required,min=2,max=50"`
    Email    string `json:"email" binding:"required,email"`
    Password string `json:"password" binding:"required,min=6"`
}

type LoginResponse struct {
    Token   string `json:"token"`
    UserID  int    `json:"user_id"`
    Message string `json:"message"`
}

type UserProfile struct {
    ID           int     `json:"id"`
    UserName     string  `json:"user_name"`
    Email        string  `json:"email"`
    ProfileImage *string `json:"profile_image"`
}

type UpdateProfileRequest struct {
    UserName     *string `json:"user_name,omitempty" binding:"omitempty,min=2,max=50"`
    ProfileImage *string `json:"profile_image,omitempty"`
}