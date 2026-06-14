package models

import "time"

const (
	OrderPending   = "pending"
	OrderPaid      = "paid"
	OrderCancelled = "cancelled"

	DeliveryPreparing       = "preparing"
	DeliveryPendingDelivery = "pending_delivery"
	DeliveryInTransit       = "in_transit"
	DeliveryDelivered       = "delivered"
)

type Order struct {
	ID             uint      `gorm:"primaryKey;autoIncrement"    json:"id"`
	PreferenceID   string    `gorm:"uniqueIndex;not null"        json:"preference_id"`
	PaymentID      string    `                                   json:"payment_id"`
	Status         string    `gorm:"not null;default:'pending'"  json:"status"`
	DeliveryMode   string    `gorm:"not null"                    json:"delivery_mode"`
	DeliveryStatus string    `gorm:"not null;default:'preparing'" json:"delivery_status"`
	ItemsJSON      string    `gorm:"type:text;not null"          json:"-"`
	Subtotal       float64   `gorm:"not null"                    json:"subtotal"`
	FreightCost    float64   `                                   json:"freight_cost"`
	Total          float64   `gorm:"not null"                    json:"total"`
	CEP            string    `                                   json:"cep"`
	AddressNumber  string    `                                   json:"address_number"`
	Complement     string    `                                   json:"complement"`
	City           string    `                                   json:"city"`
	State          string    `                                   json:"state"`
	Street         string    `                                   json:"street"`
	CreatedAt      time.Time `                                   json:"created_at"`
	UpdatedAt      time.Time `                                   json:"updated_at"`
}

func (Order) TableName() string { return "orders" }

type OrderWithItems struct {
	Order
	Items []CheckoutItem `json:"items"`
}
