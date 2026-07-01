package services

import (
	"backend/internal/models"
	"backend/internal/repository"
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
	"time"
)

var mpRefundClient = &http.Client{Timeout: 10 * time.Second}

type OrderService interface {
	Create(req models.CheckoutPixRequest, paymentID, city, state, street string) (*models.Order, error)
	GetAll(filters repository.OrderFilters) ([]models.OrderWithItems, error)
	GetByID(id uint) (*models.OrderWithItems, error)
	UpdateDeliveryStatus(id uint, deliveryStatus string) (*models.Order, error)
	UpdatePayment(paymentID, mpStatus string) error
	ConfirmPayment(id uint) (*models.Order, error)
	Refund(id uint) error
	GetOrderStatusByPaymentID(paymentID string) (string, error)
	SetCompleted(id uint, completed bool) (*models.Order, error)
	CancelStaleOrders(olderThan time.Duration) error
}

type orderService struct {
	repo    repository.OrderRepository
	email   EmailService
	mpToken string
}

func NewOrderService(repo repository.OrderRepository, email EmailService) OrderService {
	return &orderService{repo: repo, email: email, mpToken: os.Getenv("MP_ACCESS_TOKEN")}
}

var validDeliveryStatuses = map[string]bool{
	models.DeliveryPreparing:       true,
	models.DeliveryPendingDelivery: true,
	models.DeliveryInTransit:       true,
	models.DeliveryDelivered:       true,
}

func (s *orderService) Create(req models.CheckoutPixRequest, paymentID, city, state, street string) (*models.Order, error) {
	itemsJSON, err := json.Marshal(req.Items)
	if err != nil {
		return nil, err
	}

	mode := "delivery"
	if req.PickupMode {
		mode = "pickup"
	}

	var subtotal float64
	for _, item := range req.Items {
		subtotal += item.PriceValue * float64(item.Quantity)
	}

	freight := 0.0
	if !req.PickupMode {
		freight = req.FreightCost
	}

	order := &models.Order{
		PaymentID:      paymentID,
		Status:         models.OrderPending,
		DeliveryMode:   mode,
		DeliveryStatus: models.DeliveryPreparing,
		ItemsJSON:      string(itemsJSON),
		Subtotal:       subtotal,
		FreightCost:    freight,
		Total:          subtotal + freight,
		CustomerName:   req.CustomerName,
		CustomerEmail:  req.CustomerEmail,
		PickupTime:     req.PickupTime,
		CEP:            req.CEP,
		AddressNumber:  req.Number,
		Complement:     req.Complement,
		City:           city,
		State:          state,
		Street:         street,
	}

	if err := s.repo.Create(order); err != nil {
		return nil, err
	}
	return order, nil
}

func parseItems(o *models.Order) *models.OrderWithItems {
	var items []models.CheckoutItem
	json.Unmarshal([]byte(o.ItemsJSON), &items) //nolint:errcheck
	return &models.OrderWithItems{Order: *o, Items: items}
}

func buildConfirmEmailData(o *models.Order) ConfirmEmailData {
	var parsed []models.CheckoutItem
	json.Unmarshal([]byte(o.ItemsJSON), &parsed) //nolint:errcheck

	items := make([]ConfirmEmailItem, len(parsed))
	for i, p := range parsed {
		items[i] = ConfirmEmailItem{
			Name:      p.Name,
			Quantity:  p.Quantity,
			LineTotal: p.PriceValue * float64(p.Quantity),
		}
	}

	addr := ""
	if o.DeliveryMode == "delivery" {
		parts := []string{}
		street := o.Street
		if o.AddressNumber != "" {
			street += ", " + o.AddressNumber
		}
		if street != "" {
			parts = append(parts, street)
		}
		if o.Complement != "" {
			parts = append(parts, o.Complement)
		}
		if o.City != "" {
			cityState := o.City
			if o.State != "" {
				cityState += " - " + o.State
			}
			parts = append(parts, cityState)
		}
		addr = strings.Join(parts, " · ")
	}

	return ConfirmEmailData{
		OrderID:      o.ID,
		Items:        items,
		Subtotal:     o.Subtotal,
		FreightCost:  o.FreightCost,
		Total:        o.Total,
		DeliveryMode: o.DeliveryMode,
		PickupTime:   o.PickupTime,
		Address:      addr,
	}
}

func (s *orderService) GetAll(filters repository.OrderFilters) ([]models.OrderWithItems, error) {
	orders, err := s.repo.GetAll(filters)
	if err != nil {
		return nil, err
	}
	result := make([]models.OrderWithItems, len(orders))
	for i := range orders {
		result[i] = *parseItems(&orders[i])
	}
	return result, nil
}

func (s *orderService) GetByID(id uint) (*models.OrderWithItems, error) {
	o, err := s.repo.GetByID(id)
	if err != nil {
		return nil, err
	}
	return parseItems(o), nil
}

func (s *orderService) UpdateDeliveryStatus(id uint, deliveryStatus string) (*models.Order, error) {
	if !validDeliveryStatuses[deliveryStatus] {
		return nil, errors.New("status de entrega inválido")
	}
	o, err := s.repo.GetByID(id)
	if err != nil {
		return nil, err
	}
	o.DeliveryStatus = deliveryStatus
	return o, s.repo.Update(o)
}

