package handlers

import (
	"backend/internal/models"
	"backend/internal/services"
	"net/http"

	"github.com/gin-gonic/gin"
)

type CheckoutHandler struct {
	service services.CheckoutService
}

func NewCheckoutHandler(service services.CheckoutService) *CheckoutHandler {
	return &CheckoutHandler{service: service}
}

// CreatePreference godoc
// @Summary      Cria preferência de pagamento no Mercado Pago
// @Description  Recebe os itens do carrinho e o custo de frete, cria uma preferência server-side no Mercado Pago e retorna o link de checkout.
// @Tags         checkout
// @Accept       json
// @Produce      json
// @Param        request body models.CheckoutPreferenceRequest true "Itens e frete"
// @Success      201 {object} models.CheckoutPreferenceResponse
// @Failure      400 {object} map[string]interface{}
// @Failure      502 {object} map[string]interface{}
// @Router       /checkout/preference [post]
func (h *CheckoutHandler) CreatePreference(c *gin.Context) {
	var req models.CheckoutPreferenceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Requisição inválida: " + err.Error()})
		return
	}

	pref, err := h.service.CreatePreference(req)
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, pref)
}
