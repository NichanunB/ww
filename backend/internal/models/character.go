package models

import "time"

// Character represents a character in a novel/story
type Character struct {
    ID          string    `json:"id" db:"id"`
    ProjectID   int       `json:"project_id" db:"project_id"`
    Name        string    `json:"name" db:"name"`
    Type        string    `json:"type" db:"type"` // protagonist, antagonist, supporting, neutral
    Description string    `json:"description" db:"description"`
    Age         *string   `json:"age,omitempty" db:"age"`
    Occupation  *string   `json:"occupation,omitempty" db:"occupation"`
    ProfileImage *string  `json:"profile_image,omitempty" db:"profile_image"`
    PositionX   float64   `json:"position_x" db:"position_x"`
    PositionY   float64   `json:"position_y" db:"position_y"`
    Color       string    `json:"color" db:"color"`
    Hidden      bool      `json:"hidden" db:"hidden"`
    CreatedAt   time.Time `json:"created_at" db:"created_at"`
    UpdatedAt   time.Time `json:"updated_at" db:"updated_at"`
}

// CharacterCreateRequest represents the request to create a character
type CharacterCreateRequest struct {
    Name        string  `json:"name" binding:"required,max=100"`
    Type        string  `json:"type" binding:"required,oneof=protagonist antagonist supporting neutral"`
    Description string  `json:"description,omitempty"`
    Age         *string `json:"age,omitempty"`
    Occupation  *string `json:"occupation,omitempty"`
    PositionX   float64 `json:"position_x"`
    PositionY   float64 `json:"position_y"`
    Color       string  `json:"color,omitempty"`
}

// CharacterUpdateRequest represents the request to update a character
type CharacterUpdateRequest struct {
    Name        *string  `json:"name,omitempty"`
    Type        *string  `json:"type,omitempty"`
    Description *string  `json:"description,omitempty"`
    Age         *string  `json:"age,omitempty"`
    Occupation  *string  `json:"occupation,omitempty"`
    PositionX   *float64 `json:"position_x,omitempty"`
    PositionY   *float64 `json:"position_y,omitempty"`
    Color       *string  `json:"color,omitempty"`
    Hidden      *bool    `json:"hidden,omitempty"`
}

// CharacterListResponse represents the response for character listing
type CharacterListResponse struct {
    Characters []Character `json:"characters"`
    Total      int         `json:"total"`
}

// CharacterPosition represents just the position data for a character
type CharacterPosition struct {
    ID        string  `json:"id"`
    PositionX float64 `json:"position_x"`
    PositionY float64 `json:"position_y"`
}

// CharacterSummary represents a simplified version of character for lists
type CharacterSummary struct {
    ID          string  `json:"id"`
    Name        string  `json:"name"`
    Type        string  `json:"type"`
    ProfileImage *string `json:"profile_image,omitempty"`
}