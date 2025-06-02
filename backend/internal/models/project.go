// backend/internal/models/project.go

package models

import (
    "encoding/json"
    "time"
)

type Project struct {
    ID          int             `json:"id" db:"id"`
    UserID      int             `json:"user_id" db:"user_id"`
    Title       string          `json:"title" db:"title"`
    Description *string         `json:"description" db:"description"`
    CoverImage  *string         `json:"cover_image" db:"cover_image"`
    ProjectData json.RawMessage `json:"project_data" db:"project_data"`
    CreatedAt   time.Time       `json:"created_at" db:"created_at"`
    UpdatedAt   time.Time       `json:"updated_at" db:"updated_at"`
}

type ProjectListItem struct {
    ID          int       `json:"id"`
    Title       string    `json:"title"`
    Description *string   `json:"description"`
    CoverImage  *string   `json:"cover_image"`
    CreatedAt   time.Time `json:"created_at"`
    UpdatedAt   time.Time `json:"updated_at"`
    AuthorName  string    `json:"authorName"`
}

type CreateProjectRequest struct {
    Title       string          `json:"title" binding:"required,max=255"`
    Description *string         `json:"description"`
    ProjectData json.RawMessage `json:"project_data"`
}

type UpdateProjectRequest struct {
    Title       *string           `json:"title,omitempty"`
    Description *string           `json:"description"`
    CoverImage  *string           `json:"cover_image"`
    ProjectData *json.RawMessage  `json:"project_data,omitempty"` // ✅ เปลี่ยนเป็น pointer
}

type ProjectData struct {
    Elements []Element `json:"elements"`
    Metadata Metadata  `json:"metadata"`
}

type Element struct {
    ID               string   `json:"id"`
    Type             string   `json:"type"`
    X                float64  `json:"x"`
    Y                float64  `json:"y"`
    Width            *float64 `json:"width,omitempty"`
    Height           *float64 `json:"height,omitempty"`
    Rotation         float64  `json:"rotation"`
    Color            string   `json:"color"`
    FontColor        *string  `json:"fontColor,omitempty"`
    FontSize         *int     `json:"fontSize,omitempty"`
    Text             string   `json:"text"`
    CharacterType    *string  `json:"characterType,omitempty"`
    Details          *string  `json:"details,omitempty"`
    Age              *string  `json:"age,omitempty"`
    ProfileImage     *string  `json:"profileImage,omitempty"`
    Hidden           bool     `json:"hidden"`
    SourceID         *string  `json:"sourceId,omitempty"`
    TargetID         *string  `json:"targetId,omitempty"`
    RelationshipType *string  `json:"relationshipType,omitempty"`
    Directed         *bool    `json:"directed,omitempty"`
}

type Metadata struct {
    Version   string    `json:"version"`
    CreatedAt time.Time `json:"created_at"`
    UpdatedAt time.Time `json:"updated_at"`
}
