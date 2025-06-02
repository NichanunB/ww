package models

import "time"

// Relationship represents a relationship between two characters
type Relationship struct {
    ID                string    `json:"id" db:"id"`
    ProjectID         int       `json:"project_id" db:"project_id"`
    SourceCharacterID string    `json:"source_character_id" db:"source_character_id"`
    TargetCharacterID string    `json:"target_character_id" db:"target_character_id"`
    RelationshipType  string    `json:"relationship_type" db:"relationship_type"` // friend, enemy, family, romantic, etc.
    Description       string    `json:"description" db:"description"`
    Strength          int       `json:"strength" db:"strength"` // 1-10 scale of relationship strength
    Color             string    `json:"color" db:"color"`
    Directed          bool      `json:"directed" db:"directed"` // true for one-way relationships
    Hidden            bool      `json:"hidden" db:"hidden"`
    CreatedAt         time.Time `json:"created_at" db:"created_at"`
    UpdatedAt         time.Time `json:"updated_at" db:"updated_at"`
}

// RelationshipWithCharacters includes character names for easier display
type RelationshipWithCharacters struct {
    Relationship
    SourceCharacterName string `json:"source_character_name"`
    TargetCharacterName string `json:"target_character_name"`
}

// RelationshipCreateRequest represents the request to create a relationship
type RelationshipCreateRequest struct {
    SourceCharacterID string `json:"source_character_id" binding:"required"`
    TargetCharacterID string `json:"target_character_id" binding:"required"`
    RelationshipType  string `json:"relationship_type" binding:"required,max=50"`
    Description       string `json:"description,omitempty"`
    Strength          int    `json:"strength,omitempty" binding:"min=1,max=10"`
    Color             string `json:"color,omitempty"`
    Directed          bool   `json:"directed,omitempty"`
}

// RelationshipUpdateRequest represents the request to update a relationship
type RelationshipUpdateRequest struct {
    RelationshipType *string `json:"relationship_type,omitempty"`
    Description      *string `json:"description,omitempty"`
    Strength         *int    `json:"strength,omitempty" binding:"omitempty,min=1,max=10"`
    Color            *string `json:"color,omitempty"`
    Directed         *bool   `json:"directed,omitempty"`
    Hidden           *bool   `json:"hidden,omitempty"`
}

// RelationshipListResponse represents the response for relationship listing
type RelationshipListResponse struct {
    Relationships []RelationshipWithCharacters `json:"relationships"`
    Total         int                          `json:"total"`
}

// RelationshipSummary represents a simplified version of relationship
type RelationshipSummary struct {
    ID                  string `json:"id"`
    SourceCharacterID   string `json:"source_character_id"`
    TargetCharacterID   string `json:"target_character_id"`
    SourceCharacterName string `json:"source_character_name"`
    TargetCharacterName string `json:"target_character_name"`
    RelationshipType    string `json:"relationship_type"`
    Strength            int    `json:"strength"`
    Directed            bool   `json:"directed"`
}

// Common relationship types
var CommonRelationshipTypes = []string{
    "friend",
    "enemy",
    "family",
    "romantic",
    "mentor",
    "rival",
    "colleague",
    "stranger",
    "acquaintance",
    "ally",
    "child-of",
    "parent-of",
    "sibling-of",
    "spouse-of",
}