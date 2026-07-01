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

type PageContentHandler struct {
	service services.PageContentService
}

func NewPageContentHandler(service services.PageContentService) *PageContentHandler {
	return &PageContentHandler{service: service}
}

// GetPublic godoc
// @Summary      Lista conteúdos ativos de uma página
// @Tags         page-contents
// @Produce      json
// @Param        page path string true "Página"
// @Success      200 {object} map[string]interface{}
// @Router       /page-contents/{page} [get]
func (h *PageContentHandler) GetPublic(c *gin.Context) {
	contents, err := h.service.GetActive(c.Param("page"))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar conteúdo da página"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"contents": contents})
}

// GetAll godoc
// @Summary      Lista conteúdos das páginas
// @Tags         page-contents
// @Security     BearerAuth
// @Produce      json
// @Success      200 {object} map[string]interface{}
// @Router       /admin/page-contents [get]
func (h *PageContentHandler) GetAll(c *gin.Context) {
	contents, err := h.service.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar conteúdos"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"contents": contents})
}

// Create godoc
// @Summary      Cria conteúdo de página
// @Tags         page-contents
// @Security     BearerAuth
// @Accept       json
// @Produce      json
// @Param        request body models.PageContentInput true "Conteúdo"
// @Success      201 {object} map[string]interface{}
// @Router       /admin/page-contents [post]
func (h *PageContentHandler) Create(c *gin.Context) {
	var input models.PageContentInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Requisição inválida: " + err.Error()})
		return
	}

	content, err := h.service.Create(input)
	if err != nil {
		if errors.Is(err, services.ErrInvalidPageContent) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Informe página, seção, nome, status válido e pelo menos um conteúdo visível"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao criar conteúdo"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"content": content})
}

// Update godoc
// @Summary      Atualiza conteúdo de página
// @Tags         page-contents
// @Security     BearerAuth
// @Accept       json
// @Produce      json
// @Param        id      path int                 true "ID do conteúdo"
// @Param        request body models.PageContentInput true "Dados atualizados"
// @Success      200 {object} map[string]interface{}
// @Failure      404 {object} map[string]interface{}
// @Router       /admin/page-contents/{id} [put]
func (h *PageContentHandler) Update(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	var input models.PageContentInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Requisição inválida: " + err.Error()})
		return
	}

	content, err := h.service.Update(uint(id), input)
	if err != nil {
		if errors.Is(err, services.ErrInvalidPageContent) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Informe página, seção, nome, status válido e pelo menos um conteúdo visível"})
			return
		}
		if errors.Is(err, repository.ErrPageContentNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Conteúdo não encontrado"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao atualizar conteúdo"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"content": content})
}

// Delete godoc
// @Summary      Remove conteúdo de página
// @Tags         page-contents
// @Security     BearerAuth
// @Param        id path int true "ID do conteúdo"
// @Success      200 {object} map[string]interface{}
// @Failure      404 {object} map[string]interface{}
// @Router       /admin/page-contents/{id} [delete]
func (h *PageContentHandler) Delete(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	if err := h.service.Delete(uint(id)); err != nil {
		if errors.Is(err, repository.ErrPageContentNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Conteúdo não encontrado"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao remover conteúdo"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Conteúdo removido com sucesso"})
}
