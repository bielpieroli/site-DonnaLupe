package services

import (
	"backend/internal/models"
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"
)

var mpClient = &http.Client{Timeout: 10 * time.Second}

type CheckoutService interface {
	CreatePixPayment(req models.CheckoutPixRequest) (*models.CheckoutPixResponse, error)
}

type checkoutService struct {
	accessToken  string
	webhookURL   string
	orderService OrderService
}

func NewCheckoutService(orderService OrderService) (CheckoutService, error) {
	token := os.Getenv("MP_ACCESS_TOKEN")
	if token == "" {
		return nil, errors.New("MP_ACCESS_TOKEN não configurado")
	}
	return &checkoutService{
		accessToken:  token,
		webhookURL:   os.Getenv("MP_WEBHOOK_URL"),
		orderService: orderService,
	}, nil
}

type mpPixPayload struct {
	TransactionAmount float64 `json:"transaction_amount"`
	Description       string  `json:"description"`
	PaymentMethodID   string  `json:"payment_method_id"`
	NotificationURL   string  `json:"notification_url,omitempty"`
	DateOfExpiration  string  `json:"date_of_expiration,omitempty"`
	Payer             struct {
		Email     string `json:"email"`
		FirstName string `json:"first_name"`
	} `json:"payer"`
}

type mpPixPaymentResponse struct {
	ID                 int64 `json:"id"`
	PointOfInteraction struct {
		TransactionData struct {
			QRCode       string `json:"qr_code"`
			QRCodeBase64 string `json:"qr_code_base64"`
		} `json:"transaction_data"`
	} `json:"point_of_interaction"`
}

func (s *checkoutService) CreatePixPayment(req models.CheckoutPixRequest) (*models.CheckoutPixResponse, error) {
	var subtotal float64
	names := make([]string, 0, len(req.Items))
	for _, item := range req.Items {
		subtotal += item.PriceValue * float64(item.Quantity)
		names = append(names, item.Name)
	}
	total := subtotal
	if !req.PickupMode {
		total += req.FreightCost
	}

	description := strings.Join(names, ", ")
	if len(description) > 200 {
		description = description[:200]
	}
	if description == "" {
		description = "Pedido DonnaLupe"
	}

	var payload mpPixPayload
	payload.TransactionAmount = total
	payload.Description = description
	payload.PaymentMethodID = "pix"
	payload.NotificationURL = s.webhookURL
	payload.DateOfExpiration = time.Now().UTC().Add(6 * time.Minute).Format("2006-01-02T15:04:05.000-07:00")
	payload.Payer.Email = req.CustomerEmail
	payload.Payer.FirstName = req.CustomerName

	body, err := json.Marshal(payload)
	if err != nil {
		return nil, fmt.Errorf("erro ao serializar pagamento: %w", err)
	}

	httpReq, err := http.NewRequest(http.MethodPost, "https://api.mercadopago.com/v1/payments", bytes.NewReader(body))
	if err != nil {
		return nil, fmt.Errorf("erro ao criar requisição MP: %w", err)
	}
	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("Authorization", "Bearer "+s.accessToken)
	httpReq.Header.Set("X-Idempotency-Key", fmt.Sprintf("donna-pix-%s-%d", req.CustomerEmail, time.Now().UnixNano()))

	resp, err := mpClient.Do(httpReq)
	if err != nil {
		return nil, fmt.Errorf("erro ao chamar Mercado Pago: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusCreated {
		return nil, parseMPError(resp)
	}

	var mpResp mpPixPaymentResponse
	if err := json.NewDecoder(resp.Body).Decode(&mpResp); err != nil {
		return nil, errors.New("resposta inválida do Mercado Pago")
	}

	city, state, street := "", "", ""
	if !req.PickupMode && req.CEP != "" {
		if cepData, err := fetchCEPData(req.CEP); err == nil {
			city, state, street = cepData.City, cepData.State, cepData.Street
		}
	}

	paymentID := fmt.Sprintf("%d", mpResp.ID)
	if _, err := s.orderService.Create(req, paymentID, city, state, street); err != nil {
		return nil, fmt.Errorf("pagamento PIX criado (id=%s) mas falha ao registrar pedido: %w", paymentID, err)
	}

	return &models.CheckoutPixResponse{
		PaymentID:   mpResp.ID,
		PixQRCode:   mpResp.PointOfInteraction.TransactionData.QRCode,
		PixQRBase64: mpResp.PointOfInteraction.TransactionData.QRCodeBase64,
	}, nil
}

// parseMPError lê o corpo da resposta de erro do Mercado Pago e retorna um erro legível.
// Trim de "null" ao final que a API do MP inclui em alguns contextos.
func parseMPError(resp *http.Response) error {
	var errBody struct {
		Message string `json:"message"`
		Cause   []struct {
			Description string `json:"description"`
		} `json:"cause"`
	}
	json.NewDecoder(resp.Body).Decode(&errBody) //nolint:errcheck

	msg := strings.TrimSpace(strings.TrimSuffix(strings.TrimSpace(errBody.Message), "null"))
	if msg == "" && len(errBody.Cause) > 0 {
		msg = errBody.Cause[0].Description
	}
	if msg == "" {
		return fmt.Errorf("Mercado Pago retornou status %d", resp.StatusCode)
	}
	return fmt.Errorf("Mercado Pago: %s", msg)
}
