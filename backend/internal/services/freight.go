package services

import (
	"backend/internal/models"
	"backend/internal/repository"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strings"
	"time"
)

// storeLat/storeLon são as coordenadas fixas da loja (São Carlos-SP).
const (
	storeLat = -22.006873
	storeLon = -47.897764
)

var externalClient = &http.Client{Timeout: 8 * time.Second}

type FreightService interface {
	GetAllRules() ([]models.FreightRule, error)
	CreateRule(input models.FreightRuleInput) (*models.FreightRule, error)
	UpdateRule(id uint, input models.FreightRuleInput) (*models.FreightRule, error)
	DeleteRule(id uint) error
	CalculateFreight(cep string) (*models.FreightQuoteResponse, error)
}

type freightService struct{ repo repository.FreightRepository }

func NewFreightService(repo repository.FreightRepository) FreightService {
	return &freightService{repo: repo}
}

func (s *freightService) GetAllRules() ([]models.FreightRule, error) {
	return s.repo.GetAll()
}

func (s *freightService) CreateRule(input models.FreightRuleInput) (*models.FreightRule, error) {
	rule := &models.FreightRule{
		MaxDistanceKm: input.MaxDistanceKm,
		PriceReais:    input.PriceReais,
	}
	if err := s.repo.Create(rule); err != nil {
		return nil, err
	}
	return rule, nil
}

func (s *freightService) UpdateRule(id uint, input models.FreightRuleInput) (*models.FreightRule, error) {
	rule, err := s.repo.GetByID(id)
	if err != nil {
		return nil, err
	}
	rule.MaxDistanceKm = input.MaxDistanceKm
	rule.PriceReais = input.PriceReais
	if err := s.repo.Update(rule); err != nil {
		return nil, err
	}
	return rule, nil
}

func (s *freightService) DeleteRule(id uint) error {
	return s.repo.Delete(id)
}

func (s *freightService) CalculateFreight(cep string) (*models.FreightQuoteResponse, error) {
	data, err := fetchCEPData(cep)
	if err != nil {
		return nil, err
	}

	distanceKm, err := routeDistanceKm(storeLat, storeLon, data.Lat, data.Lon)
	if err != nil {
		return nil, err
	}

	rule, err := s.repo.FindRuleForDistance(distanceKm)
	if err != nil {
		if errors.Is(err, repository.ErrNoFreightRuleForDistance) {
			return nil, errors.New("endereço fora da área de entrega configurada")
		}
		return nil, err
	}

	return &models.FreightQuoteResponse{
		DistanceKm:    distanceKm,
		PriceReais:    rule.PriceReais,
		MaxDistanceKm: rule.MaxDistanceKm,
	}, nil
}

// ── ViaCEP + coordenadas por cidade ──────────────────────────────────────────

// CEPData reúne coordenadas e dados de endereço.
// Disponível para outros serviços no mesmo pacote (ex: checkout).
type CEPData struct {
	Lat    float64
	Lon    float64
	Street string
	City   string
	State  string
}

type viaCEPResponse struct {
	Logradouro string `json:"logradouro"`
	Localidade string `json:"localidade"`
	UF         string `json:"uf"`
	Erro       bool   `json:"erro"`
}

// cityCoords mapeia "cidade|UF" (minúsculas) às coordenadas do centro da cidade.
// Adicione novas cidades conforme a área de entrega se expandir.
// ViaCEP sempre retorna os nomes de cidades com acentuação canônica.
var cityCoords = map[string][2]float64{
	"são carlos|sp":      {-22.0176, -47.8927},
	"ibaté|sp":           {-21.9590, -47.9825},
	"araraquara|sp":      {-21.7946, -48.1767},
	"ribeirão bonito|sp": {-22.0685, -48.1793},
}

func cleanCEP(cep string) (string, error) {
	var b strings.Builder
	b.Grow(8)
	for _, c := range cep {
		if c >= '0' && c <= '9' {
			b.WriteRune(c)
		}
	}
	if b.Len() != 8 {
		return "", errors.New("CEP inválido — informe 8 dígitos")
	}
	return b.String(), nil
}

// fetchCEPData valida o CEP via ViaCEP e resolve as coordenadas pelo nome da cidade.
// Disponível para outros serviços no mesmo pacote (ex: checkout).
func fetchCEPData(cep string) (*CEPData, error) {
	clean, err := cleanCEP(cep)
	if err != nil {
		return nil, err
	}

	ctx, cancel := context.WithTimeout(context.Background(), 8*time.Second)
	defer cancel()

	req, err := http.NewRequestWithContext(ctx, http.MethodGet,
		fmt.Sprintf("https://viacep.com.br/ws/%s/json/", clean), nil)
	if err != nil {
		return nil, fmt.Errorf("erro ao criar requisição ViaCEP: %w", err)
	}

	resp, err := externalClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("erro ao consultar ViaCEP: %w", err)
	}
	defer resp.Body.Close()

	var result viaCEPResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, errors.New("resposta inválida do ViaCEP")
	}
	if result.Erro {
		return nil, errors.New("CEP não encontrado — verifique o número informado")
	}

	key := strings.ToLower(result.Localidade) + "|" + strings.ToLower(result.UF)
	coords, ok := cityCoords[key]
	if !ok {
		return nil, fmt.Errorf("cidade %s-%s fora da área de entrega", result.Localidade, result.UF)
	}

	return &CEPData{
		Lat:    coords[0],
		Lon:    coords[1],
		Street: result.Logradouro,
		City:   result.Localidade,
		State:  result.UF,
	}, nil
}

// ── OSRM routing ──────────────────────────────────────────────────────────────

type osrmResponse struct {
	Code   string `json:"code"`
	Routes []struct {
		Distance float64 `json:"distance"` // metros
	} `json:"routes"`
}

func routeDistanceKm(fromLat, fromLon, toLat, toLon float64) (float64, error) {
	// OSRM usa longitude antes de latitude.
	reqURL := fmt.Sprintf(
		"http://router.project-osrm.org/route/v1/driving/%f,%f;%f,%f?overview=false&steps=false",
		fromLon, fromLat, toLon, toLat,
	)

	ctx, cancel := context.WithTimeout(context.Background(), 8*time.Second)
	defer cancel()

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, reqURL, nil)
	if err != nil {
		return 0, fmt.Errorf("erro ao criar requisição OSRM: %w", err)
	}

	resp, err := externalClient.Do(req)
	if err != nil {
		return 0, fmt.Errorf("erro ao consultar OSRM: %w", err)
	}
	defer resp.Body.Close()

	var result osrmResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return 0, errors.New("resposta inválida do OSRM")
	}
	if result.Code != "Ok" || len(result.Routes) == 0 {
		return 0, errors.New("não foi possível calcular a rota para o endereço informado")
	}

	return result.Routes[0].Distance / 1000.0, nil
}
