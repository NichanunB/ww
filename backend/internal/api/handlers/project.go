package handlers

import (
    "encoding/json"
    "net/http"
    "strconv"
    "time"
    "backend/internal/models"
    "backend/internal/services"
    "backend/internal/middleware"

    "github.com/gin-gonic/gin"
)

// ProjectAPIHandler handles project-related API endpoints
type ProjectAPIHandler struct {
    projectService   *services.ProjectService
    characterService *services.CharacterService
}

// NewProjectAPIHandler creates a new project API handler
func NewProjectAPIHandler(projectService *services.ProjectService, characterService *services.CharacterService) *ProjectAPIHandler {
    return &ProjectAPIHandler{
        projectService:   projectService,
        characterService: characterService,
    }
}

// CreateProject handles project creation
func (h *ProjectAPIHandler) CreateProject(c *gin.Context) {
    userID, exists := middleware.GetUserID(c)
    if !exists {
        c.JSON(http.StatusUnauthorized, models.APIResponse{
            Success: false,
            Error:   "User not authenticated",
        })
        return
    }

    var req models.CreateProjectRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, models.APIResponse{
            Success: false,
            Error:   "Invalid request format",
        })
        return
    }

    project, err := h.projectService.CreateProject(userID, req)
    if err != nil {
        c.JSON(http.StatusInternalServerError, models.APIResponse{
            Success: false,
            Error:   "Failed to create project",
        })
        return
    }

    c.JSON(http.StatusCreated, models.APIResponse{
        Success: true,
        Message: "Project created successfully",
        Data:    project,
    })
}

// GetUserProjects handles getting user's projects
func (h *ProjectAPIHandler) GetUserProjects(c *gin.Context) {
    userID, exists := middleware.GetUserID(c)
    if !exists {
        c.JSON(http.StatusUnauthorized, models.APIResponse{
            Success: false,
            Error:   "User not authenticated",
        })
        return
    }

    projects, err := h.projectService.GetProjectsByUser(userID)
    if err != nil {
        c.JSON(http.StatusInternalServerError, models.APIResponse{
            Success: false,
            Error:   "Failed to fetch projects",
        })
        return
    }

    c.JSON(http.StatusOK, models.APIResponse{
        Success: true,
        Data:    projects,
    })
}

// GetAllProjects handles getting all public projects
func (h *ProjectAPIHandler) GetAllProjects(c *gin.Context) {
    projects, err := h.projectService.GetAllProjects()
    if err != nil {
        c.JSON(http.StatusInternalServerError, models.APIResponse{
            Success: false,
            Error:   "Failed to fetch projects",
        })
        return
    }

    c.JSON(http.StatusOK, models.APIResponse{
        Success: true,
        Data:    projects,
    })
}

// GetProject handles getting a specific project
func (h *ProjectAPIHandler) GetProject(c *gin.Context) {
    userID, exists := middleware.GetUserID(c)
    if !exists {
        c.JSON(http.StatusUnauthorized, models.APIResponse{
            Success: false,
            Error:   "User not authenticated",
        })
        return
    }

    projectIDStr := c.Param("id")
    projectID, err := strconv.Atoi(projectIDStr)
    if err != nil {
        c.JSON(http.StatusBadRequest, models.APIResponse{
            Success: false,
            Error:   "Invalid project ID",
        })
        return
    }

    project, err := h.projectService.GetProjectByID(projectID, userID)
    if err != nil {
        c.JSON(http.StatusNotFound, models.APIResponse{
            Success: false,
            Error:   "Project not found",
        })
        return
    }

    c.JSON(http.StatusOK, models.APIResponse{
        Success: true,
        Data:    project,
    })
}

// UpdateProject handles updating a project
func (h *ProjectAPIHandler) UpdateProject(c *gin.Context) {
    userID, exists := middleware.GetUserID(c)
    if !exists {
        c.JSON(http.StatusUnauthorized, models.APIResponse{
            Success: false,
            Error:   "User not authenticated",
        })
        return
    }

    projectIDStr := c.Param("id")
    projectID, err := strconv.Atoi(projectIDStr)
    if err != nil {
        c.JSON(http.StatusBadRequest, models.APIResponse{
            Success: false,
            Error:   "Invalid project ID",
        })
        return
    }

    var req models.UpdateProjectRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, models.APIResponse{
            Success: false,
            Error:   "Invalid request format",
        })
        return
    }

    project, err := h.projectService.UpdateProject(projectID, userID, req)
    if err != nil {
        c.JSON(http.StatusInternalServerError, models.APIResponse{
            Success: false,
            Error:   "Failed to update project",
        })
        return
    }

    c.JSON(http.StatusOK, models.APIResponse{
        Success: true,
        Message: "Project updated successfully",
        Data:    project,
    })
}

// DeleteProject handles deleting a project
func (h *ProjectAPIHandler) DeleteProject(c *gin.Context) {
    userID, exists := middleware.GetUserID(c)
    if !exists {
        c.JSON(http.StatusUnauthorized, models.APIResponse{
            Success: false,
            Error:   "User not authenticated",
        })
        return
    }

    projectIDStr := c.Param("id")
    projectID, err := strconv.Atoi(projectIDStr)
    if err != nil {
        c.JSON(http.StatusBadRequest, models.APIResponse{
            Success: false,
            Error:   "Invalid project ID",
        })
        return
    }

    err = h.projectService.DeleteProject(projectID, userID)
    if err != nil {
        c.JSON(http.StatusInternalServerError, models.APIResponse{
            Success: false,
            Error:   "Failed to delete project",
        })
        return
    }

    c.JSON(http.StatusOK, models.APIResponse{
        Success: true,
        Message: "Project deleted successfully",
    })
}

