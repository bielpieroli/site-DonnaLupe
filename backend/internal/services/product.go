package services

import (
	"backend/internal/models"
	"backend/internal/repository"
	"encoding/base64"
	"encoding/json"
	"errors"
	"net/http"
	"strings"
)

type ProductService interface {
	GetActive() ([]models.ProductResponse, error)
	GetActiveByName(name string) (*models.ProductResponse, error)
	Create(input models.ProductInput) (*models.ProductResponse, error)
	Update(currentName string, input models.ProductInput, replaceImage bool) (*models.ProductResponse, error)
	Deactivate(name string) error
}

type productService struct{ repo repository.ProductRepository }

func NewProductService(repo repository.ProductRepository) ProductService {
	return &productService{repo: repo}
}

func (s *productService) GetActive() ([]models.ProductResponse, error) {
	products, err := s.repo.GetActive()
	if err != nil {
		return nil, err
	}
	responses := make([]models.ProductResponse, len(products))
	for i := range products {
		responses[i] = toProductResponse(&products[i])
	}
	return responses, nil
}

func (s *productService) GetActiveByName(name string) (*models.ProductResponse, error) {
	product, err := s.repo.GetActiveByName(name)
	if err != nil {
		return nil, err
	}
	response := toProductResponse(product)
	return &response, nil
}

func (s *productService) Create(input models.ProductInput) (*models.ProductResponse, error) {
	normalizeProductInput(&input)
	if err := validateProductInput(input, true); err != nil {
		return nil, err
	}
	product := &models.Product{
		Name:            input.Name,
		Subtitle:        input.Subtitle,
		Category:        input.Category,
		Description:     input.Description,
		Img:             input.Img,
		ImageFile:       input.ImageFile,
		Price:           input.Price,
		Weight:          input.Weight,
		IngredientsJSON: ingredientsJSON(input.Ingredients),
		Allergens:       input.Allergens,
		Badge:           input.Badge,
		Stock:           input.Stock,
		Status:          input.Status,
	}
	if err := s.repo.Create(product); err != nil {
		return nil, err
	}
	response := toProductResponse(product)
	return &response, nil
}

func (s *productService) Update(currentName string, input models.ProductInput, replaceImage bool) (*models.ProductResponse, error) {
	normalizeProductInput(&input)
	if err := validateProductInput(input, replaceImage); err != nil {
		return nil, err
	}
	product, err := s.repo.GetByName(currentName)
	if err != nil {
		return nil, err
	}
	product.Name = input.Name
	product.Subtitle = input.Subtitle
	product.Category = input.Category
	product.Description = input.Description
	product.ImageFile = input.ImageFile
	product.Price = input.Price
	product.Weight = input.Weight
	product.IngredientsJSON = ingredientsJSON(input.Ingredients)
	product.Allergens = input.Allergens
	product.Badge = input.Badge
	product.Stock = input.Stock
	product.Status = input.Status
	if replaceImage {
		product.Img = input.Img
	}
	if err := s.repo.Update(currentName, product); err != nil {
		return nil, err
	}
	response := toProductResponse(product)
	return &response, nil
}

func (s *productService) Deactivate(name string) error {
	return s.repo.Deactivate(name)
}

func normalizeProductInput(input *models.ProductInput) {
	input.Name = strings.TrimSpace(input.Name)
	input.Subtitle = strings.TrimSpace(input.Subtitle)
	input.Category = strings.TrimSpace(input.Category)
	input.Description = strings.TrimSpace(input.Description)
	input.ImageFile = strings.TrimSpace(input.ImageFile)
	input.Weight = strings.TrimSpace(input.Weight)
	input.Allergens = strings.TrimSpace(input.Allergens)
	input.Badge = strings.TrimSpace(input.Badge)
	input.Status = strings.TrimSpace(input.Status)
	for i := range input.Ingredients {
		input.Ingredients[i] = strings.TrimSpace(input.Ingredients[i])
	}
}

func validateProductInput(input models.ProductInput, requireImage bool) error {
	if input.Name == "" {
		return errors.New("nome é obrigatório")
	}
	if input.Subtitle == "" {
		return errors.New("subtítulo é obrigatório")
	}
	if input.Category == "" {
		return errors.New("categoria é obrigatória")
	}
	if input.Description == "" {
		return errors.New("descrição é obrigatória")
	}
	if input.Weight == "" {
		return errors.New("peso é obrigatório")
	}
	if len(cleanIngredients(input.Ingredients)) == 0 {
		return errors.New("ingredientes são obrigatórios")
	}
	if input.Allergens == "" {
		return errors.New("alérgenos são obrigatórios")
	}
	if input.Badge == "" {
		return errors.New("badge é obrigatório")
	}
	if input.Status == "" {
		return errors.New("status é obrigatório")
	}
	if input.Price < 0 {
		return errors.New("preço deve ser maior ou igual a zero")
	}
	if input.Stock < 0 {
		return errors.New("estoque deve ser maior ou igual a zero")
	}
	if requireImage && len(input.Img) == 0 {
		return errors.New("imagem é obrigatória")
	}
	return nil
}

func toProductResponse(product *models.Product) models.ProductResponse {
	return models.ProductResponse{
		Name:        product.Name,
		Subtitle:    product.Subtitle,
		Category:    product.Category,
		Description: product.Description,
		Img:         dataURL(product.Img),
		ImageFile:   product.ImageFile,
		Price:       product.Price,
		Weight:      product.Weight,
		Ingredients: parseIngredients(product.IngredientsJSON),
		Allergens:   product.Allergens,
		Badge:       product.Badge,
		Stock:       product.Stock,
		Status:      product.Status,
	}
}

func ingredientsJSON(ingredients []string) string {
	data, err := json.Marshal(cleanIngredients(ingredients))
	if err != nil {
		return "[]"
	}
	return string(data)
}

func parseIngredients(raw string) []string {
	var ingredients []string
	if err := json.Unmarshal([]byte(raw), &ingredients); err == nil {
		return cleanIngredients(ingredients)
	}
	return cleanIngredients(strings.Split(raw, ","))
}

func cleanIngredients(ingredients []string) []string {
	clean := make([]string, 0, len(ingredients))
	for _, ingredient := range ingredients {
		ingredient = strings.TrimSpace(ingredient)
		if ingredient != "" {
			clean = append(clean, ingredient)
		}
	}
	return clean
}

func dataURL(data []byte) string {
	if len(data) == 0 {
		return ""
	}
	contentType := http.DetectContentType(data)
	return "data:" + contentType + ";base64," + base64.StdEncoding.EncodeToString(data)
}
