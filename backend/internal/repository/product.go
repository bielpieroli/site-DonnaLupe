package repository

import (
	"backend/internal/models"
	"errors"

	"gorm.io/gorm"
)

var ErrProductNotFound = errors.New("produto não encontrado")

type ProductRepository interface {
	GetAll(kind string) ([]models.Product, error)
	GetActive(kind string) ([]models.Product, error)
	GetByID(id uint) (*models.Product, error)
	Create(product *models.Product) error
	Update(product *models.Product) error
	Delete(id uint) error
	Count() (int64, error)
}

type productRepository struct{ db *gorm.DB }

func NewProductRepository(db *gorm.DB) ProductRepository {
	return &productRepository{db: db}
}

func (r *productRepository) GetAll(kind string) ([]models.Product, error) {
	var products []models.Product
	query := r.db.Order("id ASC")
	if kind != "" {
		query = query.Where("kind = ?", kind)
	}
	return products, query.Find(&products).Error
}

func (r *productRepository) GetActive(kind string) ([]models.Product, error) {
	var products []models.Product
	query := r.db.Where("status <> ?", "Esgotado").Order("id ASC")
	if kind != "" {
		query = query.Where("kind = ?", kind)
	}
	return products, query.Find(&products).Error
}

func (r *productRepository) GetByID(id uint) (*models.Product, error) {
	var product models.Product
	if err := r.db.First(&product, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrProductNotFound
		}
		return nil, err
	}
	return &product, nil
}

func (r *productRepository) Create(product *models.Product) error {
	return r.db.Create(product).Error
}

func (r *productRepository) Update(product *models.Product) error {
	return r.db.Save(product).Error
}

func (r *productRepository) Delete(id uint) error {
	res := r.db.Delete(&models.Product{}, id)
	if res.Error != nil {
		return res.Error
	}
	if res.RowsAffected == 0 {
		return ErrProductNotFound
	}
	return nil
}

func (r *productRepository) Count() (int64, error) {
	var count int64
	err := r.db.Model(&models.Product{}).Count(&count).Error
	return count, err
}
