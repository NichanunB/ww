package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"
	"time"

	"backend/internal/middleware"
	"backend/internal/models"
	"backend/internal/services"

	"github.com/gin-gonic/gin"
)

// ProjectHandler handles project-related endpoints.
type ProjectHandler struct {
	projectService *services.ProjectService
}

func NewProjectHandler(projectService *services.ProjectService) *ProjectHandler {
	return &ProjectHandler{
		projectService: projectService,
	}
}

// CreateProject handles POST /projects
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

// GetProjects handles GET /projects
func (h *ProjectHandler) GetProjects(c *gin.Context) {
	userID, exists := middleware.GetUserID(c)
	if !exists {
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

// GetAllProjects handles GET /projects/all
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

// GetProject handles GET /projects/:id
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

// UpdateProject handles PUT /projects/:id
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

	log.Println("🔍 UpdateProjectRequest:", req) // ✅ Debug จุดนี้

	project, err := h.projectService.UpdateProject(projectID, userID, req)
	if err != nil {
		log.Println("❌ UpdateProject error:", err) // ✅ Log error ก่อนส่งกลับ
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

// DeleteProject handles DELETE /projects/:id
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

	if err := h.projectService.DeleteProject(projectID, userID); err != nil {
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

// SaveProjectData handles PUT /projects/:id/data
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

	if err := h.projectService.SaveProjectData(projectID, userID, requestBody.ProjectData); err != nil {
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

// AutoSave handles PATCH /projects/:id/autosave
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

	if err := h.projectService.SaveProjectData(projectID, userID, jsonData); err != nil {
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

// GetPublicProject handles GET /projects/public/:id
func (h *ProjectHandler) GetPublicProject(c *gin.Context) {
	projectIDStr := c.Param("id")
	projectID, err := strconv.Atoi(projectIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_project_id",
			Message: "Project ID must be a number",
		})
		return
	}

	project := h.projectService.GetPublicProjectByID(projectID)
	if project == nil {
		c.JSON(http.StatusNotFound, models.ErrorResponse{
			Error:   "project_not_found",
			Message: "Project not found",
		})
		return
	}

	c.JSON(http.StatusOK, models.SuccessResponse{
		Message: "Public project retrieved successfully",
		Data:    project,
	})
}

// UploadCoverImage handles POST /projects/:id/cover
func (h *ProjectHandler) UploadCoverImage(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, models.ErrorResponse{
		Error:   "not_implemented",
		Message: "Cover image upload not implemented yet",
	})
}

// UploadCharacterImage handles POST /projects/:id/character-image
func (h *ProjectHandler) UploadCharacterImage(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, models.ErrorResponse{
		Error:   "not_implemented",
		Message: "Character image upload not implemented yet",
	})
}
