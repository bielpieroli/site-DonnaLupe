package repository

import (
	"backend/internal/models"
	"errors"

	"gorm.io/gorm"
)

var ErrIngredientNotFound = errors.New("ingrediente não encontrado")

type IngredientRepository interface {
	GetAll() ([]models.Ingredient, error)
	GetByName(name string) (*models.Ingredient, error)
	Create(ingredient *models.Ingredient) error
	Update(ingredient *models.Ingredient) error
	Delete(name string) error
}

type ingredientRepository struct {
	db *gorm.DB
}

func NewIngredientRepository(db *gorm.DB) IngredientRepository {
	return &ingredientRepository{db: db}
}

func (r *ingredientRepository) GetAll() ([]models.Ingredient, error) {
	var ingredients []models.Ingredient
	err := r.db.Order("name asc").Find(&ingredients).Error
	return ingredients, err
}

func (r *ingredientRepository) GetByName(name string) (*models.Ingredient, error) {
	var ingredient models.Ingredient
	err := r.db.Where("name = ?", name).First(&ingredient).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrIngredientNotFound
	}
	return &ingredient, err
}

func (r *ingredientRepository) Create(ingredient *models.Ingredient) error {
	return r.db.Create(ingredient).Error
}

func (r *ingredientRepository) Update(ingredient *models.Ingredient) error {
	return r.db.Save(ingredient).Error
}

func (r *ingredientRepository) Delete(name string) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Where("ingredient_name = ?", name).Delete(&models.ProductIngredient{}).Error; err != nil {
			return err
		}

		res := tx.Where("name = ?", name).Delete(&models.Ingredient{})
		if res.Error != nil {
			return res.Error
		}
		if res.RowsAffected == 0 {
			return ErrIngredientNotFound
		}
		return nil
	})
}
