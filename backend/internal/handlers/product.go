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

type ProductHandler struct {
	service services.ProductService
}

func NewProductHandler(service services.ProductService) *ProductHandler {
	return &ProductHandler{service: service}
}

// GetPublic godoc
// @Summary      Lista produtos disponíveis
// @Tags         products
// @Produce      json
// @Param        kind query string false "Tipo de produto: Shopping ou Coffee"
// @Success      200 {object} map[string]interface{}
// @Router       /products [get]
func (h *ProductHandler) GetPublic(c *gin.Context) {
	products, err := h.service.GetActive(c.Query("kind"))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar produtos"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"products": products})
}

// GetAll godoc
// @Summary      Lista produtos do backoffice
// @Tags         products
// @Security     BearerAuth
// @Produce      json
// @Param        kind query string false "Tipo de produto: Shopping ou Coffee"
// @Success      200 {object} map[string]interface{}
// @Router       /admin/products [get]
func (h *ProductHandler) GetAll(c *gin.Context) {
	products, err := h.service.GetAll(c.Query("kind"))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar produtos"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"products": products})
}

// Create godoc
// @Summary      Cria produto
// @Tags         products
// @Security     BearerAuth
// @Accept       json
// @Produce      json
// @Param        request body models.ProductInput true "Dados do produto"
// @Success      201 {object} map[string]interface{}
// @Router       /admin/products [post]
func (h *ProductHandler) Create(c *gin.Context) {
	var input models.ProductInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Requisição inválida: " + err.Error()})
		return
	}

	product, err := h.service.Create(input)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao criar produto"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"product": product})
}

// Update godoc
// @Summary      Atualiza produto
// @Tags         products
// @Security     BearerAuth
// @Accept       json
// @Produce      json
// @Param        id      path int                 true "ID do produto"
// @Param        request body models.ProductInput true "Dados atualizados"
// @Success      200 {object} map[string]interface{}
// @Failure      404 {object} map[string]interface{}
// @Router       /admin/products/{id} [put]
func (h *ProductHandler) Update(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	var input models.ProductInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Requisição inválida: " + err.Error()})
		return
	}

	product, err := h.service.Update(uint(id), input)
	if err != nil {
		if errors.Is(err, repository.ErrProductNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Produto não encontrado"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao atualizar produto"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"product": product})
}

// Delete godoc
// @Summary      Remove produto
// @Tags         products
// @Security     BearerAuth
// @Param        id path int true "ID do produto"
// @Success      200 {object} map[string]interface{}
// @Failure      404 {object} map[string]interface{}
// @Router       /admin/products/{id} [delete]
func (h *ProductHandler) Delete(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	if err := h.service.Delete(uint(id)); err != nil {
		if errors.Is(err, repository.ErrProductNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Produto não encontrado"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao remover produto"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Produto removido com sucesso"})
}
