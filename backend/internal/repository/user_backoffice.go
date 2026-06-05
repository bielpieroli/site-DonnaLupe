package repository

import (
	"backend/internal/models"
	"errors"
	"fmt"
	"slices"
	"strings"

	"gorm.io/gorm"
)

var (
	ErrUserBackofficeNotFound    = errors.New("Usuário não encontrado")
	ErrUserBackofficeEmailExists = errors.New("E-mail já cadastrado")
)

type UserBackofficeRepository interface {
	Create(user *models.UserBackoffice) error
	GetByEmail(email string) (*models.UserBackoffice, error)
	GetAll(query models.UserBListQuery) (*models.UserBListResult, error)
	Update(user *models.UserBackoffice) error
	Delete(email string) error
}

type userBackofficeRepository struct {
	db *gorm.DB
}

func NewUserBackofficeRepository(db *gorm.DB) UserBackofficeRepository {
	return &userBackofficeRepository{db: db}
}

func (r *userBackofficeRepository) Create(user *models.UserBackoffice) error {
	return r.db.Create(user).Error
}

func (r *userBackofficeRepository) GetByEmail(email string) (*models.UserBackoffice, error) {
	var user models.UserBackoffice
	err := r.db.Where("email = ?", email).First(&user).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrUserBackofficeNotFound
	}
	return &user, err
}

func applySearchFilter(dbQuery *gorm.DB, query models.UserBListQuery) *gorm.DB {
	if query.SearchBy == "" || query.SearchValue == "" {
		return dbQuery
	}
	switch query.SearchBy {
	case "email":
		return dbQuery.Where("email ILIKE ?", "%"+query.SearchValue+"%")
	default:
		return dbQuery
	}
}

func resolveSortClause(sortBy string, sortOrder string) (string, error) {
	allowedSortFields := []string{"email"}
	field := strings.ToLower(sortBy)
	if !slices.Contains(allowedSortFields, field) {
		return "", fmt.Errorf("Parâmetro inválido de 'sort_by'")
	}
	order := strings.ToLower(sortOrder)
	if order != "asc" && order != "desc" {
		return "", fmt.Errorf("Parâmetro inválido de 'sort_order'")
	}
	return field + " " + order, nil
}

func (r *userBackofficeRepository) GetAll(query models.UserBListQuery) (*models.UserBListResult, error) {
	var users []models.UserBackoffice
	var totalRecords, filteredRecords int64

	sortClause, err := resolveSortClause(query.SortBy, query.SortOrder)
	if err != nil {
		return nil, err
	}

	if err := r.db.Model(&models.UserBackoffice{}).Count(&totalRecords).Error; err != nil {
		return nil, err
	}

	filteredQuery := applySearchFilter(r.db.Model(&models.UserBackoffice{}), query)
	if err := filteredQuery.Count(&filteredRecords).Error; err != nil {
		return nil, err
	}

	dataQuery := applySearchFilter(r.db.Model(&models.UserBackoffice{}), query)
	if err := dataQuery.Order(sortClause).Limit(query.Limit).Offset(query.Offset).Find(&users).Error; err != nil {
		return nil, err
	}

	return &models.UserBListResult{
		Users:           models.ToSafeUsersBackoffice(users),
		TotalRecords:    totalRecords,
		FilteredRecords: filteredRecords,
	}, nil
}

func (r *userBackofficeRepository) Update(user *models.UserBackoffice) error {
	return r.db.Save(user).Error
}

func (r *userBackofficeRepository) Delete(email string) error {
	return r.db.Delete(&models.UserBackoffice{Email: email}).Error
}
