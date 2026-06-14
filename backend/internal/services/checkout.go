package services

import (
	"backend/internal/models"
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"os"
	"strconv"
	"time"
)

var mpClient = &http.Client{Timeout: 10 * time.Second}

type CheckoutService interface {
	CreatePreference(req models.CheckoutPreferenceRequest) (*models.CheckoutPreferenceResponse, error)
}

type checkoutService struct {
	accessToken  string
	frontURL     string
	orderService OrderService
}

func NewCheckoutService(orderService OrderService) (CheckoutService, error) {
	token := os.Getenv("MP_ACCESS_TOKEN")
	if token == "" {
		return nil, errors.New("MP_ACCESS_TOKEN não configurado")
	}
	frontURL := os.Getenv("FRONT_URL")
	if frontURL == "" {
		frontURL = "http://localhost:5173"
	}
	return &checkoutService{accessToken: token, frontURL: frontURL, orderService: orderService}, nil
}

type mpItem struct {
	ID         string  `json:"id"`
	Title      string  `json:"title"`
	Quantity   int     `json:"quantity"`
	UnitPrice  float64 `json:"unit_price"`
	CurrencyID string  `json:"currency_id"`
}

type mpBackURLs struct {
	Success string `json:"success"`
	Failure string `json:"failure"`
	Pending string `json:"pending"`
}

type mpPreferencePayload struct {
	Items    []mpItem   `json:"items"`
	BackURLs mpBackURLs `json:"back_urls"`
}

type mpPreferenceResponse struct {
	ID        string `json:"id"`
	InitPoint string `json:"init_point"`
}

func (s *checkoutService) CreatePreference(req models.CheckoutPreferenceRequest) (*models.CheckoutPreferenceResponse, error) {
	items := make([]mpItem, 0, len(req.Items)+1)
	for _, item := range req.Items {
		items = append(items, mpItem{
			ID:         strconv.Itoa(item.ID),
			Title:      item.Name,
			Quantity:   item.Quantity,
			UnitPrice:  item.PriceValue,
			CurrencyID: "BRL",
		})
	}

	if !req.PickupMode && req.FreightCost > 0 {
		items = append(items, mpItem{
			ID:         "freight",
			Title:      "Frete",
			Quantity:   1,
			UnitPrice:  req.FreightCost,
			CurrencyID: "BRL",
		})
	}

	payload := mpPreferencePayload{
		Items: items,
		BackURLs: mpBackURLs{
			Success: s.frontURL + "/cart?status=success",
			Failure: s.frontURL + "/cart?status=failure",
			Pending: s.frontURL + "/cart?status=pending",
		},
	}

	body, err := json.Marshal(payload)
	if err != nil {
		return nil, fmt.Errorf("erro ao serializar preferência: %w", err)
	}

	httpReq, err := http.NewRequest(http.MethodPost, "https://api.mercadopago.com/checkout/preferences", bytes.NewReader(body))
	if err != nil {
		return nil, fmt.Errorf("erro ao criar requisição MP: %w", err)
	}
	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("Authorization", "Bearer "+s.accessToken)

	resp, err := mpClient.Do(httpReq)
	if err != nil {
		return nil, fmt.Errorf("erro ao chamar Mercado Pago: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusCreated {
		var errBody struct {
			Message string `json:"message"`
		}
		json.NewDecoder(resp.Body).Decode(&errBody) //nolint:errcheck
		if errBody.Message != "" {
			return nil, fmt.Errorf("Mercado Pago: %s", errBody.Message)
		}
		return nil, fmt.Errorf("Mercado Pago retornou status %d", resp.StatusCode)
	}

	var mpResp mpPreferenceResponse
	if err := json.NewDecoder(resp.Body).Decode(&mpResp); err != nil {
		return nil, errors.New("resposta inválida do Mercado Pago")
	}

	// Registra o pedido. Busca endereço via BrasilAPI quando é entrega.
	city, state, street := "", "", ""
	if !req.PickupMode && req.CEP != "" {
		if cepData, err := fetchCEPData(req.CEP); err == nil {
			city, state, street = cepData.City, cepData.State, cepData.Street
		}
	}
	s.orderService.Create(req, mpResp.ID, city, state, street) //nolint:errcheck

	return &models.CheckoutPreferenceResponse{
		PreferenceID: mpResp.ID,
		InitPoint:    mpResp.InitPoint,
	}, nil
}
