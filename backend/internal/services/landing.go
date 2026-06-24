package services

import (
	"backend/internal/models"
	"backend/internal/repository"
)

type LandingService interface {
	GetAll() ([]models.LandingContent, error)
	GetActive() ([]models.LandingContent, error)
	Create(input models.LandingContentInput) (*models.LandingContent, error)
	Update(id uint, input models.LandingContentInput) (*models.LandingContent, error)
	Delete(id uint) error
	InitializeDefaults() error
}

type landingService struct{ repo repository.LandingRepository }

func NewLandingService(repo repository.LandingRepository) LandingService {
	return &landingService{repo: repo}
}

func (s *landingService) GetAll() ([]models.LandingContent, error) {
	return s.repo.GetAll()
}

func (s *landingService) GetActive() ([]models.LandingContent, error) {
	return s.repo.GetActive()
}

func (s *landingService) Create(input models.LandingContentInput) (*models.LandingContent, error) {
	content := landingFromInput(input)
	if err := s.repo.Create(content); err != nil {
		return nil, err
	}
	return content, nil
}

func (s *landingService) Update(id uint, input models.LandingContentInput) (*models.LandingContent, error) {
	content, err := s.repo.GetByID(id)
	if err != nil {
		return nil, err
	}
	content.Name = input.Name
	content.Secao = input.Secao
	content.Titulo = input.Titulo
	content.Subtitulo = input.Subtitulo
	content.Descricao = input.Descricao
	content.Imagem = input.Imagem
	content.BotaoTexto = input.BotaoTexto
	content.BotaoLink = input.BotaoLink
	content.Status = landingStatus(input.Status)
	if err := s.repo.Update(content); err != nil {
		return nil, err
	}
	return content, nil
}

func (s *landingService) Delete(id uint) error {
	return s.repo.Delete(id)
}

func (s *landingService) InitializeDefaults() error {
	total, err := s.repo.Count()
	if err != nil {
		return err
	}
	if total > 0 {
		return nil
	}
	for _, input := range defaultLandingContent {
		if _, err := s.Create(input); err != nil {
			return err
		}
	}
	return nil
}

func landingFromInput(input models.LandingContentInput) *models.LandingContent {
	return &models.LandingContent{
		Name:       input.Name,
		Secao:      input.Secao,
		Titulo:     input.Titulo,
		Subtitulo:  input.Subtitulo,
		Descricao:  input.Descricao,
		Imagem:     input.Imagem,
		BotaoTexto: input.BotaoTexto,
		BotaoLink:  input.BotaoLink,
		Status:     landingStatus(input.Status),
	}
}

func landingStatus(status string) string {
	if status == "Inativo" {
		return "Inativo"
	}
	return "Ativo"
}

var defaultLandingContent = []models.LandingContentInput{
	{
		Name:       "Hero - Cookies que fazem sorrir",
		Secao:      "Hero",
		Titulo:     "Cookies que fazem sorrir",
		Subtitulo:  "Cookies & Coffee Break",
		Descricao:  "Feitos à mão com ingredientes de verdade, muito amor e uma pitada de magia. Cada mordida é um abraço quentinho.",
		Imagem:     "cookie-home.png",
		BotaoTexto: "Ver cookies",
		BotaoLink:  "/shopping",
		Status:     "Ativo",
	},
	{
		Name:       "Favoritos - Cookie de morango",
		Secao:      "Favoritos",
		Titulo:     "Cookie de morango",
		Subtitulo:  "Os mais amados!",
		Descricao:  "Cookie artesanal com pedaços de morango e ganache de chocolate",
		Imagem:     "cookie-morango.jpg",
		BotaoTexto: "Quero Esse!",
		BotaoLink:  "/shopping",
		Status:     "Ativo",
	},
	{
		Name:       "Favoritos - Cookie de Matcha",
		Secao:      "Favoritos",
		Titulo:     "Cookie de Matcha",
		Subtitulo:  "Os mais amados!",
		Descricao:  "Cookie artesanal com pedaços de Matcha e ganache de chocolate",
		Imagem:     "cookie-matcha.jpg",
		BotaoTexto: "Quero Esse!",
		BotaoLink:  "/shopping",
		Status:     "Ativo",
	},
	{
		Name:       "Favoritos - Cookie de chocolate",
		Secao:      "Favoritos",
		Titulo:     "Cookie de chocolate",
		Subtitulo:  "Os mais amados!",
		Descricao:  "Cookie artesanal com pedaços de chocolate e ganache de chocolate",
		Imagem:     "cookie-choco-chunk.jpg",
		BotaoTexto: "Quero Esse!",
		BotaoLink:  "/shopping",
		Status:     "Ativo",
	},
	{
		Name:      "Depoimentos - Ana Clara",
		Secao:     "Depoimentos",
		Titulo:    "Ana Clara",
		Subtitulo: "Declarações de Amor",
		Descricao: "Gente, eu CHOREI comendo o de caramelo salgado. Não é exagero. É viciante demais!",
		Status:    "Ativo",
	},
	{
		Name:      "Depoimentos - Mariana",
		Secao:     "Depoimentos",
		Titulo:    "Mariana",
		Subtitulo: "Declarações de Amor",
		Descricao: "Comprei para dividir e me arrependi. Queria tudo pra mim. A massa é macia e o recheio é perfeito.",
		Status:    "Ativo",
	},
	{
		Name:      "Depoimentos - Carlos",
		Secao:     "Depoimentos",
		Titulo:    "Carlos",
		Subtitulo: "Declarações de Amor",
		Descricao: "Pedi no fim da tarde e chegou quentinho. Virou meu ritual de sexta com café.",
		Status:    "Ativo",
	},
	{
		Name:       "CTA Final - Fazer meu pedido",
		Secao:      "CTA Final",
		Titulo:     "Tá esperando o que pra experimentar?",
		Subtitulo:  "Peça online e receba seus cookies quentinhos em minutos.",
		Descricao:  "Delivery ou retirada — você escolhe!",
		BotaoTexto: "Fazer meu pedido",
		BotaoLink:  "/cart",
		Status:     "Ativo",
	},
	{
		Name:       "CTA Final - Ver cardápio",
		Secao:      "CTA Final",
		Titulo:     "Tá esperando o que pra experimentar?",
		Subtitulo:  "Peça online e receba seus cookies quentinhos em minutos.",
		Descricao:  "Delivery ou retirada — você escolhe!",
		BotaoTexto: "Ver cardápio",
		BotaoLink:  "/shopping",
		Status:     "Ativo",
	},
}
