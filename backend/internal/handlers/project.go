package handlers

import (
    "encoding/json"
    "net/http"
    "backend/internal/middleware"
    "backend/internal/models"
    "backend/internal/services"
    "strconv"
    "time"

    "github.com/gin-gonic/gin"
)

type ProjectHandler struct {
    projectService *services.ProjectService
}

func NewProjectHandler(projectService *services.ProjectService) *ProjectHandler {
    return &ProjectHandler{
        projectService: projectService,
    }
}

func (h *ProjectHandler) CreateProject(c *gin.Context) {
    userID, exists := middleware.GetUserID(c)
    if !exists {
        c.JSON(http.StatusUnauthorized, models.ErrorResponse{
            Error:   "unauthorized",
            Message: "User not authenticated",
        })
        return
    }

    var req models.CreateProjectRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, models.ErrorResponse{
            Error:   "invalid_request",
            Message: err.Error(),
        })
        return
    }

    project, err := h.projectService.CreateProject(userID, req)
    if err != nil {
        c.JSON(http.StatusInternalServerError, models.ErrorResponse{
            Error:   "creation_failed",
            Message: err.Error(),
        })
        return
    }

    c.JSON(http.StatusCreated, models.SuccessResponse{
        Message: "Project created successfully",
        Data:    project,
    })
}

func (h *ProjectHandler) GetProjects(c *gin.Context) {
    userID, exists := middleware.GetUserID(c)
    if !exists {
        // If not authenticated, return public projects
        projects, err := h.projectService.GetAllProjects()
        if err != nil {
            c.JSON(http.StatusInternalServerError, models.ErrorResponse{
                Error:   "fetch_failed",
                Message: err.Error(),
            })
            return
        }
        c.JSON(http.StatusOK, projects)
        return
    }

    // If authenticated, return user's projects
    projects, err := h.projectService.GetProjectsByUser(userID)
    if err != nil {
        c.JSON(http.StatusInternalServerError, models.ErrorResponse{
            Error:   "fetch_failed",
            Message: err.Error(),
        })
        return
    }

    c.JSON(http.StatusOK, projects)
}

func (h *ProjectHandler) GetAllProjects(c *gin.Context) {
    projects, err := h.projectService.GetAllProjects()
    if err != nil {
        c.JSON(http.StatusInternalServerError, models.ErrorResponse{
            Error:   "fetch_failed",
            Message: err.Error(),
        })
        return
    }

    c.JSON(http.StatusOK, projects)
}

func (h *ProjectHandler) GetProject(c *gin.Context) {
    userID, exists := middleware.GetUserID(c)
    if !exists {
        c.JSON(http.StatusUnauthorized, models.ErrorResponse{
            Error:   "unauthorized",
            Message: "User not authenticated",
        })
        return
    }

    projectIDStr := c.Param("id")
    projectID, err := strconv.Atoi(projectIDStr)
    if err != nil {
        c.JSON(http.StatusBadRequest, models.ErrorResponse{
            Error:   "invalid_project_id",
            Message: "Project ID must be a number",
        })
        return
    }

    project, err := h.projectService.GetProjectByID(projectID, userID)
    if err != nil {
        c.JSON(http.StatusNotFound, models.ErrorResponse{
            Error:   "project_not_found",
            Message: err.Error(),
        })
        return
    }

    c.JSON(http.StatusOK, models.SuccessResponse{
        Message: "Project retrieved successfully",
        Data:    project,
    })
}

func (h *ProjectHandler) UpdateProject(c *gin.Context) {
    userID, exists := middleware.GetUserID(c)
    if !exists {
        c.JSON(http.StatusUnauthorized, models.ErrorResponse{
            Error:   "unauthorized",
            Message: "User not authenticated",
        })
        return
    }

    projectIDStr := c.Param("id")
    projectID, err := strconv.Atoi(projectIDStr)
    if err != nil {
        c.JSON(http.StatusBadRequest, models.ErrorResponse{
            Error:   "invalid_project_id",
            Message: "Project ID must be a number",
        })
        return
    }

    var req models.UpdateProjectRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, models.ErrorResponse{
            Error:   "invalid_request",
            Message: err.Error(),
        })
        return
    }

    project, err := h.projectService.UpdateProject(projectID, userID, req)
    if err != nil {
        c.JSON(http.StatusInternalServerError, models.ErrorResponse{
            Error:   "update_failed",
            Message: err.Error(),
        })
        return
    }

    c.JSON(http.StatusOK, models.SuccessResponse{
        Message: "Project updated successfully",
        Data:    project,
    })
}

