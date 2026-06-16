package repository

import (
	"backend/internal/models"
	"errors"

	"gorm.io/gorm"
)

var ErrPermissionNotFound = errors.New("Permissão não encontrada")

type PermissionRepository interface {
	GetByEmail(email string) ([]models.Permission, error)
	GetByEmailAndResource(email, resource string) (*models.Permission, error)
	SetPermissions(email string, perms []models.PermissionInput) error
	EnsurePermissions(email string, perms []models.PermissionInput) error
	DeleteByEmail(email string) error
}

type permissionRepository struct {
	db *gorm.DB
}

func NewPermissionRepository(db *gorm.DB) PermissionRepository {
	return &permissionRepository{db: db}
}

func (r *permissionRepository) GetByEmail(email string) ([]models.Permission, error) {
	var perms []models.Permission
	err := r.db.Where("backoffice_email = ?", email).Find(&perms).Error
	return perms, err
}

func (r *permissionRepository) GetByEmailAndResource(email, resource string) (*models.Permission, error) {
	var perm models.Permission
	err := r.db.Where("backoffice_email = ? AND resource = ?", email, resource).First(&perm).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrPermissionNotFound
	}
	return &perm, err
}

func (r *permissionRepository) SetPermissions(email string, perms []models.PermissionInput) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Where("backoffice_email = ?", email).Delete(&models.Permission{}).Error; err != nil {
			return err
		}
		for _, p := range perms {
			if p.Level == models.PermNone {
				continue
			}
			entry := models.Permission{
				BackofficeEmail: email,
				Resource:        p.Resource,
				Level:           p.Level,
			}
			if err := tx.Create(&entry).Error; err != nil {
				return err
			}
		}
		return nil
	})
}

func (r *permissionRepository) EnsurePermissions(email string, perms []models.PermissionInput) error {
	for _, p := range perms {
		if p.Level == models.PermNone {
			continue
		}
		entry := models.Permission{
			BackofficeEmail: email,
			Resource:        p.Resource,
			Level:           p.Level,
		}
		r.db.Where("backoffice_email = ? AND resource = ?", email, p.Resource).
			FirstOrCreate(&entry)
	}
	return nil
}

func (r *permissionRepository) DeleteByEmail(email string) error {
	return r.db.Where("backoffice_email = ?", email).Delete(&models.Permission{}).Error
}
