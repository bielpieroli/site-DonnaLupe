package handlers

import (
	"backend/internal/models"
	"backend/internal/repository"
	"backend/internal/services"
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

type ProductHandler struct {
	service services.ProductService
}

func NewProductHandler(service services.ProductService) *ProductHandler {
	return &ProductHandler{service: service}
}

// GetAll godoc
// @Summary      Lista produtos ativos
// @Tags         products
// @Produce      json
// @Success      200 {object} map[string]interface{}
// @Router       /products [get]
func (h *ProductHandler) GetAll(c *gin.Context) {
	products, err := h.service.GetActive()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar produtos"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"products": products})
}

// GetByName godoc
// @Summary      Detalhes de um produto ativo
// @Tags         products
// @Produce      json
// @Param        name path string true "Nome do produto"
// @Success      200 {object} map[string]interface{}
// @Failure      404 {object} map[string]interface{}
// @Router       /products/{name} [get]
func (h *ProductHandler) GetByName(c *gin.Context) {
	product, err := h.service.GetActiveByName(c.Param("name"))
	if err != nil {
		if errors.Is(err, repository.ErrProductNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Produto não encontrado"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar produto"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"product": product})
}

// Create godoc
// @Summary      Cria um produto
// @Tags         products
// @Security     BearerAuth
// @Accept       multipart/form-data
// @Produce      json
// @Success      201 {object} map[string]interface{}
// @Router       /admin/products [post]
func (h *ProductHandler) Create(c *gin.Context) {
	input, hasImage, err := productInputFromMultipart(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if !hasImage {
		c.JSON(http.StatusBadRequest, gin.H{"error": "imagem é obrigatória"})
		return
	}
	product, err := h.service.Create(input)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"product": product})
}

// Update godoc
// @Summary      Atualiza um produto
// @Tags         products
// @Security     BearerAuth
// @Accept       multipart/form-data
// @Produce      json
// @Param        name path string true "Nome atual do produto"
// @Success      200 {object} map[string]interface{}
// @Router       /admin/products/{name} [put]
func (h *ProductHandler) Update(c *gin.Context) {
	input, hasImage, err := productInputFromMultipart(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	product, err := h.service.Update(c.Param("name"), input, hasImage)
	if err != nil {
		if errors.Is(err, repository.ErrProductNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Produto não encontrado"})
			return
		}
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"product": product})
}

// Delete godoc
// @Summary      Desativa um produto
// @Tags         products
// @Security     BearerAuth
// @Param        name path string true "Nome do produto"
// @Success      200 {object} map[string]interface{}
// @Router       /admin/products/{name} [delete]
func (h *ProductHandler) Delete(c *gin.Context) {
	if err := h.service.Deactivate(c.Param("name")); err != nil {
		if errors.Is(err, repository.ErrProductNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Produto não encontrado"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao desativar produto"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Produto desativado com sucesso"})
}

func productInputFromMultipart(c *gin.Context) (models.ProductInput, bool, error) {
	price, err := strconv.ParseFloat(c.PostForm("price"), 64)
	if err != nil {
		return models.ProductInput{}, false, errors.New("preço inválido")
	}
	stock, err := strconv.Atoi(c.PostForm("stock"))
	if err != nil {
		return models.ProductInput{}, false, errors.New("estoque inválido")
	}

	input := models.ProductInput{
		Name:        c.PostForm("name"),
		Subtitle:    c.PostForm("subtitle"),
		Category:    c.PostForm("category"),
		Description: c.PostForm("description"),
		ImageFile:   c.PostForm("imageFile"),
		Price:       price,
		Weight:      c.PostForm("weight"),
		Ingredients: parseIngredientsForm(c.PostForm("ingredients")),
		Allergens:   c.PostForm("allergens"),
		Badge:       c.PostForm("badge"),
		Stock:       stock,
		Status:      c.PostForm("status"),
	}

	file, err := c.FormFile("img")
	if err != nil {
		if errors.Is(err, http.ErrMissingFile) {
			return input, false, nil
		}
		return models.ProductInput{}, false, errors.New("imagem inválida")
	}

	src, err := file.Open()
	if err != nil {
		return models.ProductInput{}, false, errors.New("erro ao abrir imagem")
	}
	defer src.Close()

	bytes, err := io.ReadAll(src)
	if err != nil {
		return models.ProductInput{}, false, errors.New("erro ao ler imagem")
	}
	input.Img = bytes
	return input, true, nil
}

func parseIngredientsForm(raw string) []string {
	raw = strings.TrimSpace(raw)
	if raw == "" {
		return nil
	}

	var fromJSON []string
	if err := json.Unmarshal([]byte(raw), &fromJSON); err == nil {
		return fromJSON
	}

	fields := strings.FieldsFunc(raw, func(r rune) bool {
		return r == ',' || r == '\n' || r == ';'
	})
	result := make([]string, 0, len(fields))
	for _, field := range fields {
		field = strings.TrimSpace(field)
		if field != "" {
			result = append(result, field)
		}
	}
	return result
}
