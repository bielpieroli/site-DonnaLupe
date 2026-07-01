package models

type CheckoutItem struct {
	ID         string  `json:"id"`
	Name       string  `json:"name"`
	Quantity   int     `json:"quantity"`
	PriceValue float64 `json:"price_value"`
}

type CheckoutPixRequest struct {
	Items         []CheckoutItem `json:"items"          binding:"required,min=1"`
	FreightCost   float64        `json:"freight_cost"`
	PickupMode    bool           `json:"pickup_mode"`
	CEP           string         `json:"cep"`
	Number        string         `json:"number"`
	Complement    string         `json:"complement"`
	CustomerName  string         `json:"customer_name"  binding:"required"`
	CustomerEmail string         `json:"customer_email" binding:"required,email"`
	PickupTime    string         `json:"pickup_time"`
}

type CheckoutPixResponse struct {
	PaymentID   int64  `json:"payment_id"`
	PixQRCode   string `json:"pix_qr_code"`
	PixQRBase64 string `json:"pix_qr_base64"`
}
