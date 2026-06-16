package middleware

import (
	"backend/internal/models"
	"backend/internal/services"
	"net/http"

	"github.com/gin-gonic/gin"
)

// RequirePermission checks that the authenticated user holds at least the
// required level for the given resource. Must run after AuthBackofficeMiddleware.
func RequirePermission(permSvc services.PermissionService, resource string, required models.PermissionLevel) gin.HandlerFunc {
	return func(c *gin.Context) {
		email, exists := c.Get("email")
		if !exists {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Não autenticado"})
			return
		}

		ok, err := permSvc.CheckPermission(email.(string), resource, required)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "Erro ao verificar permissões"})
			return
		}
		if !ok {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "Permissão insuficiente para o recurso '" + resource + "'"})
			return
		}

		c.Next()
	}
}
