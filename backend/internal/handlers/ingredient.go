package handlers

import (
	"backend/internal/models"
	"backend/internal/repository"
	"backend/internal/services"
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
)

type IngredientHandler struct {
	service services.IngredientService
}

func NewIngredientHandler(service services.IngredientService) *IngredientHandler {
	return &IngredientHandler{service: service}
}

// GetAll godoc
// @Summary      Lista ingredientes
// @Description  Lista o estoque de ingredientes cadastrados
// @Tags         ingredients
// @Security     BearerAuth
// @Produce      json
// @Success      200 {object} map[string]interface{}
// @Router       /admin/ingredients [get]
func (h *IngredientHandler) GetAll(c *gin.Context) {
	ingredients, err := h.service.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar ingredientes"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"ingredients": ingredients})
}

// Create godoc
// @Summary      Cadastra ingrediente
// @Description  Cadastra um novo ingrediente do estoque
// @Tags         ingredients
// @Security     BearerAuth
// @Accept       json
// @Produce      json
// @Param        request body models.CreateIngredientRequest true "Dados do ingrediente"
// @Success      201 {object} map[string]interface{}
// @Failure      400 {object} map[string]interface{}
// @Failure      409 {object} map[string]interface{}
// @Router       /admin/ingredients [post]
func (h *IngredientHandler) Create(c *gin.Context) {
	var input models.CreateIngredientRequest
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Requisição inválida: " + err.Error()})
		return
	}

	ingredient, err := h.service.Create(input)
	if err != nil {
		if errors.Is(err, services.ErrIngredientAlreadyExists) {
			c.JSON(http.StatusConflict, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"ingredient": ingredient})
}

// Update godoc
// @Summary      Atualiza ingrediente
// @Description  Atualiza estoque, unidade ou valor de um ingrediente
// @Tags         ingredients
// @Security     BearerAuth
// @Accept       json
// @Produce      json
// @Param        name    path string                         true "Nome do ingrediente"
// @Param        request body models.UpdateIngredientRequest true "Dados para atualização"
// @Success      200 {object} map[string]interface{}
// @Failure      400 {object} map[string]interface{}
// @Failure      404 {object} map[string]interface{}
// @Router       /admin/ingredients/{name} [put]
func (h *IngredientHandler) Update(c *gin.Context) {
	name := c.Param("name")

	var input models.UpdateIngredientRequest
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Requisição inválida: " + err.Error()})
		return
	}

	ingredient, err := h.service.Update(name, input)
	if err != nil {
		if errors.Is(err, repository.ErrIngredientNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Ingrediente não encontrado"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao atualizar ingrediente"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"ingredient": ingredient})
}

// Delete godoc
// @Summary      Remove ingrediente
// @Description  Remove um ingrediente e seus vínculos em product_ingredients
// @Tags         ingredients
// @Security     BearerAuth
// @Param        name path string true "Nome do ingrediente"
// @Success      200 {object} map[string]interface{}
// @Failure      404 {object} map[string]interface{}
// @Router       /admin/ingredients/{name} [delete]
func (h *IngredientHandler) Delete(c *gin.Context) {
	name := c.Param("name")

	if err := h.service.Delete(name); err != nil {
		if errors.Is(err, repository.ErrIngredientNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Ingrediente não encontrado"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao remover ingrediente"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Ingrediente removido com sucesso"})
}
