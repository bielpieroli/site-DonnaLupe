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

// CreatePixPayment godoc
// @Summary      Cria pagamento PIX via Mercado Pago
// @Description  Recebe os itens do carrinho e dados do cliente, cria um pagamento PIX e retorna o QR code.
// @Tags         checkout
// @Accept       json
// @Produce      json
// @Param        request body models.CheckoutPixRequest true "Itens, frete e dados do cliente"
// @Success      201 {object} models.CheckoutPixResponse
// @Failure      400 {object} map[string]interface{}
// @Failure      502 {object} map[string]interface{}
// @Router       /checkout/pix [post]
func (h *CheckoutHandler) CreatePixPayment(c *gin.Context) {
	var req models.CheckoutPixRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Requisição inválida: " + err.Error()})
		return
	}

	pix, err := h.service.CreatePixPayment(req)
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, pix)
}
