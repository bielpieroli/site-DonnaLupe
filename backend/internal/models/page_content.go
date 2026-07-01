package models

type PageContent struct {
	ID          uint   `gorm:"primaryKey;autoIncrement" json:"id"`
	Page        string `gorm:"not null;index"           json:"page"`
	Name        string `gorm:"not null"                 json:"name"`
	Section     string `gorm:"not null"                 json:"section"`
	Title       string `gorm:"not null"                 json:"title"`
	Subtitle    string `                                json:"subtitle"`
	Description string `gorm:"type:text"                json:"description"`
	Image       string `gorm:"type:text"                json:"image"`
	ButtonText  string `                                json:"buttonText"`
	ButtonLink  string `                                json:"buttonLink"`
	Status      string `gorm:"not null;default:'Ativo'" json:"status"`
}

func (PageContent) TableName() string {
	return "page_contents"
}

type PageContentInput struct {
	Page        string `json:"page" binding:"required"`
	Name        string `json:"name" binding:"required"`
	Section     string `json:"section" binding:"required"`
	Title       string `json:"title"`
	Subtitle    string `json:"subtitle"`
	Description string `json:"description"`
	Image       string `json:"image"`
	ButtonText  string `json:"buttonText"`
	ButtonLink  string `json:"buttonLink"`
	Status      string `json:"status"`
}
