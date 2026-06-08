package providers

import (
	"errors"

	"golang.org/x/crypto/bcrypt"
)

type PasswordProvider interface {
	Hash(password string) (string, error)
	Compare(hash, password string) error
}

type bcryptProvider struct{}

func NewBcryptProvider() PasswordProvider {
	return &bcryptProvider{}
}

func (p *bcryptProvider) Hash(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(bytes), nil
}

func (p *bcryptProvider) Compare(hash, password string) error {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	if err != nil {
		return errors.New("Senha incorreta")
	}
	return nil
}
