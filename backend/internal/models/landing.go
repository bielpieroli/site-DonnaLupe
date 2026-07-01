package models

type LandingContent struct {
	ID         uint   `gorm:"primaryKey;autoIncrement" json:"id"`
	Name       string `gorm:"not null"                 json:"name"`
	Secao      string `gorm:"not null"                 json:"secao"`
	Titulo     string `gorm:"not null"                 json:"titulo"`
	Subtitulo  string `                                 json:"subtitulo"`
	Descricao  string `gorm:"type:text"                json:"descricao"`
	Imagem     string `gorm:"type:text"                json:"imagem"`
	BotaoTexto string `                                json:"botaoTexto"`
	BotaoLink  string `                                json:"botaoLink"`
	Status     string `gorm:"not null;default:'Ativo'" json:"status"`
}

func (LandingContent) TableName() string { return "landing_contents" }

type LandingContentInput struct {
	Name       string `json:"name"       binding:"required"`
	Secao      string `json:"secao"      binding:"required"`
	Titulo     string `json:"titulo"     binding:"required"`
	Subtitulo  string `json:"subtitulo"`
	Descricao  string `json:"descricao"`
	Imagem     string `json:"imagem"`
	BotaoTexto string `json:"botaoTexto"`
	BotaoLink  string `json:"botaoLink"`
	Status     string `json:"status"`
}
