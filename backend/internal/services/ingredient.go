package services

import (
	"backend/internal/models"
	"backend/internal/repository"
	"errors"
	"strings"
)

var ErrIngredientAlreadyExists = errors.New("ingrediente já cadastrado")

type IngredientService interface {
	GetAll() ([]models.Ingredient, error)
	Create(input models.CreateIngredientRequest) (*models.Ingredient, error)
	Update(name string, input models.UpdateIngredientRequest) (*models.Ingredient, error)
	Delete(name string) error
}

type ingredientService struct {
	repo repository.IngredientRepository
}

func NewIngredientService(repo repository.IngredientRepository) IngredientService {
	return &ingredientService{repo: repo}
}

func (s *ingredientService) GetAll() ([]models.Ingredient, error) {
	return s.repo.GetAll()
}

func (s *ingredientService) Create(input models.CreateIngredientRequest) (*models.Ingredient, error) {
	name := strings.TrimSpace(input.Name)
	if name == "" {
		return nil, errors.New("nome do ingrediente é obrigatório")
	}

	if _, err := s.repo.GetByName(name); err == nil {
		return nil, ErrIngredientAlreadyExists
	} else if !errors.Is(err, repository.ErrIngredientNotFound) {
		return nil, err
	}

	unit := strings.TrimSpace(input.Unit)
	if unit == "" {
		unit = "un"
	}

	ingredient := &models.Ingredient{
		Name:       name,
		Stock:      input.Stock,
		Unit:       unit,
		ValueReais: input.ValueReais,
	}
	if err := s.repo.Create(ingredient); err != nil {
		return nil, err
	}
	return ingredient, nil
}

func (s *ingredientService) Update(name string, input models.UpdateIngredientRequest) (*models.Ingredient, error) {
	ingredient, err := s.repo.GetByName(name)
	if err != nil {
		return nil, err
	}

	if input.Stock != nil {
		ingredient.Stock = *input.Stock
	}
	if input.Unit != nil {
		unit := strings.TrimSpace(*input.Unit)
		if unit == "" {
			unit = "un"
		}
		ingredient.Unit = unit
	}
	if input.ValueReais != nil {
		ingredient.ValueReais = *input.ValueReais
	}

	if err := s.repo.Update(ingredient); err != nil {
		return nil, err
	}
	return ingredient, nil
}

func (s *ingredientService) Delete(name string) error {
	return s.repo.Delete(name)
}