func (s *orderService) UpdatePayment(paymentID, mpStatus string) error {
	o, err := s.repo.GetByPaymentID(paymentID)
	if err != nil {
		return err
	}
	switch mpStatus {
	case "approved":
		if o.Status == models.OrderPaid {
			return nil
		}
		o.Status = models.OrderPaid
		if o.DeliveryMode == "delivery" {
			o.DeliveryStatus = models.DeliveryPendingDelivery
		}
		if err := s.repo.Update(o); err != nil {
			return err
		}
		data := buildConfirmEmailData(o)
		go func() {
			if err := s.email.SendPaymentConfirmed(o.CustomerName, o.CustomerEmail, data); err != nil {
				log.Printf("[EMAIL] Confirmação (pedido %d): %v", o.ID, err)
			}
		}()
	case "rejected", "cancelled":
		if o.Status == models.OrderCancelled {
			return nil
		}
		o.Status = models.OrderCancelled
		if err := s.repo.Update(o); err != nil {
			return err
		}
		go func() {
			if err := s.email.SendPaymentCancelled(o.CustomerName, o.CustomerEmail, o.ID); err != nil {
				log.Printf("[EMAIL] Cancelamento (pedido %d): %v", o.ID, err)
			}
		}()
	}
	return nil
}

func (s *orderService) ConfirmPayment(id uint) (*models.Order, error) {
	o, err := s.repo.GetByID(id)
	if err != nil {
		return nil, err
	}
	if o.Status == models.OrderPaid {
		return o, nil
	}
	o.Status = models.OrderPaid
	if o.DeliveryMode == "delivery" {
		o.DeliveryStatus = models.DeliveryPendingDelivery
	}
	if err := s.repo.Update(o); err != nil {
		return nil, err
	}
	data := buildConfirmEmailData(o)
	go func() {
		if err := s.email.SendPaymentConfirmed(o.CustomerName, o.CustomerEmail, data); err != nil {
			log.Printf("[EMAIL] Confirmação manual (pedido %d): %v", o.ID, err)
		}
	}()
	return o, nil
}

func (s *orderService) Refund(id uint) error {
	o, err := s.repo.GetByID(id)
	if err != nil {
		return err
	}
	if o.Status != models.OrderPaid {
		return errors.New("só é possível reembolsar pedidos com status 'paid'")
	}
	if o.PaymentID == "" {
		return errors.New("pedido sem payment_id do Mercado Pago")
	}

	if s.mpToken != "" {
		if err := s.callMPRefund(o.PaymentID); err != nil {
			return fmt.Errorf("erro ao processar reembolso no Mercado Pago: %w", err)
		}
	}

	o.Status = models.OrderCancelled
	if err := s.repo.Update(o); err != nil {
		return err
	}
	go func() {
		if err := s.email.SendRefunded(o.CustomerName, o.CustomerEmail, o.ID, o.Total); err != nil {
			log.Printf("[EMAIL] Reembolso (pedido %d): %v", o.ID, err)
		}
	}()
	return nil
}

func (s *orderService) GetOrderStatusByPaymentID(paymentID string) (string, error) {
	o, err := s.repo.GetByPaymentID(paymentID)
	if err != nil {
		return "", err
	}
	return o.Status, nil
}

func (s *orderService) SetCompleted(id uint, completed bool) (*models.Order, error) {
	o, err := s.repo.GetByID(id)
	if err != nil {
		return nil, err
	}
	o.Completed = completed
	return o, s.repo.Update(o)
}

func (s *orderService) CancelStaleOrders(olderThan time.Duration) error {
	cutoff := time.Now().Add(-olderThan)
	n, err := s.repo.CancelPendingOlderThan(cutoff)
	if err != nil {
		log.Printf("[CLEANUP] Erro ao cancelar pedidos antigos: %v", err)
		return err
	}
	if n > 0 {
		log.Printf("[CLEANUP] %d pedido(s) pendente(s) cancelado(s) automaticamente (mais de %s sem pagamento)", n, olderThan)
	}
	return nil
}

func (s *orderService) callMPRefund(paymentID string) error {
	url := fmt.Sprintf("https://api.mercadopago.com/v1/payments/%s/refunds", paymentID)
	req, err := http.NewRequest(http.MethodPost, url, bytes.NewReader([]byte("{}")))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+s.mpToken)

	resp, err := mpRefundClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		var errBody struct {
			Message string `json:"message"`
		}
		json.NewDecoder(resp.Body).Decode(&errBody) //nolint:errcheck
		if errBody.Message != "" {
			return fmt.Errorf("Mercado Pago: %s", errBody.Message)
		}
		return fmt.Errorf("Mercado Pago retornou status %d", resp.StatusCode)
	}
	return nil
}

// Mantido por compatibilidade com dados antigos (preferenceID era o identificador original).
// Pode ser removido após migração completa para PIX.
func fetchPaymentStatusFromMP(mpToken, paymentID string) (string, error) {
	req, err := http.NewRequest(http.MethodGet,
		fmt.Sprintf("https://api.mercadopago.com/v1/payments/%s", paymentID), nil)
	if err != nil {
		return "", err
	}
	req.Header.Set("Authorization", "Bearer "+mpToken)

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	var payment struct {
		Status string `json:"status"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&payment); err != nil {
		return "", err
	}
	return payment.Status, nil
}
