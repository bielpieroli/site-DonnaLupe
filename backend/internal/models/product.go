package models

type Product struct {
	Name            string  `gorm:"primaryKey;not null" json:"name"`
	Subtitle        string  `gorm:"type:text;not null;default:''" json:"subtitle"`
	Category        string  `gorm:"type:text;not null"  json:"category"`
	Description     string  `gorm:"type:text;not null"  json:"description"`
	Img             []byte  `gorm:"type:bytea;not null" json:"-"`
	ImageFile       string  `gorm:"type:text;default:''"          json:"imageFile"`
	Price           float64 `gorm:"not null"            json:"price"`
	Weight          string  `gorm:"type:text;not null;default:''" json:"weight"`
	IngredientsJSON string  `gorm:"type:text;not null;default:'[]'" json:"-"`
	Allergens       string  `gorm:"type:text;not null;default:''" json:"allergens"`
	Badge           string  `gorm:"type:text;not null;default:''" json:"badge"`
	Stock           int     `gorm:"not null"            json:"stock"`
	Status          string  `gorm:"type:text;not null"  json:"status"`
}

func (Product) TableName() string { return "products" }

type ProductResponse struct {
	Name        string   `json:"name"`
	Subtitle    string   `json:"subtitle"`
	Category    string   `json:"category"`
	Description string   `json:"description"`
	Img         string   `json:"img"`
	ImageFile   string   `json:"imageFile"`
	Price       float64  `json:"price"`
	Weight      string   `json:"weight"`
	Ingredients []string `json:"ingredients"`
	Allergens   string   `json:"allergens"`
	Badge       string   `json:"badge"`
	Stock       int      `json:"stock"`
	Status      string   `json:"status"`
}

type ProductInput struct {
	Name        string
	Subtitle    string
	Category    string
	Description string
	Img         []byte
	ImageFile   string
	Price       float64
	Weight      string
	Ingredients []string
	Allergens   string
	Badge       string
	Stock       int
	Status      string
}
