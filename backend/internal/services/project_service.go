package services

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"backend/internal/models"
)

type ProjectService struct {
	db *sql.DB
}

func (s *ProjectService) GetPublicProjectByID(projectID int) error {
	panic("unimplemented")
}

func NewProjectService(db *sql.DB) *ProjectService {
	return &ProjectService{db: db}
}

func (s *ProjectService) CreateProject(userID int, req models.CreateProjectRequest) (*models.Project, error) {
	// Set default project data if none provided
	var projectData json.RawMessage
	if req.ProjectData != nil {
		projectData = req.ProjectData
	} else {
		defaultData := models.ProjectData{
			Elements: []models.Element{},
			Metadata: models.Metadata{
				Version:   "1.0",
				CreatedAt: time.Now(),
				UpdatedAt: time.Now(),
			},
		}
		var err error
		projectData, err = json.Marshal(defaultData)
		if err != nil {
			return nil, fmt.Errorf("error creating default project data: %w", err)
		}
	}

	result, err := s.db.Exec(`
        INSERT INTO projects (user_id, title, description, project_data) 
        VALUES (?, ?, ?, ?)
    `, userID, req.Title, req.Description, projectData)

	if err != nil {
		return nil, fmt.Errorf("error creating project: %w", err)
	}

	projectID, err := result.LastInsertId()
	if err != nil {
		return nil, fmt.Errorf("error getting project ID: %w", err)
	}

	return s.GetProjectByID(int(projectID), userID)
}

func (s *ProjectService) GetProjectsByUser(userID int) ([]models.ProjectListItem, error) {
	rows, err := s.db.Query(`
        SELECT p.id, p.title, p.description, p.cover_image, p.created_at, p.updated_at, u.user_name
        FROM projects p
        JOIN users u ON p.user_id = u.id
        WHERE p.user_id = ?
        ORDER BY p.updated_at DESC
    `, userID)

	if err != nil {
		return nil, fmt.Errorf("error fetching projects: %w", err)
	}
	defer rows.Close()

	var projects []models.ProjectListItem
	for rows.Next() {
		var project models.ProjectListItem
		err := rows.Scan(
			&project.ID,
			&project.Title,
			&project.Description,
			&project.CoverImage,
			&project.CreatedAt,
			&project.UpdatedAt,
			&project.AuthorName,
		)
		if err != nil {
			return nil, fmt.Errorf("error scanning project: %w", err)
		}
		projects = append(projects, project)
	}

	return projects, nil
}

func (s *ProjectService) GetAllProjects() ([]models.ProjectListItem, error) {
	rows, err := s.db.Query(`
        SELECT p.id, p.title, p.description, p.cover_image, p.created_at, p.updated_at, u.user_name
        FROM projects p
        JOIN users u ON p.user_id = u.id
        ORDER BY p.updated_at DESC
        LIMIT 50
    `)

	if err != nil {
		return nil, fmt.Errorf("error fetching all projects: %w", err)
	}
	defer rows.Close()

	var projects []models.ProjectListItem
	for rows.Next() {
		var project models.ProjectListItem
		err := rows.Scan(
			&project.ID,
			&project.Title,
			&project.Description,
			&project.CoverImage,
			&project.CreatedAt,
			&project.UpdatedAt,
			&project.AuthorName,
		)
		if err != nil {
			return nil, fmt.Errorf("error scanning project: %w", err)
		}
		projects = append(projects, project)
	}

	return projects, nil
}

func (s *ProjectService) GetProjectByID(projectID, userID int) (*models.Project, error) {
	var project models.Project
	err := s.db.QueryRow(`
        SELECT id, user_id, title, description, cover_image, project_data, created_at, updated_at
        FROM projects 
        WHERE id = ? AND user_id = ?
    `, projectID, userID).Scan(
		&project.ID,
		&project.UserID,
		&project.Title,
		&project.Description,
		&project.CoverImage,
		&project.ProjectData,
		&project.CreatedAt,
		&project.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("project not found or access denied")
	}
	if err != nil {
		return nil, fmt.Errorf("error fetching project: %w", err)
	}

	return &project, nil
}

func (s *ProjectService) UpdateProject(projectID, userID int, req models.UpdateProjectRequest) (*models.Project, error) {
	// Check if project exists and belongs to user
	_, err := s.GetProjectByID(projectID, userID)
	if err != nil {
		return nil, err
	}

	// Build dynamic update query
	setParts := []string{}
	args := []interface{}{}

	if req.Title != nil {
		setParts = append(setParts, "title = ?")
		args = append(args, *req.Title)
	}

	if req.Description != nil {
		setParts = append(setParts, "description = ?")
		args = append(args, *req.Description)
	}

	if req.CoverImage != nil {
		setParts = append(setParts, "cover_image = ?")
		args = append(args, *req.CoverImage)
	}

	if req.ProjectData != nil {
		setParts = append(setParts, "project_data = ?")
		args = append(args, req.ProjectData)
	}

	if len(setParts) == 0 {
		return s.GetProjectByID(projectID, userID)
	}

	// Add updated_at
	setParts = append(setParts, "updated_at = NOW()")
	args = append(args, projectID, userID)

	query := fmt.Sprintf("UPDATE projects SET %s WHERE id = ? AND user_id = ?", strings.Join(setParts, ", "))

	_, err = s.db.Exec(query, args...)
	if err != nil {
		return nil, fmt.Errorf("error updating project: %w", err)
	}

	return s.GetProjectByID(projectID, userID)
}

func (s *ProjectService) DeleteProject(projectID, userID int) error {
	// Check if project exists and belongs to user
	_, err := s.GetProjectByID(projectID, userID)
	if err != nil {
		return err
	}

	_, err = s.db.Exec("DELETE FROM projects WHERE id = ? AND user_id = ?", projectID, userID)
	if err != nil {
		return fmt.Errorf("error deleting project: %w", err)
	}

	return nil
}

func (s *ProjectService) SaveProjectData(projectID, userID int, projectData json.RawMessage) error {
	_, err := s.db.Exec(`
        UPDATE projects 
        SET project_data = ?, updated_at = NOW() 
        WHERE id = ? AND user_id = ?
    `, projectData, projectID, userID)

	if err != nil {
		return fmt.Errorf("error saving project data: %w", err)
	}

	return nil
}
