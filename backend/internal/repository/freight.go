package repository

import (
	"backend/internal/models"
	"errors"

	"gorm.io/gorm"
)

var ErrFreightRuleNotFound = errors.New("regra de frete não encontrada")
var ErrNoFreightRuleForDistance = errors.New("endereço fora da área de entrega")

type FreightRepository interface {
	GetAll() ([]models.FreightRule, error)
	GetByID(id uint) (*models.FreightRule, error)
	Create(rule *models.FreightRule) error
	Update(rule *models.FreightRule) error
	Delete(id uint) error
	FindRuleForDistance(distanceKm float64) (*models.FreightRule, error)
}

type freightRepository struct{ db *gorm.DB }

func NewFreightRepository(db *gorm.DB) FreightRepository {
	return &freightRepository{db: db}
}

func (r *freightRepository) GetAll() ([]models.FreightRule, error) {
	var rules []models.FreightRule
	err := r.db.Order("max_distance_km asc").Find(&rules).Error
	return rules, err
}

func (r *freightRepository) GetByID(id uint) (*models.FreightRule, error) {
	var rule models.FreightRule
	err := r.db.First(&rule, id).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrFreightRuleNotFound
	}
	return &rule, err
}

func (r *freightRepository) Create(rule *models.FreightRule) error {
	return r.db.Create(rule).Error
}

func (r *freightRepository) Update(rule *models.FreightRule) error {
	return r.db.Save(rule).Error
}

func (r *freightRepository) Delete(id uint) error {
	res := r.db.Delete(&models.FreightRule{}, id)
	if res.Error != nil {
		return res.Error
	}
	if res.RowsAffected == 0 {
		return ErrFreightRuleNotFound
	}
	return nil
}

func (r *freightRepository) FindRuleForDistance(distanceKm float64) (*models.FreightRule, error) {
	var rule models.FreightRule
	err := r.db.
		Where("max_distance_km >= ?", distanceKm).
		Order("max_distance_km asc").
		First(&rule).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrNoFreightRuleForDistance
	}
	return &rule, err
}
