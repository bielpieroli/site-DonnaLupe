package services

import (
	"backend/internal/models"
	"backend/internal/repository"
	"errors"
	"os"
)

type PermissionService interface {
	// GetFullPermissions returns one entry per KnownResource, filling "none" for missing entries.
	GetFullPermissions(email string) ([]models.Permission, error)
	SetUserPermissions(email string, perms []models.PermissionInput) error
	CheckPermission(email, resource string, required models.PermissionLevel) (bool, error)
	// InitializeAdminPermissions grants write on all KnownResources without overwriting existing entries.
	InitializeAdminPermissions() error
	DeleteByEmail(email string) error
}

type permissionService struct {
	repo repository.PermissionRepository
}

func NewPermissionService(repo repository.PermissionRepository) PermissionService {
	return &permissionService{repo: repo}
}

func (s *permissionService) GetFullPermissions(email string) ([]models.Permission, error) {
	existing, err := s.repo.GetByEmail(email)
	if err != nil {
		return nil, err
	}

	byResource := make(map[string]models.PermissionLevel, len(existing))
	for _, p := range existing {
		byResource[p.Resource] = p.Level
	}

	full := make([]models.Permission, 0, len(models.KnownResources))
	for _, resource := range models.KnownResources {
		level, ok := byResource[resource]
		if !ok {
			level = models.PermNone
		}
		full = append(full, models.Permission{
			BackofficeEmail: email,
			Resource:        resource,
			Level:           level,
		})
	}
	return full, nil
}

func (s *permissionService) SetUserPermissions(email string, perms []models.PermissionInput) error {
	return s.repo.SetPermissions(email, perms)
}

func (s *permissionService) CheckPermission(email, resource string, required models.PermissionLevel) (bool, error) {
	if required == models.PermNone {
		return true, nil
	}
	perm, err := s.repo.GetByEmailAndResource(email, resource)
	if err != nil {
		if errors.Is(err, repository.ErrPermissionNotFound) {
			return false, nil
		}
		return false, err
	}
	return models.HasLevel(perm.Level, required), nil
}

func (s *permissionService) InitializeAdminPermissions() error {

	email := os.Getenv("ADMIN_EMAIL")
	perms := make([]models.PermissionInput, 0, len(models.KnownResources))
	for _, resource := range models.KnownResources {
		perms = append(perms, models.PermissionInput{
			Resource: resource,
			Level:    models.PermWrite,
		})
	}
	return s.repo.EnsurePermissions(email, perms)
}

func (s *permissionService) DeleteByEmail(email string) error {
	return s.repo.DeleteByEmail(email)
}
