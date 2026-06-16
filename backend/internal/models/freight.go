package models

type FreightRule struct {
	ID            uint    `gorm:"primaryKey;autoIncrement"          json:"id"`
	MaxDistanceKm float64 `gorm:"not null;uniqueIndex;check:max_distance_km > 0" json:"max_distance_km"`
	PriceReais    float64 `gorm:"not null;check:price_reais >= 0"   json:"price_reais"`
}

func (FreightRule) TableName() string { return "freight_rules" }

type FreightQuoteRequest struct {
	CEP        string `json:"cep"        binding:"required"`
	Number     string `json:"number"     binding:"required"`
	Complement string `json:"complement"`
}

type FreightQuoteResponse struct {
	DistanceKm    float64 `json:"distance_km"`
	PriceReais    float64 `json:"price_reais"`
	MaxDistanceKm float64 `json:"max_distance_km"`
}

type FreightRuleInput struct {
	MaxDistanceKm float64 `json:"max_distance_km" binding:"required,gt=0"`
	PriceReais    float64 `json:"price_reais"     binding:"gte=0"`
}
