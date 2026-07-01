package services

import (
	"backend/internal/models"
	"backend/internal/repository"
	"fmt"
	"strconv"
	"strings"
)

type ProductService interface {
	GetAll(kind string) ([]models.ProductResponse, error)
	GetActive(kind string) ([]models.ProductResponse, error)
	Create(input models.ProductInput) (*models.ProductResponse, error)
	Update(id uint, input models.ProductInput) (*models.ProductResponse, error)
	Delete(id uint) error
	InitializeDefaults() error
}

type productService struct{ repo repository.ProductRepository }

func NewProductService(repo repository.ProductRepository) ProductService {
	return &productService{repo: repo}
}

func (s *productService) GetAll(kind string) ([]models.ProductResponse, error) {
	products, err := s.repo.GetAll(kind)
	if err != nil {
		return nil, err
	}
	return productResponses(products), nil
}

func (s *productService) GetActive(kind string) ([]models.ProductResponse, error) {
	products, err := s.repo.GetActive(kind)
	if err != nil {
		return nil, err
	}
	return productResponses(products), nil
}

func (s *productService) Create(input models.ProductInput) (*models.ProductResponse, error) {
	product := productFromInput(input)
	if err := s.repo.Create(product); err != nil {
		return nil, err
	}
	response := productResponse(*product)
	return &response, nil
}

func (s *productService) Update(id uint, input models.ProductInput) (*models.ProductResponse, error) {
	product, err := s.repo.GetByID(id)
	if err != nil {
		return nil, err
	}

	updated := productFromInput(input)
	updated.ID = product.ID
	if err := s.repo.Update(updated); err != nil {
		return nil, err
	}
	response := productResponse(*updated)
	return &response, nil
}

func (s *productService) Delete(id uint) error {
	return s.repo.Delete(id)
}

func (s *productService) InitializeDefaults() error {
	count, err := s.repo.Count()
	if err != nil {
		return err
	}
	if count > 0 {
		return nil
	}
	for _, product := range defaultProducts() {
		item := product
		if err := s.repo.Create(&item); err != nil {
			return err
		}
	}
	return nil
}

func productFromInput(input models.ProductInput) *models.Product {
	return &models.Product{
		Name:            strings.TrimSpace(input.Name),
		Subtitle:        strings.TrimSpace(input.Subtitle),
		Kind:            productKind(input.Kind),
		Category:        strings.TrimSpace(input.Category),
		Description:     strings.TrimSpace(input.Description),
		PriceValue:      input.PriceValue,
		Weight:          strings.TrimSpace(input.Weight),
		IngredientsText: strings.TrimSpace(input.IngredientsText),
		Allergens:       strings.TrimSpace(input.Allergens),
		Badge:           strings.TrimSpace(input.Badge),
		Image:           strings.TrimSpace(input.Image),
		Stock:           input.Stock,
		Flavor:          strings.TrimSpace(input.Flavor),
		Unit:            strings.TrimSpace(input.Unit),
		SizesText:       strings.TrimSpace(input.SizesText),
		SizeCountsText:  strings.TrimSpace(input.SizeCountsText),
		Status:          productStatus(input.Status),
	}
}

func productResponses(products []models.Product) []models.ProductResponse {
	responses := make([]models.ProductResponse, 0, len(products))
	for _, product := range products {
		responses = append(responses, productResponse(product))
	}
	return responses
}

func productResponse(product models.Product) models.ProductResponse {
	ingredients := splitList(product.IngredientsText)
	sizes := splitList(product.SizesText)
	sizeCounts := parseSizeCounts(product.SizeCountsText)

	return models.ProductResponse{
		ID:              product.ID,
		Name:            product.Name,
		Subtitle:        product.Subtitle,
		Kind:            product.Kind,
		Category:        product.Category,
		Description:     product.Description,
		PriceValue:      product.PriceValue,
		Price:           formatBRL(product.PriceValue),
		Weight:          product.Weight,
		Ingredients:     ingredients,
		IngredientsText: product.IngredientsText,
		Allergens:       product.Allergens,
		Badge:           product.Badge,
		Image:           product.Image,
		Img:             product.Image,
		Stock:           product.Stock,
		Flavor:          product.Flavor,
		Unit:            product.Unit,
		Sizes:           sizes,
		SizesText:       product.SizesText,
		SizeCounts:      sizeCounts,
		SizeCountsText:  product.SizeCountsText,
		Status:          product.Status,
	}
}

func splitList(value string) []string {
	value = strings.TrimSpace(value)
	if value == "" {
		return []string{}
	}

	normalized := strings.NewReplacer("\r\n", "\n", ";", "\n", ",", "\n").Replace(value)
	parts := strings.Split(normalized, "\n")
	list := make([]string, 0, len(parts))
	for _, part := range parts {
		item := strings.TrimSpace(part)
		if item != "" {
			list = append(list, item)
		}
	}
	return list
}

func parseSizeCounts(value string) map[string]int {
	result := map[string]int{}
	for _, item := range splitList(value) {
		key, raw, ok := strings.Cut(item, ":")
		if !ok {
			key, raw, ok = strings.Cut(item, "=")
		}
		if !ok {
			continue
		}
		count, err := strconv.Atoi(strings.TrimSpace(raw))
		if err != nil {
			continue
		}
		result[strings.TrimSpace(key)] = count
	}
	return result
}

func formatBRL(value float64) string {
	formatted := fmt.Sprintf("R$ %.2f", value)
	return strings.Replace(formatted, ".", ",", 1)
}

