package services

import (
	"backend/internal/models"
	"backend/internal/repository"
	"encoding/json"
	"errors"
)

type OrderService interface {
	Create(req models.CheckoutPreferenceRequest, preferenceID, city, state, street string) (*models.Order, error)
	GetAll(filters repository.OrderFilters) ([]models.OrderWithItems, error)
	GetByID(id uint) (*models.OrderWithItems, error)
	UpdateDeliveryStatus(id uint, deliveryStatus string) (*models.Order, error)
	UpdatePayment(preferenceID, paymentID, status string) error
}

type orderService struct{ repo repository.OrderRepository }

func NewOrderService(repo repository.OrderRepository) OrderService {
	return &orderService{repo: repo}
}

var validDeliveryStatuses = map[string]bool{
	models.DeliveryPreparing:       true,
	models.DeliveryPendingDelivery: true,
	models.DeliveryInTransit:       true,
	models.DeliveryDelivered:       true,
}

func (s *orderService) Create(req models.CheckoutPreferenceRequest, preferenceID, city, state, street string) (*models.Order, error) {
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

	order := &models.Order{
		PreferenceID:   preferenceID,
		Status:         models.OrderPending,
		DeliveryMode:   mode,
		DeliveryStatus: models.DeliveryPreparing,
		ItemsJSON:      string(itemsJSON),
		Subtotal:       subtotal,
		FreightCost:    req.FreightCost,
		Total:          subtotal + req.FreightCost,
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

func (s *orderService) UpdatePayment(preferenceID, paymentID, mpStatus string) error {
	o, err := s.repo.GetByPreferenceID(preferenceID)
	if err != nil {
		return err
	}
	if paymentID != "" {
		o.PaymentID = paymentID
	}
	switch mpStatus {
	case "approved":
		o.Status = models.OrderPaid
		if o.DeliveryMode == "delivery" {
			o.DeliveryStatus = models.DeliveryPendingDelivery
		}
	case "rejected", "cancelled":
		o.Status = models.OrderCancelled
	}
	return s.repo.Update(o)
}
