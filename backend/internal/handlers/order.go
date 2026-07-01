package handlers

import (
	"backend/internal/repository"
	"backend/internal/services"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

var webhookClient = &http.Client{Timeout: 10 * time.Second}

type OrderHandler struct {
	service services.OrderService
	mpToken string
}

func NewOrderHandler(service services.OrderService, mpToken string) *OrderHandler {
	return &OrderHandler{service: service, mpToken: mpToken}
}

// GetAll godoc
// @Summary      Lista pedidos
// @Tags         orders
// @Security     BearerAuth
// @Produce      json
// @Param        status          query string false "Filtro por status do pedido"
// @Param        delivery_status query string false "Filtro por status de entrega"
// @Param        delivery_mode   query string false "Filtro por modo de entrega"
// @Success      200 {object} map[string]interface{}
// @Router       /admin/orders [get]
func (h *OrderHandler) GetAll(c *gin.Context) {
	filters := repository.OrderFilters{
		Status:         c.Query("status"),
		DeliveryStatus: c.Query("delivery_status"),
		DeliveryMode:   c.Query("delivery_mode"),
	}
	orders, err := h.service.GetAll(filters)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar pedidos"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"orders": orders})
}

// GetByID godoc
// @Summary      Detalhes de um pedido
// @Tags         orders
// @Security     BearerAuth
// @Param        id path int true "ID do pedido"
// @Success      200 {object} map[string]interface{}
// @Router       /admin/orders/{id} [get]
func (h *OrderHandler) GetByID(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}
	order, err := h.service.GetByID(uint(id))
	if err != nil {
		if errors.Is(err, repository.ErrOrderNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Pedido não encontrado"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar pedido"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"order": order})
}

// UpdateDeliveryStatus godoc
// @Summary      Atualiza status de entrega de um pedido
// @Tags         orders
// @Security     BearerAuth
// @Accept       json
// @Produce      json
// @Param        id      path int                         true "ID do pedido"
// @Param        request body map[string]string           true "Novo status"
// @Success      200 {object} map[string]interface{}
// @Router       /admin/orders/{id}/delivery-status [put]
func (h *OrderHandler) UpdateDeliveryStatus(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}
	var body struct {
		DeliveryStatus string `json:"delivery_status" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Requisição inválida: " + err.Error()})
		return
	}
	order, err := h.service.UpdateDeliveryStatus(uint(id), body.DeliveryStatus)
	if err != nil {
		if errors.Is(err, repository.ErrOrderNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Pedido não encontrado"})
			return
		}
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"order": order})
}

// ConfirmPayment godoc
// @Summary      Confirma pagamento de um pedido manualmente
// @Tags         orders
// @Security     BearerAuth
// @Param        id path int true "ID do pedido"
// @Success      200 {object} map[string]interface{}
// @Router       /admin/orders/{id}/confirm-payment [put]
func (h *OrderHandler) ConfirmPayment(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}
	order, err := h.service.ConfirmPayment(uint(id))
	if err != nil {
		if errors.Is(err, repository.ErrOrderNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Pedido não encontrado"})
			return
		}
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"order": order, "message": "Pagamento confirmado com sucesso."})
}

// Refund godoc
// @Summary      Reembolsa e cancela um pedido pago
// @Tags         orders
// @Security     BearerAuth
// @Param        id path int true "ID do pedido"
// @Success      200 {object} map[string]interface{}
// @Router       /admin/orders/{id}/refund [post]
func (h *OrderHandler) Refund(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}
	if err := h.service.Refund(uint(id)); err != nil {
		if errors.Is(err, repository.ErrOrderNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Pedido não encontrado"})
			return
		}
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Pedido reembolsado e cancelado com sucesso."})
}

// SetCompleted godoc
// @Summary      Marca ou desmarca um pedido como concluído
// @Tags         orders
// @Security     BearerAuth
// @Accept       json
// @Param        id      path int  true "ID do pedido"
// @Param        request body object true "{ completed: bool }"
// @Success      200 {object} map[string]interface{}
// @Router       /admin/orders/{id}/completed [put]
func (h *OrderHandler) SetCompleted(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}
	var body struct {
		Completed bool `json:"completed"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Requisição inválida: " + err.Error()})
		return
	}
	order, err := h.service.SetCompleted(uint(id), body.Completed)
	if err != nil {
		if errors.Is(err, repository.ErrOrderNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Pedido não encontrado"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao atualizar pedido"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"order": order})
}

// GetPixStatus godoc
// @Summary      Consulta o status de um pagamento PIX pelo payment_id
// @Tags         checkout
// @Param        payment_id path string true "ID do pagamento no Mercado Pago"
// @Success      200 {object} map[string]interface{}
// @Router       /checkout/pix/{payment_id}/status [get]
func (h *OrderHandler) GetPixStatus(c *gin.Context) {
	paymentID := c.Param("payment_id")
	if paymentID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "payment_id inválido"})
		return
	}
	status, err := h.service.GetOrderStatusByPaymentID(paymentID)
	if err != nil {
		if errors.Is(err, repository.ErrOrderNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Pagamento não encontrado"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao consultar status"})
		return
	}

	// Se ainda pendente, consulta o MP em tempo real para detectar pagamento sem webhook.
	if status == "pending" {
		if mpStatus := h.fetchMPPaymentStatus(paymentID); mpStatus != "" {
			h.service.UpdatePayment(paymentID, mpStatus) //nolint:errcheck
			if updated, err2 := h.service.GetOrderStatusByPaymentID(paymentID); err2 == nil {
				status = updated
			}
		}
	}

	c.JSON(http.StatusOK, gin.H{"status": status})
}

// Webhook recebe notificações de pagamento do Mercado Pago.
// @Router /webhook/mp [post]
func (h *OrderHandler) Webhook(c *gin.Context) {
	var payload struct {
		Type string `json:"type"`
		Data struct {
			ID string `json:"id"`
		} `json:"data"`
	}
	if err := json.NewDecoder(c.Request.Body).Decode(&payload); err != nil || payload.Type != "payment" || payload.Data.ID == "" {
		c.Status(http.StatusOK)
		return
	}

	go h.processPayment(payload.Data.ID)
	c.Status(http.StatusOK)
}

func (h *OrderHandler) processPayment(paymentID string) {
	if mpStatus := h.fetchMPPaymentStatus(paymentID); mpStatus != "" {
		h.service.UpdatePayment(paymentID, mpStatus) //nolint:errcheck
	}
}

// fetchMPPaymentStatus consulta a API do Mercado Pago e retorna o status do pagamento,
// ou string vazia se não for possível obter.
func (h *OrderHandler) fetchMPPaymentStatus(paymentID string) string {
	if h.mpToken == "" {
		return ""
	}
	req, err := http.NewRequest(http.MethodGet,
		fmt.Sprintf("https://api.mercadopago.com/v1/payments/%s", paymentID), nil)
	if err != nil {
		return ""
	}
	req.Header.Set("Authorization", "Bearer "+h.mpToken)

	resp, err := webhookClient.Do(req)
	if err != nil {
		return ""
	}
	defer resp.Body.Close()

	var payment struct {
		Status string `json:"status"`
	}
	if json.NewDecoder(resp.Body).Decode(&payment) != nil {
		return ""
	}
	return payment.Status
}
