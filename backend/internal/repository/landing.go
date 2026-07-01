package repository

import (
	"backend/internal/models"
	"errors"

	"gorm.io/gorm"
)

var ErrLandingContentNotFound = errors.New("conteúdo da landing não encontrado")

type LandingRepository interface {
	GetAll() ([]models.LandingContent, error)
	GetActive() ([]models.LandingContent, error)
	GetByID(id uint) (*models.LandingContent, error)
	Create(content *models.LandingContent) error
	Update(content *models.LandingContent) error
	Delete(id uint) error
	Count() (int64, error)
}

type landingRepository struct{ db *gorm.DB }

func NewLandingRepository(db *gorm.DB) LandingRepository {
	return &landingRepository{db: db}
}

func (r *landingRepository) GetAll() ([]models.LandingContent, error) {
	var contents []models.LandingContent
	err := r.db.Order("id asc").Find(&contents).Error
	return contents, err
}

func (r *landingRepository) GetActive() ([]models.LandingContent, error) {
	var contents []models.LandingContent
	err := r.db.Where("status = ?", "Ativo").Order("id asc").Find(&contents).Error
	return contents, err
}

func (r *landingRepository) GetByID(id uint) (*models.LandingContent, error) {
	var content models.LandingContent
	err := r.db.First(&content, id).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrLandingContentNotFound
	}
	return &content, err
}

func (r *landingRepository) Create(content *models.LandingContent) error {
	return r.db.Create(content).Error
}

func (r *landingRepository) Update(content *models.LandingContent) error {
	return r.db.Save(content).Error
}

func (r *landingRepository) Delete(id uint) error {
	res := r.db.Delete(&models.LandingContent{}, id)
	if res.Error != nil {
		return res.Error
	}
	if res.RowsAffected == 0 {
		return ErrLandingContentNotFound
	}
	return nil
}

func (r *landingRepository) Count() (int64, error) {
	var total int64
	err := r.db.Model(&models.LandingContent{}).Count(&total).Error
	return total, err
}
