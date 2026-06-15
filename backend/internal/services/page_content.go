package services

import (
	"backend/internal/models"
	"backend/internal/repository"
	"strings"
)

type PageContentService interface {
	GetAll() ([]models.PageContent, error)
	GetActive(page string) ([]models.PageContent, error)
	Create(input models.PageContentInput) (*models.PageContent, error)
	Update(id uint, input models.PageContentInput) (*models.PageContent, error)
	Delete(id uint) error
	InitializeDefaults() error
}

type pageContentService struct {
	repo repository.PageContentRepository
}

func NewPageContentService(repo repository.PageContentRepository) PageContentService {
	return &pageContentService{repo: repo}
}

func (s *pageContentService) GetAll() ([]models.PageContent, error) {
	return s.repo.GetAll()
}

func (s *pageContentService) GetActive(page string) ([]models.PageContent, error) {
	return s.repo.GetActive(strings.TrimSpace(page))
}

func (s *pageContentService) Create(input models.PageContentInput) (*models.PageContent, error) {
	content := pageContentFromInput(input)
	if err := s.repo.Create(content); err != nil {
		return nil, err
	}
	return content, nil
}

func (s *pageContentService) Update(id uint, input models.PageContentInput) (*models.PageContent, error) {
	content, err := s.repo.GetByID(id)
	if err != nil {
		return nil, err
	}

	content.Page = strings.TrimSpace(input.Page)
	content.Name = strings.TrimSpace(input.Name)
	content.Section = strings.TrimSpace(input.Section)
	content.Title = strings.TrimSpace(input.Title)
	content.Subtitle = strings.TrimSpace(input.Subtitle)
	content.Description = strings.TrimSpace(input.Description)
	content.Image = strings.TrimSpace(input.Image)
	content.ButtonText = strings.TrimSpace(input.ButtonText)
	content.ButtonLink = strings.TrimSpace(input.ButtonLink)
	content.Status = pageContentStatus(input.Status)

	if err := s.repo.Update(content); err != nil {
		return nil, err
	}
	return content, nil
}

func (s *pageContentService) Delete(id uint) error {
	return s.repo.Delete(id)
}

func (s *pageContentService) InitializeDefaults() error {
	existing, err := s.repo.GetAll()
	if err != nil {
		return err
	}

	byKey := make(map[string]struct{}, len(existing))
	for _, content := range existing {
		byKey[pageContentKey(content)] = struct{}{}
	}

	for _, content := range defaultPageContents() {
		if _, ok := byKey[pageContentKey(content)]; ok {
			continue
		}
		item := content
		if err := s.repo.Create(&item); err != nil {
			return err
		}
	}
	return nil
}

func pageContentKey(content models.PageContent) string {
	return strings.ToLower(strings.TrimSpace(content.Page + "|" + content.Section + "|" + content.Name))
}

func pageContentFromInput(input models.PageContentInput) *models.PageContent {
	return &models.PageContent{
		Page:        strings.TrimSpace(input.Page),
		Name:        strings.TrimSpace(input.Name),
		Section:     strings.TrimSpace(input.Section),
		Title:       strings.TrimSpace(input.Title),
		Subtitle:    strings.TrimSpace(input.Subtitle),
		Description: strings.TrimSpace(input.Description),
		Image:       strings.TrimSpace(input.Image),
		ButtonText:  strings.TrimSpace(input.ButtonText),
		ButtonLink:  strings.TrimSpace(input.ButtonLink),
		Status:      pageContentStatus(input.Status),
	}
}

func pageContentStatus(status string) string {
	status = strings.TrimSpace(status)
	if status == "" {
		return "Ativo"
	}
	return status
}