// SaveProjectData handles saving project data
func (h *ProjectAPIHandler) SaveProjectData(c *gin.Context) {
    userID, exists := middleware.GetUserID(c)
    if !exists {
        c.JSON(http.StatusUnauthorized, models.APIResponse{
            Success: false,
            Error:   "User not authenticated",
        })
        return
    }

    projectIDStr := c.Param("id")
    projectID, err := strconv.Atoi(projectIDStr)
    if err != nil {
        c.JSON(http.StatusBadRequest, models.APIResponse{
            Success: false,
            Error:   "Invalid project ID",
        })
        return
    }

    var requestBody struct {
        ProjectData json.RawMessage `json:"project_data" binding:"required"`
    }

    if err := c.ShouldBindJSON(&requestBody); err != nil {
        c.JSON(http.StatusBadRequest, models.APIResponse{
            Success: false,
            Error:   "Invalid request format",
        })
        return
    }

    err = h.projectService.SaveProjectData(projectID, userID, requestBody.ProjectData)
    if err != nil {
        c.JSON(http.StatusInternalServerError, models.APIResponse{
            Success: false,
            Error:   "Failed to save project data",
        })
        return
    }

    c.JSON(http.StatusOK, models.APIResponse{
        Success: true,
        Message: "Project data saved successfully",
    })
}

// AutoSave handles auto-saving project data
func (h *ProjectAPIHandler) AutoSave(c *gin.Context) {
    userID, exists := middleware.GetUserID(c)
    if !exists {
        c.JSON(http.StatusUnauthorized, models.APIResponse{
            Success: false,
            Error:   "User not authenticated",
        })
        return
    }

    projectIDStr := c.Param("id")
    projectID, err := strconv.Atoi(projectIDStr)
    if err != nil {
        c.JSON(http.StatusBadRequest, models.APIResponse{
            Success: false,
            Error:   "Invalid project ID",
        })
        return
    }

    var requestBody struct {
        Elements []models.Element `json:"elements"`
    }

    if err := c.ShouldBindJSON(&requestBody); err != nil {
        c.JSON(http.StatusBadRequest, models.APIResponse{
            Success: false,
            Error:   "Invalid request format",
        })
        return
    }

    // Create project data with elements
    projectData := models.ProjectData{
        Elements: requestBody.Elements,
        Metadata: models.Metadata{
            Version:   "1.0",
            UpdatedAt: time.Now(),
        },
    }

    jsonData, err := json.Marshal(projectData)
    if err != nil {
        c.JSON(http.StatusInternalServerError, models.APIResponse{
            Success: false,
            Error:   "Failed to serialize project data",
        })
        return
    }

    err = h.projectService.SaveProjectData(projectID, userID, jsonData)
    if err != nil {
        c.JSON(http.StatusInternalServerError, models.APIResponse{
            Success: false,
            Error:   "Auto-save failed",
        })
        return
    }

    c.JSON(http.StatusOK, models.APIResponse{
        Success: true,
        Message: "Auto-save completed",
    })
}

// GetProjectCharacters handles getting characters for a project
func (h *ProjectAPIHandler) GetProjectCharacters(c *gin.Context) {
    userID, exists := middleware.GetUserID(c)
    if !exists {
        c.JSON(http.StatusUnauthorized, models.APIResponse{
            Success: false,
            Error:   "User not authenticated",
        })
        return
    }

    projectIDStr := c.Param("id")
    projectID, err := strconv.Atoi(projectIDStr)
    if err != nil {
        c.JSON(http.StatusBadRequest, models.APIResponse{
            Success: false,
            Error:   "Invalid project ID",
        })
        return
    }

    characters, err := h.characterService.GetProjectCharacters(projectID, userID)
    if err != nil {
        c.JSON(http.StatusInternalServerError, models.APIResponse{
            Success: false,
            Error:   "Failed to fetch characters",
        })
        return
    }

    c.JSON(http.StatusOK, models.APIResponse{
        Success: true,
        Data:    characters,
    })
}

// GetProjectRelationships handles getting relationships for a project
func (h *ProjectAPIHandler) GetProjectRelationships(c *gin.Context) {
    userID, exists := middleware.GetUserID(c)
    if !exists {
        c.JSON(http.StatusUnauthorized, models.APIResponse{
            Success: false,
            Error:   "User not authenticated",
        })
        return
    }

    projectIDStr := c.Param("id")
    projectID, err := strconv.Atoi(projectIDStr)
    if err != nil {
        c.JSON(http.StatusBadRequest, models.APIResponse{
            Success: false,
            Error:   "Invalid project ID",
        })
        return
    }

    relationships, err := h.characterService.GetProjectRelationships(projectID, userID)
    if err != nil {
        c.JSON(http.StatusInternalServerError, models.APIResponse{
            Success: false,
            Error:   "Failed to fetch relationships",
        })
        return
    }

    c.JSON(http.StatusOK, models.APIResponse{
        Success: true,
        Data:    relationships,
    })
}