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

type LandingHandler struct {
	service services.LandingService
}

func NewLandingHandler(service services.LandingService) *LandingHandler {
	return &LandingHandler{service: service}
}

// GetPublic godoc
// @Summary      Lista conteúdos ativos da landing page
// @Tags         landing
// @Produce      json
// @Success      200 {object} map[string]interface{}
// @Router       /landing [get]
func (h *LandingHandler) GetPublic(c *gin.Context) {
	contents, err := h.service.GetActive()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar landing page"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"contents": contents})
}

// GetAll godoc
// @Summary      Lista conteúdos da landing page
// @Tags         landing
// @Security     BearerAuth
// @Produce      json
// @Success      200 {object} map[string]interface{}
// @Router       /admin/landing [get]
func (h *LandingHandler) GetAll(c *gin.Context) {
	contents, err := h.service.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar landing page"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"contents": contents})
}

// Create godoc
// @Summary      Cria conteúdo da landing page
// @Tags         landing
// @Security     BearerAuth
// @Accept       json
// @Produce      json
// @Param        request body models.LandingContentInput true "Conteúdo da landing"
// @Success      201 {object} map[string]interface{}
// @Router       /admin/landing [post]
func (h *LandingHandler) Create(c *gin.Context) {
	var input models.LandingContentInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Requisição inválida: " + err.Error()})
		return
	}

	content, err := h.service.Create(input)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao criar conteúdo"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"content": content})
}

// Update godoc
// @Summary      Atualiza conteúdo da landing page
// @Tags         landing
// @Security     BearerAuth
// @Accept       json
// @Produce      json
// @Param        id      path int true "ID do conteúdo"
// @Param        request body models.LandingContentInput true "Conteúdo atualizado"
// @Success      200 {object} map[string]interface{}
// @Router       /admin/landing/{id} [put]
func (h *LandingHandler) Update(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	var input models.LandingContentInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Requisição inválida: " + err.Error()})
		return
	}

	content, err := h.service.Update(uint(id), input)
	if err != nil {
		if errors.Is(err, repository.ErrLandingContentNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Conteúdo não encontrado"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao atualizar conteúdo"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"content": content})
}

// Delete godoc
// @Summary      Remove conteúdo da landing page
// @Tags         landing
// @Security     BearerAuth
// @Param        id path int true "ID do conteúdo"
// @Success      200 {object} map[string]interface{}
// @Router       /admin/landing/{id} [delete]
func (h *LandingHandler) Delete(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	if err := h.service.Delete(uint(id)); err != nil {
		if errors.Is(err, repository.ErrLandingContentNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Conteúdo não encontrado"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao remover conteúdo"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Conteúdo removido com sucesso"})
}
