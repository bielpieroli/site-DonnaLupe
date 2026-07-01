package models

type Product struct {
	ID              uint    `gorm:"primaryKey;autoIncrement" json:"id"`
	Name            string  `gorm:"not null"                 json:"name"`
	Subtitle        string  `                                json:"subtitle"`
	Kind            string  `gorm:"not null;default:'Shopping'" json:"kind"`
	Category        string  `                                json:"category"`
	Description     string  `gorm:"type:text"                json:"description"`
	PriceValue      float64 `                                json:"priceValue"`
	Weight          string  `                                json:"weight"`
	IngredientsText string  `gorm:"type:text"                json:"ingredientsText"`
	Allergens       string  `                                json:"allergens"`
	Badge           string  `                                json:"badge"`
	Image           string  `gorm:"type:text"                json:"image"`
	Stock           int     `                                json:"stock"`
	Flavor          string  `                                json:"flavor"`
	Unit            string  `                                json:"unit"`
	SizesText       string  `gorm:"type:text"                json:"sizesText"`
	SizeCountsText  string  `gorm:"type:text"                json:"sizeCountsText"`
	Status          string  `gorm:"not null;default:'Disponível'" json:"status"`
}

func (Product) TableName() string {
	return "products"
}

type ProductInput struct {
	Name            string  `json:"name" binding:"required"`
	Subtitle        string  `json:"subtitle"`
	Kind            string  `json:"kind"`
	Category        string  `json:"category"`
	Description     string  `json:"description"`
	PriceValue      float64 `json:"priceValue"`
	Weight          string  `json:"weight"`
	IngredientsText string  `json:"ingredientsText"`
	Allergens       string  `json:"allergens"`
	Badge           string  `json:"badge"`
	Image           string  `json:"image"`
	Stock           int     `json:"stock"`
	Flavor          string  `json:"flavor"`
	Unit            string  `json:"unit"`
	SizesText       string  `json:"sizesText"`
	SizeCountsText  string  `json:"sizeCountsText"`
	Status          string  `json:"status"`
}

type ProductResponse struct {
	ID              uint           `json:"id"`
	Name            string         `json:"name"`
	Subtitle        string         `json:"subtitle"`
	Kind            string         `json:"kind"`
	Category        string         `json:"category"`
	Description     string         `json:"description"`
	PriceValue      float64        `json:"priceValue"`
	Price           string         `json:"price"`
	Weight          string         `json:"weight"`
	Ingredients     []string       `json:"ingredients"`
	IngredientsText string         `json:"ingredientsText"`
	Allergens       string         `json:"allergens"`
	Badge           string         `json:"badge"`
	Image           string         `json:"image"`
	Img             string         `json:"img"`
	Stock           int            `json:"stock"`
	Flavor          string         `json:"flavor"`
	Unit            string         `json:"unit"`
	Sizes           []string       `json:"sizes"`
	SizesText       string         `json:"sizesText"`
	SizeCounts      map[string]int `json:"sizeCounts"`
	SizeCountsText  string         `json:"sizeCountsText"`
	Status          string         `json:"status"`
}
