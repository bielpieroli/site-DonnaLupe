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
}

func NewAuthBackofficeHandler(authService services.AuthBackofficeService) *AuthBackofficeHandler {
	return &AuthBackofficeHandler{authService: authService}
}

// Login godoc
// @Summary      Login backoffice
// @Description  Autentica um usuário do backoffice e retorna um token JWT
// @Tags         auth
// @Accept       json
// @Produce      json
// @Param        request  body      models.LoginUserBackofficeRequest  true  "Credenciais de acesso"
// @Success      200      {object}  map[string]interface{}             "Login realizado com sucesso"
// @Failure      400      {object}  map[string]interface{}             "Requisição inválida"
// @Failure      401      {object}  map[string]interface{}             "Credenciais inválidas"
// @Failure      500      {object}  map[string]interface{}             "Erro interno"
// @Router       /admin/login [post]
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
		if err.Error() == "token generation failed" {
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "Falha na geração do token"})
			return
		}
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "Error interno do servidor"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Login realizado",
		"user":    models.ToSafeUserBackoffice(user),
		"token":   token,
	})
}
