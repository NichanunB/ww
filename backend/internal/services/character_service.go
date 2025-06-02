package services

import (
    "database/sql"
    "encoding/json"
    "fmt"
    "backend/internal/models"
)

type CharacterService struct {
    db *sql.DB
}

func NewCharacterService(db *sql.DB) *CharacterService {
    return &CharacterService{db: db}
}

// Character represents a character within a project
type Character struct {
    ID           string  `json:"id"`
    ProjectID    int     `json:"project_id"`
    Name         string  `json:"name"`
    Type         string  `json:"type"` // protagonist, antagonist, supporting
    Description  string  `json:"description"`
    Age          *string `json:"age,omitempty"`
    Occupation   *string `json:"occupation,omitempty"`
    ProfileImage *string `json:"profile_image,omitempty"`
    Position     struct {
        X float64 `json:"x"`
        Y float64 `json:"y"`
    } `json:"position"`
    Hidden bool `json:"hidden"`
}

// Relationship represents a relationship between characters
type Relationship struct {
    ID               string `json:"id"`
    ProjectID        int    `json:"project_id"`
    SourceCharacterID string `json:"source_character_id"`
    TargetCharacterID string `json:"target_character_id"`
    RelationshipType string `json:"relationship_type"`
    Description      string `json:"description"`
    Hidden           bool   `json:"hidden"`
}

// ExtractCharactersFromProjectData extracts character data from project JSON
func (s *CharacterService) ExtractCharactersFromProjectData(projectData json.RawMessage) ([]Character, error) {
    var data models.ProjectData
    if err := json.Unmarshal(projectData, &data); err != nil {
        return nil, fmt.Errorf("failed to parse project data: %w", err)
    }

    var characters []Character
    for _, element := range data.Elements {
        if element.Type == "circle" { // Character elements are circles
            character := Character{
                ID:          element.ID,
                Name:        element.Text,
                Type:        getCharacterType(element.CharacterType),
                Description: getStringValue(element.Details),
                Age:         element.Age,
                ProfileImage: element.ProfileImage,
                Position: struct {
                    X float64 `json:"x"`
                    Y float64 `json:"y"`
                }{
                    X: element.X,
                    Y: element.Y,
                },
                Hidden: element.Hidden,
            }
            characters = append(characters, character)
        }
    }

    return characters, nil
}

// ExtractRelationshipsFromProjectData extracts relationship data from project JSON
func (s *CharacterService) ExtractRelationshipsFromProjectData(projectData json.RawMessage) ([]Relationship, error) {
    var data models.ProjectData
    if err := json.Unmarshal(projectData, &data); err != nil {
        return nil, fmt.Errorf("failed to parse project data: %w", err)
    }

    var relationships []Relationship
    for _, element := range data.Elements {
        if element.Type == "relationship" {
            if element.SourceID != nil && element.TargetID != nil {
                relationship := Relationship{
                    ID:                element.ID,
                    SourceCharacterID: *element.SourceID,
                    TargetCharacterID: *element.TargetID,
                    RelationshipType:  getStringValue(element.RelationshipType),
                    Description:       element.Text,
                    Hidden:            element.Hidden,
                }
                relationships = append(relationships, relationship)
            }
        }
    }

    return relationships, nil
}

// GetProjectCharacters returns all characters for a specific project
func (s *CharacterService) GetProjectCharacters(projectID, userID int) ([]Character, error) {
    // First verify user has access to this project
    var count int
    err := s.db.QueryRow("SELECT COUNT(*) FROM projects WHERE id = ? AND user_id = ?", projectID, userID).Scan(&count)
    if err != nil {
        return nil, fmt.Errorf("error checking project access: %w", err)
    }
    if count == 0 {
        return nil, fmt.Errorf("project not found or access denied")
    }

    // Get project data
    var projectData json.RawMessage
    err = s.db.QueryRow("SELECT project_data FROM projects WHERE id = ?", projectID).Scan(&projectData)
    if err != nil {
        return nil, fmt.Errorf("error fetching project data: %w", err)
    }

    // Extract characters
    characters, err := s.ExtractCharactersFromProjectData(projectData)
    if err != nil {
        return nil, err
    }

    // Set project ID for all characters
    for i := range characters {
        characters[i].ProjectID = projectID
    }

    return characters, nil
}

// GetProjectRelationships returns all relationships for a specific project
func (s *CharacterService) GetProjectRelationships(projectID, userID int) ([]Relationship, error) {
    // First verify user has access to this project
    var count int
    err := s.db.QueryRow("SELECT COUNT(*) FROM projects WHERE id = ? AND user_id = ?", projectID, userID).Scan(&count)
    if err != nil {
        return nil, fmt.Errorf("error checking project access: %w", err)
    }
    if count == 0 {
        return nil, fmt.Errorf("project not found or access denied")
    }

    // Get project data
    var projectData json.RawMessage
    err = s.db.QueryRow("SELECT project_data FROM projects WHERE id = ?", projectID).Scan(&projectData)
    if err != nil {
        return nil, fmt.Errorf("error fetching project data: %w", err)
    }

    // Extract relationships
    relationships, err := s.ExtractRelationshipsFromProjectData(projectData)
    if err != nil {
        return nil, err
    }

    // Set project ID for all relationships
    for i := range relationships {
        relationships[i].ProjectID = projectID
    }

    return relationships, nil
}

// Helper functions
func getCharacterType(characterType *string) string {
    if characterType == nil {
        return "neutral"
    }
    return *characterType
}

func getStringValue(str *string) string {
    if str == nil {
        return ""
    }
    return *str
}