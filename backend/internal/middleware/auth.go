package middleware

import (
	"backend/internal/providers"
	"errors"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

func AuthBackofficeMiddleware(jwtProvider providers.JWTProvider) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Header de autorização é obrigatório"})
			return
		}
		if !strings.HasPrefix(authHeader, "Bearer ") {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Formato inválido para o header de autorização"})
			return
		}

		tokenStr := strings.TrimPrefix(authHeader, "Bearer ")
		claims, err := jwtProvider.ParseToBackoffice(tokenStr)
		if err != nil {
			if errors.Is(err, providers.ErrJWTSecretNotConfigured) {
				c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "Geração de token não configurada"})
				return
			}
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Token inválido ou expirado"})
			return
		}

		c.Set("email", claims.Email)
		c.Next()
	}
}
