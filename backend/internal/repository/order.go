package repository

import (
	"backend/internal/models"
	"errors"
	"time"

	"gorm.io/gorm"
)

var ErrOrderNotFound = errors.New("pedido não encontrado")

type OrderFilters struct {
	Status         string
	DeliveryStatus string
	DeliveryMode   string
}

type OrderRepository interface {
	Create(order *models.Order) error
	GetByID(id uint) (*models.Order, error)
	GetByPaymentID(paymentID string) (*models.Order, error)
	GetAll(filters OrderFilters) ([]models.Order, error)
	Update(order *models.Order) error
	CancelPendingOlderThan(cutoff time.Time) (int64, error)
}

type orderRepository struct{ db *gorm.DB }

func NewOrderRepository(db *gorm.DB) OrderRepository {
	return &orderRepository{db: db}
}

func (r *orderRepository) Create(order *models.Order) error {
	return r.db.Create(order).Error
}

func (r *orderRepository) GetByID(id uint) (*models.Order, error) {
	var o models.Order
	if err := r.db.First(&o, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrOrderNotFound
		}
		return nil, err
	}
	return &o, nil
}

func (r *orderRepository) GetByPaymentID(paymentID string) (*models.Order, error) {
	var o models.Order
	if err := r.db.Where("payment_id = ?", paymentID).First(&o).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrOrderNotFound
		}
		return nil, err
	}
	return &o, nil
}

func (r *orderRepository) GetAll(filters OrderFilters) ([]models.Order, error) {
	var orders []models.Order
	q := r.db.Order("created_at DESC")
	if filters.Status != "" {
		q = q.Where("status = ?", filters.Status)
	}
	if filters.DeliveryStatus != "" {
		q = q.Where("delivery_status = ?", filters.DeliveryStatus)
	}
	if filters.DeliveryMode != "" {
		q = q.Where("delivery_mode = ?", filters.DeliveryMode)
	}
	return orders, q.Find(&orders).Error
}

func (r *orderRepository) Update(order *models.Order) error {
	return r.db.Save(order).Error
}

func (r *orderRepository) CancelPendingOlderThan(cutoff time.Time) (int64, error) {
	result := r.db.Model(&models.Order{}).
		Where("status = ? AND created_at < ?", models.OrderPending, cutoff).
		Update("status", models.OrderCancelled)
	return result.RowsAffected, result.Error
}
