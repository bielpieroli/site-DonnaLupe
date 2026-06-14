package handlers

import (
	"backend/internal/models"
	"backend/internal/repository"
	"backend/internal/services"
	"errors"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type UserBackofficeHandler struct {
	service     services.UserBackofficeService
	permService services.PermissionService
}

func NewUserBackofficeHandler(service services.UserBackofficeService, permService services.PermissionService) *UserBackofficeHandler {
	return &UserBackofficeHandler{service: service, permService: permService}
}

// Register godoc
// @Summary      Registra usuário backoffice
// @Description  Cria um novo usuário do backoffice, com permissões opcionais
// @Tags         auth
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        request  body      models.CreateUserBackofficeRequest  true  "Dados do usuário"
// @Success      201      {object}  map[string]interface{}
// @Failure      400      {object}  map[string]interface{}
// @Failure      409      {object}  map[string]interface{}
// @Failure      500      {object}  map[string]interface{}
// @Router       /admin/auth/register [post]
func (h *UserBackofficeHandler) Register(c *gin.Context) {
	var req models.CreateUserBackofficeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		if len(req.Password) < 8 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "A senha deve conter no mínimo 8 caracteres"})
			return
		}
		c.JSON(http.StatusBadRequest, gin.H{"error": "Campo e-mail fora do padrão"})
		return
	}

	user, err := h.service.CreateUser(req)
	if err != nil {
		if errors.Is(err, services.ErrEmailAlreadyExists) {
			c.JSON(http.StatusConflict, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if len(req.Permissions) > 0 {
		if err := h.permService.SetUserPermissions(user.Email, req.Permissions); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Usuário criado, mas erro ao salvar permissões: " + err.Error()})
			return
		}
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Usuário criado com sucesso!", "user": user})
}

// GetAllUsers godoc
// @Summary      Lista usuários backoffice
// @Description  Retorna todos os usuários do backoffice com paginação e filtros
// @Tags         users
// @Produce      json
// @Security     BearerAuth
// @Param        page          query     int     false  "Página"          default(1)
// @Param        limit         query     int     false  "Limite"          default(10)
// @Param        sort_by       query     string  false  "Ordenar por"     default(email)
// @Param        sort_order    query     string  false  "Ordem"           default(asc)
// @Param        search_by     query     string  false  "Campo de busca"
// @Param        search_value  query     string  false  "Valor de busca"
// @Success      200           {object}  map[string]interface{}
// @Failure      400           {object}  map[string]interface{}
// @Failure      500           {object}  map[string]interface{}
// @Router       /admin/users [get]
func (h *UserBackofficeHandler) GetAllUsers(c *gin.Context) {
	page := 1
	limit := 10
	sortBy := c.DefaultQuery("sort_by", "email")
	sortOrder := c.DefaultQuery("sort_order", "asc")
	searchBy := c.Query("search_by")
	searchValue := c.Query("search_value")

	if pageQuery := c.Query("page"); pageQuery != "" {
		parsed, err := strconv.Atoi(pageQuery)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Parâmetro 'page' inválido"})
			return
		}
		page = parsed
	}

	if limitQuery := c.Query("limit"); limitQuery != "" {
		parsed, err := strconv.Atoi(limitQuery)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Parâmetro 'limit' inválido"})
			return
		}
		limit = parsed
	}

	result, err := h.service.GetAllUsers(page, limit, sortBy, sortOrder, searchBy, searchValue)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"page":             page,
		"limit":            limit,
		"sort_by":          sortBy,
		"sort_order":       sortOrder,
		"search_by":        searchBy,
		"search_value":     searchValue,
		"total_records":    result.TotalRecords,
		"filtered_records": result.FilteredRecords,
		"users":            result.Users,
	})
}

// GetUserByEmail godoc
// @Summary      Busca usuário backoffice por email
// @Description  Retorna um usuário do backoffice pelo email
// @Tags         users
// @Produce      json
// @Security     BearerAuth
// @Param        email  path      string  true  "Email do usuário"
// @Success      200    {object}  map[string]interface{}
// @Failure      404    {object}  map[string]interface{}
// @Router       /admin/users/{email} [get]
func (h *UserBackofficeHandler) GetUserByEmail(c *gin.Context) {
	email := c.Param("email")

	user, err := h.service.GetUserByEmail(email)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Usuário não encontrado"})
		return
	}

	c.JSON(http.StatusOK, user)
}

// UpdateUser godoc
// @Summary      Atualiza usuário backoffice
// @Description  Atualiza a senha de um usuário do backoffice
// @Tags         users
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        email    path      string                              true  "Email do usuário"
// @Param        request  body      models.UpdateUserBackofficeRequest  true  "Dados para atualização"
// @Success      200      {object}  map[string]interface{}
// @Failure      400      {object}  map[string]interface{}
// @Failure      404      {object}  map[string]interface{}
// @Failure      500      {object}  map[string]interface{}
// @Router       /admin/users/{email} [put]
func (h *UserBackofficeHandler) UpdateUser(c *gin.Context) {
	email := c.Param("email")

	var req models.UpdateUserBackofficeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		if len(req.Password) < 8 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "A senha deve conter no mínimo 8 caracteres"})
			return
		}
		c.JSON(http.StatusBadRequest, gin.H{"error": "Requisição inválida"})
		return
	}

	if err := h.service.UpdateUser(email, req); err != nil {
		if errors.Is(err, repository.ErrUserBackofficeNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Usuário não encontrado"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Usuário atualizado com sucesso!"})
}

// DeleteUser godoc
// @Summary      Remove usuário backoffice
// @Description  Remove um usuário do backoffice e todas as suas permissões
// @Tags         users
// @Produce      json
// @Security     BearerAuth
// @Param        email  path      string  true  "Email do usuário"
// @Success      200    {object}  map[string]interface{}
// @Failure      404    {object}  map[string]interface{}
// @Failure      500    {object}  map[string]interface{}
// @Router       /admin/users/{email} [delete]
func (h *UserBackofficeHandler) DeleteUser(c *gin.Context) {
	email := c.Param("email")

	if _, err := h.service.GetUserByEmail(email); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Usuário a ser deletado não existe"})
		return
	}

	if err := h.permService.DeleteByEmail(email); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao remover permissões do usuário"})
		return
	}

	if err := h.service.DeleteUser(email); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Usuário removido com sucesso!"})
}
