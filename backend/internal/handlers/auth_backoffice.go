package handlers

import (
	"backend/internal/models"
	"backend/internal/services"
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

var validate = validator.New()

type AuthBackofficeHandler struct {
	authService services.AuthBackofficeService
	permService services.PermissionService
}

func NewAuthBackofficeHandler(authService services.AuthBackofficeService, permService services.PermissionService) *AuthBackofficeHandler {
	return &AuthBackofficeHandler{authService: authService, permService: permService}
}

// Login godoc
// @Summary      Login backoffice
// @Description  Autentica um usuário do backoffice e retorna token JWT com permissões
// @Tags         auth
// @Accept       json
// @Produce      json
// @Param        request  body      models.LoginUserBackofficeRequest  true  "Credenciais de acesso"
// @Success      200      {object}  map[string]interface{}
// @Failure      400      {object}  map[string]interface{}
// @Failure      401      {object}  map[string]interface{}
// @Failure      500      {object}  map[string]interface{}
// @Router       /admin/auth/login [post]
func (h *AuthBackofficeHandler) Login(c *gin.Context) {
	var req models.LoginUserBackofficeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "Requisição inválida: " + err.Error()})
		return
	}

	if err := validate.Struct(req); err != nil {
		var ve validator.ValidationErrors
		errors.As(err, &ve)
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "Requisição inválida: " + err.Error()})
		return
	}

	user, token, err := h.authService.Login(req)
	if err != nil {
		if errors.Is(err, services.ErrInvalidCredentials) {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Email ou senha inválidos"})
			return
		}
		if err.Error() == "Falha na geração do token" {
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "Falha na geração do token"})
			return
		}
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}

	perms, err := h.permService.GetFullPermissions(user.Email)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar permissões"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":     "Login realizado",
		"user":        models.ToSafeUserBackoffice(user),
		"token":       token,
		"permissions": perms,
	})
}
