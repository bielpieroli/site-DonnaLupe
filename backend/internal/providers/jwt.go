package providers

import (
	"errors"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

var ErrJWTSecretNotConfigured = errors.New("JWT secret not configured")

type BackofficeClaims struct {
	Email string `json:"email"`
	jwt.RegisteredClaims
}

type JWTProvider interface {
	GenerateToBackoffice(email string) (string, error)
	ParseToBackoffice(tokenStr string) (*BackofficeClaims, error)
}

type jwtProvider struct{}

func NewJWTProvider() JWTProvider {
	return &jwtProvider{}
}

func (p *jwtProvider) GenerateToBackoffice(email string) (string, error) {
	secret := os.Getenv("JWT_BACKOFFICE_SECRET")
	if secret == "" {
		return "", ErrJWTSecretNotConfigured
	}

	claims := BackofficeClaims{
		Email: email,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}

func (p *jwtProvider) ParseToBackoffice(tokenStr string) (*BackofficeClaims, error) {
	secret := os.Getenv("JWT_BACKOFFICE_SECRET")
	if secret == "" {
		return nil, ErrJWTSecretNotConfigured
	}

	token, err := jwt.ParseWithClaims(tokenStr, &BackofficeClaims{}, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("Método de assinatura inesperado")
		}
		return []byte(secret), nil
	})
	if err != nil || !token.Valid {
		return nil, errors.New("Token inválido ou expirado")
	}

	claims, ok := token.Claims.(*BackofficeClaims)
	if !ok {
		return nil, errors.New("Reivindicações de token inválidas")
	}
	return claims, nil
}
