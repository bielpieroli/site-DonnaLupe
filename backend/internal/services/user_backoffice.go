package services

import (
	"backend/internal/models"
	"backend/internal/providers"
	"backend/internal/repository"
	"errors"
	"fmt"
	"os"
	"strings"
)

var ErrEmailAlreadyExists = errors.New("E-mail já cadastrado")

type UserBackofficeService interface {
	InitializeAdmin() (bool, error)
	CreateUser(req models.CreateUserBackofficeRequest) (*models.SafeUserBackoffice, error)
	GetAllUsers(page int, limit int, sortBy string, sortOrder string, searchBy string, searchValue string) (*models.UserBListResult, error)
	GetUserByEmail(email string) (*models.SafeUserBackoffice, error)
	UpdateUser(email string, req models.UpdateUserBackofficeRequest) error
	DeleteUser(email string) error
}

type userBackofficeService struct {
	repo             repository.UserBackofficeRepository
	passwordProvider providers.PasswordProvider
}

func NewUserBackofficeService(repo repository.UserBackofficeRepository, passwordProvider providers.PasswordProvider) UserBackofficeService {
	return &userBackofficeService{repo: repo, passwordProvider: passwordProvider}
}

func (s *userBackofficeService) InitializeAdmin() (bool, error) {
	email := os.Getenv("ADMIN_EMAIL")
	password := os.Getenv("ADMIN_PASSWORD")

	if email == "" || password == "" {
		return false, errors.New("ADMIN_EMAIL e ADMIN_PASSWORD devem estar definidos no .env")
	}

	_, err := s.repo.GetByEmail(email)
	if err == nil {
		return false, nil
	}

	_, err = s.CreateUser(models.CreateUserBackofficeRequest{
		Email:    email,
		Password: password,
	})
	if err != nil {
		return false, fmt.Errorf("Erro na inicialização do admin: %w", err)
	}

	return true, nil
}

func (s *userBackofficeService) CreateUser(req models.CreateUserBackofficeRequest) (*models.SafeUserBackoffice, error) {
	_, err := s.repo.GetByEmail(req.Email)
	if err == nil {
		return nil, ErrEmailAlreadyExists
	}

	hash, err := s.passwordProvider.Hash(req.Password)
	if err != nil {
		return nil, errors.New("Erro ao processar a senha")
	}

	user := &models.UserBackoffice{
		Email:        req.Email,
		PasswordHash: hash,
	}

	if err := s.repo.Create(user); err != nil {
		return nil, err
	}

	safe := models.ToSafeUserBackoffice(user)
	return &safe, nil
}

func (s *userBackofficeService) GetAllUsers(page int, limit int, sortBy string, sortOrder string, searchBy string, searchValue string) (*models.UserBListResult, error) {
	if page < 1 {
		return nil, fmt.Errorf("Parâmetro inválido de 'page'")
	}
	if limit < 1 {
		return nil, fmt.Errorf("Parâmetro inválido de 'limit'")
	}

	sortBy = strings.ToLower(sortBy)
	sortOrder = strings.ToLower(sortOrder)

	if sortBy == "" {
		sortBy = "email"
	}
	if sortOrder == "" {
		sortOrder = "asc"
	}

	allowedSortFields := map[string]bool{"email": true}
	if !allowedSortFields[sortBy] {
		return nil, fmt.Errorf("Parâmetro inválido de 'sort_by'")
	}
	if sortOrder != "asc" && sortOrder != "desc" {
		return nil, fmt.Errorf("Parâmetro inválido de 'sort_order'")
	}
	if (searchBy == "" && searchValue != "") || (searchBy != "" && searchValue == "") {
		return nil, fmt.Errorf("Os parâmetros 'search_by' e 'search_value' devem ser enviados juntos")
	}
	if searchBy != "" {
		searchBy = strings.ToLower(searchBy)
		allowedSearchFields := map[string]bool{"email": true}
		if !allowedSearchFields[searchBy] {
			return nil, fmt.Errorf("Parâmetro inválido de 'search_by'")
		}
	}

	query := models.UserBListQuery{
		Limit:       limit,
		Offset:      (page - 1) * limit,
		SortBy:      sortBy,
		SortOrder:   sortOrder,
		SearchBy:    searchBy,
		SearchValue: searchValue,
	}

	return s.repo.GetAll(query)
}

func (s *userBackofficeService) GetUserByEmail(email string) (*models.SafeUserBackoffice, error) {
	user, err := s.repo.GetByEmail(email)
	if err != nil {
		return nil, err
	}
	safe := models.ToSafeUserBackoffice(user)
	return &safe, nil
}

func (s *userBackofficeService) UpdateUser(email string, req models.UpdateUserBackofficeRequest) error {
	user, err := s.repo.GetByEmail(email)
	if err != nil {
		return err
	}

	if req.Password != "" {
		hash, err := s.passwordProvider.Hash(req.Password)
		if err != nil {
			return errors.New("Erro ao processar a senha")
		}
		user.PasswordHash = hash
	}

	return s.repo.Update(user)
}

func (s *userBackofficeService) DeleteUser(email string) error {
	return s.repo.Delete(email)
}
