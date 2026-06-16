package models

type CheckoutItem struct {
	ID         string  `json:"id"`
	Name       string  `json:"name"`
	Quantity   int     `json:"quantity"`
	PriceValue float64 `json:"price_value"`
}

type CheckoutPreferenceRequest struct {
	Items       []CheckoutItem `json:"items"        binding:"required,min=1"`
	FreightCost float64        `json:"freight_cost"`
	PickupMode  bool           `json:"pickup_mode"`
	CEP         string         `json:"cep"`
	Number      string         `json:"number"`
	Complement  string         `json:"complement"`
}

type CheckoutPreferenceResponse struct {
	PreferenceID string `json:"preferenceId"`
	InitPoint    string `json:"initPoint"`
}
