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

type FreightHandler struct {
	service services.FreightService
}

func NewFreightHandler(service services.FreightService) *FreightHandler {
	return &FreightHandler{service: service}
}

// Quote godoc
// @Summary      Calcula frete para um endereço de entrega
// @Description  Usa a Distance Matrix API do Google Maps para calcular a distância até a loja e retorna o preço de frete conforme as faixas cadastradas.
// @Tags         freight
// @Accept       json
// @Produce      json
// @Param        request body models.FreightQuoteRequest true "Endereço completo de entrega"
// @Success      200 {object} map[string]interface{}
// @Failure      400 {object} map[string]interface{}
// @Failure      422 {object} map[string]interface{}
// @Router       /freight/quote [post]
func (h *FreightHandler) Quote(c *gin.Context) {
	var req models.FreightQuoteRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Requisição inválida: " + err.Error()})
		return
	}

	quote, err := h.service.CalculateFreight(req.CEP)
	if err != nil {
		c.JSON(http.StatusUnprocessableEntity, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"quote": quote})
}

// GetRules godoc
// @Summary      Lista faixas de frete cadastradas
// @Tags         freight
// @Security     BearerAuth
// @Produce      json
// @Success      200 {object} map[string]interface{}
// @Router       /admin/freight/rules [get]
func (h *FreightHandler) GetRules(c *gin.Context) {
	rules, err := h.service.GetAllRules()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar regras de frete"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"rules": rules})
}

// CreateRule godoc
// @Summary      Cria uma faixa de frete
// @Tags         freight
// @Security     BearerAuth
// @Accept       json
// @Produce      json
// @Param        request body models.FreightRuleInput true "Dados da regra"
// @Success      201 {object} map[string]interface{}
// @Router       /admin/freight/rules [post]
func (h *FreightHandler) CreateRule(c *gin.Context) {
	var input models.FreightRuleInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Requisição inválida: " + err.Error()})
		return
	}

	rule, err := h.service.CreateRule(input)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao criar regra de frete"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"rule": rule})
}

// UpdateRule godoc
// @Summary      Atualiza uma faixa de frete
// @Tags         freight
// @Security     BearerAuth
// @Accept       json
// @Produce      json
// @Param        id      path int                      true "ID da regra"
// @Param        request body models.FreightRuleInput  true "Dados atualizados"
// @Success      200 {object} map[string]interface{}
// @Failure      404 {object} map[string]interface{}
// @Router       /admin/freight/rules/{id} [put]
func (h *FreightHandler) UpdateRule(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	var input models.FreightRuleInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Requisição inválida: " + err.Error()})
		return
	}

	rule, err := h.service.UpdateRule(uint(id), input)
	if err != nil {
		if errors.Is(err, repository.ErrFreightRuleNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Regra não encontrada"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao atualizar regra"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"rule": rule})
}

// DeleteRule godoc
// @Summary      Remove uma faixa de frete
// @Tags         freight
// @Security     BearerAuth
// @Param        id path int true "ID da regra"
// @Success      200 {object} map[string]interface{}
// @Failure      404 {object} map[string]interface{}
// @Router       /admin/freight/rules/{id} [delete]
func (h *FreightHandler) DeleteRule(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	if err := h.service.DeleteRule(uint(id)); err != nil {
		if errors.Is(err, repository.ErrFreightRuleNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Regra não encontrada"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao remover regra"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Regra removida com sucesso"})
}
