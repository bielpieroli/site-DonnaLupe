package services

import (
	"backend/internal/models"
	"backend/internal/providers"
	"backend/internal/repository"
	"errors"

	"gorm.io/gorm"
)

var (
	ErrInvalidCredentials = errors.New("E-mail ou senha inválidos")
)

type AuthBackofficeService interface {
	Login(req models.LoginUserBackofficeRequest) (*models.UserBackoffice, string, error)
}

type authBackofficeService struct {
	repo             repository.UserBackofficeRepository
	passwordProvider providers.PasswordProvider
	jwtProvider      providers.JWTProvider
}

func NewAuthBackofficeService(repo repository.UserBackofficeRepository, passwordProvider providers.PasswordProvider, jwtProvider providers.JWTProvider) AuthBackofficeService {
	return &authBackofficeService{repo: repo, passwordProvider: passwordProvider, jwtProvider: jwtProvider}
}

func (s *authBackofficeService) Login(req models.LoginUserBackofficeRequest) (*models.UserBackoffice, string, error) {
	user, err := s.repo.GetByEmail(req.Email)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) || errors.Is(err, repository.ErrUserBackofficeNotFound) {
			return nil, "", ErrInvalidCredentials
		}
		return nil, "", errors.New("Erro interno do servidor")
	}

	if err := s.passwordProvider.Compare(user.PasswordHash, req.Password); err != nil {
		return nil, "", ErrInvalidCredentials
	}

	token, err := s.jwtProvider.GenerateToBackoffice(user.Email)
	if err != nil {
		return nil, "", errors.New("Falha na geração do token")
	}

	return user, token, nil
}