func defaultPageContents() []models.PageContent {
	return []models.PageContent{
		{
			Page:        "about",
			Name:        "Hero Sobre",
			Section:     "Hero",
			Title:       "Feitos com amor desde a primeira fornada",
			Subtitle:    "Cookies & Coffee Break",
			Description: "Mais do que cookies, criamos momentos especiais. Cada receita é feita com ingredientes selecionados, carinho e aquele gostinho de casa que transforma qualquer dia.",
			Image:       "cookie-choco-chunk.jpg",
			ButtonText:  "Conhecer cardápio",
			ButtonLink:  "/shopping",
			Status:      "Ativo",
		},
		{
			Page:        "about",
			Name:        "Nossa essência",
			Section:     "Essência",
			Title:       "Uma marca feita para adoçar momentos",
			Subtitle:    "Nossa essência",
			Description: "Somos uma empresa dedicada a oferecer os melhores produtos e serviços para nossos clientes. Com anos de experiência no mercado, buscamos garantir qualidade, sabor e uma experiência memorável em cada pedido.\nNossa equipe é formada por pessoas apaixonadas pelo que fazem, comprometidas em criar receitas artesanais, inovadoras e feitas com ingredientes de verdade.",
			Status:      "Ativo",
		},
		{
			Page:        "about",
			Name:        "+10 anos",
			Section:     "EssenceCard",
			Title:       "+10 anos",
			Description: "Levando sabor, carinho e qualidade para nossos clientes.",
			Status:      "Ativo",
		},
		{
			Page:        "about",
			Name:        "Ingredientes reais",
			Section:     "EssenceCard",
			Title:       "Ingredientes reais",
			Description: "Trabalhamos com produtos selecionados e receitas artesanais.",
			Status:      "Ativo",
		},
		{
			Page:        "about",
			Name:        "Atendimento especial",
			Section:     "EssenceCard",
			Title:       "Atendimento especial",
			Description: "Queremos que cada cliente tenha uma experiência incrível.",
			Status:      "Ativo",
		},
		{
			Page:        "about",
			Name:        "Receitas exclusivas",
			Section:     "EssenceCard",
			Title:       "Receitas exclusivas",
			Description: "Sabores únicos para agradar todos os gostos.",
			Status:      "Ativo",
		},
		{
			Page:     "about",
			Name:     "Cabeçalho Valores",
			Section:  "ValuesHeader",
			Title:    "O que faz a Donna Lupe especial",
			Subtitle: "nossos valores",
			Status:   "Ativo",
		},
		{
			Page:        "about",
			Name:        "Feito com amor",
			Section:     "ValueCard",
			Title:       "Feito com amor",
			Subtitle:    "💛",
			Description: "Cada cookie é preparado com cuidado, atenção e muito carinho.",
			Status:      "Ativo",
		},
		{
			Page:        "about",
			Name:        "Qualidade em cada detalhe",
			Section:     "ValueCard",
			Title:       "Qualidade em cada detalhe",
			Subtitle:    "🍪",
			Description: "Utilizamos ingredientes selecionados para garantir sabor e frescor.",
			Status:      "Ativo",
		},
		{
			Page:        "about",
			Name:        "Experiência inesquecível",
			Section:     "ValueCard",
			Title:       "Experiência inesquecível",
			Subtitle:    "✨",
			Description: "Queremos transformar cada compra em um momento especial.",
			Status:      "Ativo",
		},
		{
			Page:        "about",
			Name:        "CTA Sobre",
			Section:     "CTA",
			Title:       "Pronto para conhecer nossos sabores?",
			Description: "Explore nosso cardápio e descubra os cookies que conquistaram nossos clientes.",
			ButtonText:  "Ver cardápio",
			ButtonLink:  "/shopping",
			Status:      "Ativo",
		},
		{
			Page:        "shopping",
			Name:        "Cabeçalho Shopping",
			Section:     "Header",
			Title:       "Nosso Catálogo",
			Subtitle:    "Monte seu pedido!",
			Description: "Explore nossa seleção de produtos exclusivos.",
			Status:      "Ativo",
		},
		{
			Page:        "coffee",
			Name:        "Hero Coffee",
			Section:     "Hero",
			Title:       "Monte o seu Coffee Break",
			Subtitle:    "Cookies & Coffee Break",
			Description: "Escolha os produtos no catálogo do coffee e envie seu pedido para a gente pelo WhatsApp para um orçamento especial. Simples, prático e delicioso!",
			Image:       "coffee-break.jpg",
			ButtonText:  "Conhecer os produtos",
			ButtonLink:  "/shopping",
			Status:      "Ativo",
		},
		{
			Page:     "coffee",
			Name:     "Cabeçalho Catálogo Coffee",
			Section:  "CatalogHeader",
			Title:    "Catálogo do Coffee",
			Subtitle: "escolha os itens",
			Status:   "Ativo",
		},
		{
			Page:        "footer",
			Name:        "Rodapé principal",
			Section:     "Main",
			Title:       "Donna Lupe",
			Subtitle:    "Cookies & Coffee Break",
			Description: "Cookies artesanais, coffee breaks e momentos doces preparados com carinho.",
			Status:      "Ativo",
		},
		{
			Page:        "footer",
			Name:        "Onde nos encontrar",
			Section:     "Location",
			Title:       "Onde nos encontrar",
			Description: "Rua dos Cookies, 123\nDocelandia, SP\nSeg-Sáb: 9h - 20h\nDom: 10h - 18h",
			Status:      "Ativo",
		},
		{
			Page:        "footer",
			Name:        "Vem com a gente",
			Section:     "Social",
			Title:       "Vem com a gente!",
			Description: "Instagram\nTikTok\nWhatsApp",
			Status:      "Ativo",
		},
		{
			Page:        "footer",
			Name:        "Copyright",
			Section:     "Copyright",
			Title:       "Feito com amor © 2025 Donna Lupe",
			Description: "",
			Status:      "Ativo",
		},
	}
}