func (h *ProjectHandler) DeleteProject(c *gin.Context) {
    userID, exists := middleware.GetUserID(c)
    if !exists {
        c.JSON(http.StatusUnauthorized, models.ErrorResponse{
            Error:   "unauthorized",
            Message: "User not authenticated",
        })
        return
    }

    projectIDStr := c.Param("id")
    projectID, err := strconv.Atoi(projectIDStr)
    if err != nil {
        c.JSON(http.StatusBadRequest, models.ErrorResponse{
            Error:   "invalid_project_id",
            Message: "Project ID must be a number",
        })
        return
    }

    err = h.projectService.DeleteProject(projectID, userID)
    if err != nil {
        c.JSON(http.StatusInternalServerError, models.ErrorResponse{
            Error:   "deletion_failed",
            Message: err.Error(),
        })
        return
    }

    c.JSON(http.StatusOK, models.SuccessResponse{
        Message: "Project deleted successfully",
    })
}

func (h *ProjectHandler) SaveProjectData(c *gin.Context) {
    userID, exists := middleware.GetUserID(c)
    if !exists {
        c.JSON(http.StatusUnauthorized, models.ErrorResponse{
            Error:   "unauthorized",
            Message: "User not authenticated",
        })
        return
    }

    projectIDStr := c.Param("id")
    projectID, err := strconv.Atoi(projectIDStr)
    if err != nil {
        c.JSON(http.StatusBadRequest, models.ErrorResponse{
            Error:   "invalid_project_id",
            Message: "Project ID must be a number",
        })
        return
    }

    var requestBody struct {
        ProjectData json.RawMessage `json:"project_data" binding:"required"`
    }

    if err := c.ShouldBindJSON(&requestBody); err != nil {
        c.JSON(http.StatusBadRequest, models.ErrorResponse{
            Error:   "invalid_request",
            Message: err.Error(),
        })
        return
    }

    err = h.projectService.SaveProjectData(projectID, userID, requestBody.ProjectData)
    if err != nil {
        c.JSON(http.StatusInternalServerError, models.ErrorResponse{
            Error:   "save_failed",
            Message: err.Error(),
        })
        return
    }

    c.JSON(http.StatusOK, models.SuccessResponse{
        Message: "Project data saved successfully",
    })
}

// AutoSave endpoint for frequent saves without full project updates
func (h *ProjectHandler) AutoSave(c *gin.Context) {
    userID, exists := middleware.GetUserID(c)
    if !exists {
        c.JSON(http.StatusUnauthorized, models.ErrorResponse{
            Error:   "unauthorized",
            Message: "User not authenticated",
        })
        return
    }

    projectIDStr := c.Param("id")
    projectID, err := strconv.Atoi(projectIDStr)
    if err != nil {
        c.JSON(http.StatusBadRequest, models.ErrorResponse{
            Error:   "invalid_project_id",
            Message: "Project ID must be a number",
        })
        return
    }

    var requestBody struct {
        Elements []models.Element `json:"elements"`
    }

    if err := c.ShouldBindJSON(&requestBody); err != nil {
        c.JSON(http.StatusBadRequest, models.ErrorResponse{
            Error:   "invalid_request",
            Message: err.Error(),
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
        c.JSON(http.StatusInternalServerError, models.ErrorResponse{
            Error:   "serialization_failed",
            Message: "Failed to serialize project data",
        })
        return
    }

    err = h.projectService.SaveProjectData(projectID, userID, jsonData)
    if err != nil {
        c.JSON(http.StatusInternalServerError, models.ErrorResponse{
            Error:   "autosave_failed",
            Message: err.Error(),
        })
        return
    }

    c.JSON(http.StatusOK, models.SuccessResponse{
        Message: "Auto-save completed",
    })
}