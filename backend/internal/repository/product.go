package repository

import (
	"backend/internal/models"
	"errors"

	"gorm.io/gorm"
)

var ErrProductNotFound = errors.New("produto não encontrado")

type ProductRepository interface {
	GetActive() ([]models.Product, error)
	GetActiveByName(name string) (*models.Product, error)
	GetByName(name string) (*models.Product, error)
	Create(product *models.Product) error
	Update(currentName string, product *models.Product) error
	Deactivate(name string) error
}

type productRepository struct{ db *gorm.DB }

func NewProductRepository(db *gorm.DB) ProductRepository {
	return &productRepository{db: db}
}

func (r *productRepository) GetActive() ([]models.Product, error) {
	var products []models.Product
	err := r.db.Where("status = ?", "active").Order("name asc").Find(&products).Error
	return products, err
}

func (r *productRepository) GetActiveByName(name string) (*models.Product, error) {
	var product models.Product
	err := r.db.Where("name = ? AND status = ?", name, "active").First(&product).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrProductNotFound
	}
	return &product, err
}

func (r *productRepository) GetByName(name string) (*models.Product, error) {
	var product models.Product
	err := r.db.Where("name = ?", name).First(&product).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrProductNotFound
	}
	return &product, err
}

func (r *productRepository) Create(product *models.Product) error {
	return r.db.Create(product).Error
}

func (r *productRepository) Update(currentName string, product *models.Product) error {
	res := r.db.Model(&models.Product{}).
		Where("name = ?", currentName).
		Updates(map[string]interface{}{
			"name":             product.Name,
			"subtitle":         product.Subtitle,
			"category":         product.Category,
			"description":      product.Description,
			"img":              product.Img,
			"image_file":       product.ImageFile,
			"price":            product.Price,
			"weight":           product.Weight,
			"ingredients_json": product.IngredientsJSON,
			"allergens":        product.Allergens,
			"badge":            product.Badge,
			"stock":            product.Stock,
			"status":           product.Status,
		})
	if res.Error != nil {
		return res.Error
	}
	if res.RowsAffected == 0 {
		return ErrProductNotFound
	}
	return nil
}

func (r *productRepository) Deactivate(name string) error {
	res := r.db.Model(&models.Product{}).
		Where("name = ?", name).
		Update("status", "inactive")
	if res.Error != nil {
		return res.Error
	}
	if res.RowsAffected == 0 {
		return ErrProductNotFound
	}
	return nil
}
