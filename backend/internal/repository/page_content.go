package repository

import (
	"backend/internal/models"
	"errors"

	"gorm.io/gorm"
)

var ErrPageContentNotFound = errors.New("conteúdo da página não encontrado")

type PageContentRepository interface {
	GetAll() ([]models.PageContent, error)
	GetActive(page string) ([]models.PageContent, error)
	GetByID(id uint) (*models.PageContent, error)
	Create(content *models.PageContent) error
	Update(content *models.PageContent) error
	Delete(id uint) error
	Count() (int64, error)
}

type pageContentRepository struct{ db *gorm.DB }

func NewPageContentRepository(db *gorm.DB) PageContentRepository {
	return &pageContentRepository{db: db}
}

func (r *pageContentRepository) GetAll() ([]models.PageContent, error) {
	var contents []models.PageContent
	err := r.db.Order("page ASC, id ASC").Find(&contents).Error
	return contents, err
}

func (r *pageContentRepository) GetActive(page string) ([]models.PageContent, error) {
	var contents []models.PageContent
	query := r.db.Where("status = ?", "Ativo").Order("id ASC")
	if page != "" {
		query = query.Where("page = ?", page)
	}
	return contents, query.Find(&contents).Error
}

func (r *pageContentRepository) GetByID(id uint) (*models.PageContent, error) {
	var content models.PageContent
	if err := r.db.First(&content, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrPageContentNotFound
		}
		return nil, err
	}
	return &content, nil
}

func (r *pageContentRepository) Create(content *models.PageContent) error {
	return r.db.Create(content).Error
}

func (r *pageContentRepository) Update(content *models.PageContent) error {
	return r.db.Save(content).Error
}

func (r *pageContentRepository) Delete(id uint) error {
	res := r.db.Delete(&models.PageContent{}, id)
	if res.Error != nil {
		return res.Error
	}
	if res.RowsAffected == 0 {
		return ErrPageContentNotFound
	}
	return nil
}

func (r *pageContentRepository) Count() (int64, error) {
	var count int64
	err := r.db.Model(&models.PageContent{}).Count(&count).Error
	return count, err
}