func productKind(kind string) string {
	switch strings.ToLower(strings.TrimSpace(kind)) {
	case "coffee":
		return "Coffee"
	default:
		return "Shopping"
	}
}

func productStatus(status string) string {
	status = strings.TrimSpace(status)
	if status == "" {
		return "Disponível"
	}
	return status
}

func defaultProducts() []models.Product {
	return []models.Product{
		{
			Name:            "Chocolate Ao Leite",
			Subtitle:        "classico irresistivel",
			Kind:            "Shopping",
			Category:        "Classico",
			Description:     "Chocolate belga ao leite, crocante por fora, derretido por dentro.",
			PriceValue:      12,
			Weight:          "120g",
			IngredientsText: "Farinha de trigo, Manteiga, Chocolate belga, Acucar mascavo, Ovos",
			Allergens:       "Contem: Gluten, Leite, Ovos",
			Badge:           "Queridinho",
			Image:           "cookie-choco-chunk.png",
			Stock:           120,
			Flavor:          "Chocolate belga ao leite",
			Status:          "Disponível",
		},
		{
			Name:            "Double Chocolate",
			Subtitle:        "intenso e marcante",
			Kind:            "Shopping",
			Category:        "Intenso",
			Description:     "Massa de cacau 70% com gotas meio amargas para um sabor marcante.",
			PriceValue:      14,
			Weight:          "125g",
			IngredientsText: "Farinha de trigo, Manteiga, Cacau 70%, Chocolate meio amargo, Ovos",
			Allergens:       "Contem: Gluten, Leite, Ovos",
			Badge:           "Mais pedido",
			Image:           "cookie-double-choc.png",
			Stock:           96,
			Flavor:          "Cacau 70%",
			Status:          "Disponível",
		},
		{
			Name:            "Trio Chocolate Ao Leite",
			Subtitle:        "Mini",
			Kind:            "Shopping",
			Category:        "Classico",
			Description:     "Chocolate belga ao leite, crocante por fora, derretido por dentro.",
			PriceValue:      10,
			Weight:          "120g",
			IngredientsText: "Farinha de trigo, Manteiga, Chocolate belga, Acucar mascavo, Ovos",
			Allergens:       "Contem: Gluten, Leite, Ovos",
			Badge:           "Queridinho",
			Image:           "trio-choco.png",
			Stock:           120,
			Flavor:          "Chocolate belga ao leite",
			Status:          "Disponível",
		},
		{
			Name:            "Red",
			Subtitle:        "Velvt",
			Kind:            "Shopping",
			Category:        "Velvt",
			Description:     "Massa macia com pedacos de chocolate branco",
			PriceValue:      13,
			Weight:          "120g",
			IngredientsText: "Farinha de trigo, Manteiga, Chocolate branco, Baunilha e Ovos",
			Allergens:       "Contem: Gluten, Leite, Ovos",
			Badge:           "Queridinho",
			Image:           "cookie-red.png",
			Stock:           60,
			Flavor:          "Chocolate branco e baunilha",
			Status:          "Disponível",
		},
		
		{
			Name:           "Caixa de Cookies",
			Kind:           "Coffee",
			Category:       "Cookies",
			Description:    "Seleção de cookies artesanais, crocantes e macios.",
			PriceValue:     28,
			Image:          "coffee-cookies.jpg",
			Stock:          18,
			Flavor:         "Sortidos",
			Unit:           "caixa",
			SizesText:      "P, M, G",
			SizeCountsText: "P:8, M:16, G:30",
			Status:         "Disponível",
		},
		{
			Name:           "Caixa de Brownies",
			Kind:           "Coffee",
			Category:       "Brownies",
			Description:    "Brownies fudgy feitos com chocolate de qualidade.",
			PriceValue:     32,
			Image:          "coffee-brownies.jpg",
			Stock:          12,
			Flavor:         "Chocolate intenso",
			Unit:           "caixa",
			SizesText:      "P, M, G",
			SizeCountsText: "P:8, M:16, G:30",
			Status:         "Disponível",
		},
		{
			Name:           "Caixa de Coxinhas",
			Kind:           "Coffee",
			Category:       "Salgados",
			Description:    "Coxinha crocante com recheio cremoso.",
			PriceValue:     42,
			Image:          "coffee-coxinha.jpg",
			Stock:          10,
			Flavor:         "Crocante e recheada",
			Unit:           "caixa",
			SizesText:      "P, M, G",
			SizeCountsText: "P:20, M:50, G:80",
			Status:         "Disponível",
		},
		{
			Name:           "Mini-Empadas",
			Kind:           "Coffee",
			Category:       "Salgados",
			Description:    "Mini-Empadas tradicionais com recheios selecionados.",
			PriceValue:     48,
			Image:          "coffee-empada.jpg",
			Stock:          8,
			Flavor:         "Recheios variados",
			Unit:           "caixa",
			SizesText:      "P, M, G",
			SizeCountsText: "P:20, M:30, G:40",
			Status:         "Em promoção",
		},
		{
			Name:           "Bolo Caseiro",
			Kind:           "Coffee",
			Category:       "Bolos",
			Description:    "Bolos do dia, prontos para fatias ou inteiros.",
			PriceValue:     35,
			Image:          "coffee-bolo.jpg",
			Stock:          0,
			Flavor:         "Do dia",
			Unit:           "bolo",
			SizesText:      "P, M, G",
			SizeCountsText: "P:1, M:1, G:1",
			Status:         "Esgotado",
		},
	}
}
