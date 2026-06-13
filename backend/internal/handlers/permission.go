package handlers

import (
	"backend/internal/models"
	"backend/internal/services"
	"net/http"

	"github.com/gin-gonic/gin"
)

type PermissionHandler struct {
	permService services.PermissionService
	userService services.UserBackofficeService
}

func NewPermissionHandler(permService services.PermissionService, userService services.UserBackofficeService) *PermissionHandler {
	return &PermissionHandler{permService: permService, userService: userService}
}

// GetPermissions godoc
// @Summary      Lista permissões de um usuário
// @Description  Retorna todas as permissões do usuário por recurso (inclui "none" para recursos sem entrada)
// @Tags         permissions
// @Produce      json
// @Security     BearerAuth
// @Param        email  path      string  true  "Email do usuário"
// @Success      200    {object}  map[string]interface{}
// @Failure      404    {object}  map[string]interface{}
// @Failure      500    {object}  map[string]interface{}
// @Router       /admin/users/{email}/permissions [get]
func (h *PermissionHandler) GetPermissions(c *gin.Context) {
	email := c.Param("email")

	if _, err := h.userService.GetUserByEmail(email); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Usuário não encontrado"})
		return
	}

	perms, err := h.permService.GetFullPermissions(email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar permissões"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"email": email, "permissions": perms})
}

// SetPermissions godoc
// @Summary      Define permissões de um usuário
// @Description  Substitui todas as permissões do usuário. Entradas com level "none" são ignoradas (ausência = sem acesso).
// @Tags         permissions
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        email    path      string                       true  "Email do usuário"
// @Param        request  body      models.SetPermissionsRequest true  "Permissões"
// @Success      200      {object}  map[string]interface{}
// @Failure      400      {object}  map[string]interface{}
// @Failure      404      {object}  map[string]interface{}
// @Failure      500      {object}  map[string]interface{}
// @Router       /admin/users/{email}/permissions [put]
func (h *PermissionHandler) SetPermissions(c *gin.Context) {
	email := c.Param("email")

	if _, err := h.userService.GetUserByEmail(email); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Usuário não encontrado"})
		return
	}

	var req models.SetPermissionsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Requisição inválida: " + err.Error()})
		return
	}

	if err := h.permService.SetUserPermissions(email, req.Permissions); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao salvar permissões"})
		return
	}

	perms, err := h.permService.GetFullPermissions(email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao retornar permissões atualizadas"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Permissões atualizadas com sucesso!", "permissions": perms})
}
