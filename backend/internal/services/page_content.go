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
			Page:        "landing",
			Name:        "Hero principal",
			Section:     "Hero",
			Title:       "Sabor que faz você se sentir especial",
			Subtitle:    "Donna Lupe • Cookies",
			Description: "Produtos de qualidade, atendimento com alegria e aquele cuidado que transforma cada visita em um momento mais gostoso.",
			Image:       "cookie-home.png",
			ButtonText:  "Ver cardápio",
			ButtonLink:  "/shopping",
			Status:      "Ativo",
		},
		{
			Page:        "landing",
			Name:        "Cabeçalho Favoritos",
			Section:     "Favoritos Header",
			Title:       "Nossos favoritos",
			Subtitle:    "Os mais amados!",
			Description: "Cookies preparados com cuidado, sabor e qualidade para adoçar seu dia.",
			Status:      "Ativo",
		},
		{
			Page:        "landing",
			Name:        "Favorito Morango",
			Section:     "Favoritos",
			Title:       "Cookie de morango",
			Description: "Cookie artesanal com pedaços de morango e ganache de chocolate.",
			Image:       "cookie-morango.jpg",
			ButtonText:  "Quero esse!",
			ButtonLink:  "/shopping",
			Status:      "Ativo",
		},
		{
			Page:        "landing",
			Name:        "Favorito Matcha",
			Section:     "Favoritos",
			Title:       "Cookie de Matcha",
			Description: "Cookie artesanal com matcha e ganache de chocolate.",
			Image:       "cookie-matcha.jpg",
			ButtonText:  "Quero esse!",
			ButtonLink:  "/shopping",
			Status:      "Ativo",
		},
		{
			Page:        "landing",
			Name:        "Favorito Chocolate",
			Section:     "Favoritos",
			Title:       "Cookie de chocolate",
			Description: "Cookie artesanal com pedaços de chocolate e ganache de chocolate.",
			Image:       "cookie-choco-chunk.jpg",
			ButtonText:  "Quero esse!",
			ButtonLink:  "/shopping",
			Status:      "Ativo",
		},
		{
			Page:        "landing",
			Name:        "Cabeçalho Cardápio",
			Section:     "CatalogHeader",
			Title:       "Nosso cardápio",
			Description: "Escolha seus sabores favoritos e aproveite produtos feitos para entregar qualidade, carinho e uma experiência especial.",
			Status:      "Ativo",
		},
		{
			Page:       "landing",
			Name:       "Frase Cardápio",
			Section:    "CatalogFooter",
			Title:      "Monte sua caixinha com os sabores que quiser!",
			ButtonLink: "/shopping",
			Status:     "Ativo",
		},
		{
			Page:        "landing",
			Name:        "Cabeçalho Essência",
			Section:     "EssenceHeader",
			Title:       "O que torna a Donna Lupe especial",
			Subtitle:    "Nossa essência",
			Description: "Nossa marca é guiada pelo compromisso de servir bem, oferecer produtos de qualidade e fazer com que cada pessoa se sinta bem recebida.",
			Status:      "Ativo",
		},
		{
			Page:        "landing",
			Name:        "Produtos de qualidade",
			Section:     "EssenceCard",
			Title:       "Produtos de qualidade",
			Description: "Cookies e alimentos preparados com cuidado para entregar sabor e uma boa experiência.",
			Status:      "Ativo",
		},
		{
			Page:        "landing",
			Name:        "Atendimento com alegria",
			Section:     "EssenceCard",
			Title:       "Atendimento com alegria",
			Description: "Servir bem faz parte da nossa essência. Queremos que cada cliente se sinta especial.",
			Status:      "Ativo",
		},
		{
			Page:        "landing",
			Name:        "Ambiente acolhedor",
			Section:     "EssenceCard",
			Title:       "Ambiente acolhedor",
			Description: "Um espaço agradável, limpo e organizado para tornar cada momento mais leve e gostoso.",
			Status:      "Ativo",
		},
		{
			Page:        "landing",
			Name:        "CTA principal",
			Section:     "CTA Final",
			Title:       "Pronto para escolher seu sabor favorito?",
			Description: "Confira o cardápio e monte seu pedido com os produtos que combinam com o seu momento.",
			ButtonText:  "Fazer meu pedido",
			ButtonLink:  "/cart",
			Status:      "Ativo",
		},
		{
			Page:       "landing",
			Name:       "CTA secundário",
			Section:    "CTA Final",
			ButtonText: "Ver cardápio",
			ButtonLink: "/shopping",
			Title:      "Cardápio",
			Status:     "Ativo",
		},
		{
			Page:        "about",
			Name:        "Hero Sobre",
			Section:     "Hero",
			Title:       "Sabor, cuidado e atendimento para tornar seu dia especial",
			Subtitle:    "Donna Lupe • Cookies",
			Description: "A Donna Lupe nasceu com o propósito de servir pessoas com produtos de qualidade, ambiente acolhedor e um atendimento que faz cada cliente se sentir único.",
			Image:       "cookie-choco-chunk.jpg",
			ButtonText:  "Conhecer cardápio",
			ButtonLink:  "/shopping",
			Status:      "Ativo",
		},
		{
			Page:        "about",
			Name:        "Nossa essência",
			Section:     "Essência",
			Title:       "Uma empresa familiar feita para servir bem",
			Subtitle:    "Nossa essência",
			Description: "Somos uma marca familiar que acredita no cuidado com as pessoas, na qualidade dos produtos e na força de um atendimento feito com alegria. Para nós, cada pedido é uma oportunidade de entregar sabor, acolhimento e uma experiência memorável.\nNossa missão é alimentar as pessoas com produtos de qualidade, em um ambiente agradável, limpo e organizado, fazendo com que cada cliente se sinta especial por meio do atendimento e do sabor dos alimentos.",
			Status:      "Ativo",
		},
		{
			Page:        "about",
			Name:        "Empresa familiar",
			Section:     "EssenceCard",
			Title:       "Empresa familiar",
			Description: "Uma marca construída sobre honra, cuidado e compromisso com as pessoas.",
			Status:      "Ativo",
		},
		{
			Page:        "about",
			Name:        "Ingredientes reais",
			Section:     "EssenceCard",
			Title:       "Produtos de qualidade",
			Description: "Cookies e alimentos preparados com atenção ao sabor e à experiência.",
			Status:      "Ativo",
		},
		{
			Page:        "about",
			Name:        "Atendimento especial",
			Section:     "EssenceCard",
			Title:       "Atendimento especial",
			Description: "Servir com alegria para que cada cliente se sinta único e bem recebido.",
			Status:      "Ativo",
		},
		{
			Page:        "about",
			Name:        "Ambiente acolhedor",
			Section:     "EssenceCard",
			Title:       "Ambiente acolhedor",
			Description: "Um espaço agradável, limpo e organizado para tornar cada visita melhor.",
			Status:      "Ativo",
		},
		{
			Page:        "about",
			Name:        "Cabeçalho Valores",
			Section:     "ValuesHeader",
			Title:       "O que guia a Donna Lupe",
			Subtitle:    "Nossos valores",
			Description: "Somos guiados por valores que orientam nossas decisões, nosso jeito de atender e a forma como queremos crescer.",
			Status:      "Ativo",
		},
		{
			Page:        "about",
			Name:        "Confiança",
			Section:     "ValueCard",
			Title:       "Confiança",
			Subtitle:    "✓",
			Description: "Trabalhamos com transparência, responsabilidade e respeito em cada atendimento.",
			Status:      "Ativo",
		},
		{
			Page:        "about",
			Name:        "Atendimento próximo",
			Section:     "ValueCard",
			Title:       "Atendimento próximo",
			Subtitle:    "♡",
			Description: "Ouvimos cada cliente com atenção para oferecer uma experiência acolhedora e personalizada.",
			Status:      "Ativo",
		},
		{
			Page:        "about",
			Name:        "Qualidade",
			Section:     "ValueCard",
			Title:       "Qualidade",
			Subtitle:    "✦",
			Description: "Buscamos excelência em cada detalhe para entregar sempre o melhor resultado.",
			Status:      "Ativo",
		},
		{
			Page:        "about",
			Name:        "Propósito",
			Section:     "Purpose",
			Title:       "Entregar o melhor produto com a melhor qualidade",
			Subtitle:    "Nosso propósito",
			Description: "Nosso propósito é colocar cuidado, fé e excelência em tudo o que fazemos, oferecendo ao cliente produtos saborosos, bem preparados e coerentes com a qualidade que ele procura.",
			Status:      "Ativo",
		},
		{
			Page:        "about",
			Name:        "Visão",
			Section:     "Vision",
			Title:       "Crescer como referência em cookies",
			Subtitle:    "Nossa visão",
			Description: "Queremos ser reconhecidos como uma das melhores redes de cookies em São Carlos e região, crescendo com qualidade, pertencimento e compromisso com cada pessoa atendida.",
			Status:      "Ativo",
		},
		{
			Page:        "about",
			Name:        "Propósito",
			Section:     "Purpose",
			Title:       "Entregar o melhor produto com a melhor qualidade",
			Subtitle:    "Nosso propósito",
			Description: "Nosso propósito é colocar cuidado, fé e excelência em tudo o que fazemos, oferecendo ao cliente produtos saborosos, bem preparados e coerentes com a qualidade que ele procura.",
			Status:      "Ativo",
		},
		{
			Page:        "about",
			Name:        "Visão",
			Section:     "Vision",
			Title:       "Crescer como referência em cookies",
			Subtitle:    "Nossa visão",
			Description: "Queremos ser reconhecidos como uma das melhores redes de cookies em São Carlos e região, crescendo com qualidade, pertencimento e compromisso com cada pessoa atendida.",
			Status:      "Ativo",
		},
		{
			Page:        "about",
			Name:        "CTA Sobre",
			Section:     "CTA",
			Title:       "Pronto para conhecer nossos sabores?",
			Description: "Explore nosso cardápio e descubra os cookies e produtos preparados para tornar seu momento mais especial.",
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
			Description: "Av. Trabalhador são-carlense, 400 - Centro. CEP: 13566-590\nSeg-Sáb: 9h - 20h\nDom: 10h - 18h",
			Status:      "Ativo",
		},
		{
			Page:        "footer",
			Name:        "Vem com a gente",
			Section:     "Social",
			Title:       "Vem com a gente!",
			Description: "Instagram\nWhatsApp",
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
