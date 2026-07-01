package models

type Ingredient struct {
	Name       string  `gorm:"primaryKey;size:120"                         json:"name"`
	Stock      float64 `gorm:"not null;default:0;check:stock >= 0"          json:"stock"`
	Unit       string  `gorm:"not null;default:'un';size:32"               json:"unit"`
	ValueReais float64 `gorm:"not null;default:0;check:value_reais >= 0"    json:"value_reais"`
}

func (Ingredient) TableName() string { return "ingredients" }

type ProductIngredient struct {
	ProductID      uint    `gorm:"primaryKey;column:product_id"                     json:"product_id"`
	IngredientName string  `gorm:"primaryKey;size:120;column:ingredient_name;index" json:"ingredient_name"`
	Quantity       float64 `gorm:"not null;default:0;check:quantity >= 0"           json:"quantity"`
	Unit           string  `gorm:"not null;default:'un';size:32"                   json:"unit"`
}

func (ProductIngredient) TableName() string { return "product_ingredients" }

type CreateIngredientRequest struct {
	Name       string  `json:"name"        binding:"required"`
	Stock      float64 `json:"stock"       binding:"gte=0"`
	Unit       string  `json:"unit"`
	ValueReais float64 `json:"value_reais" binding:"gte=0"`
}

type UpdateIngredientRequest struct {
	Stock      *float64 `json:"stock"       binding:"omitempty,gte=0"`
	Unit       *string  `json:"unit"`
	ValueReais *float64 `json:"value_reais" binding:"omitempty,gte=0"`
}
