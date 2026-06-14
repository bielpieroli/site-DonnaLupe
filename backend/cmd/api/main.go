package main

import (
	"os"

	"backend/internal/db"
	"backend/internal/handlers"
	"backend/internal/middleware"
	"backend/internal/models"
	"backend/internal/providers"
	"backend/internal/repository"
	"backend/internal/services"

	_ "backend/docs"

	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

// @title           Donna Lupe Site API
// @version         1.0
// @description     API do Site da Donna Lupe
// @host            localhost:4000
// @BasePath        /

// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
func main() {
	database, errDB := db.ConnectDB()
	if errDB != nil {
		panic("Failed to connect to database: " + errDB.Error())
	}

	if err := database.AutoMigrate(&models.UserBackoffice{}, &models.Permission{}, &models.FreightRule{}, &models.Order{}, &models.LandingContent{}); err != nil {
		panic("Failed to migrate database: " + err.Error())
	}

	// Providers
	passwordProvider := providers.NewBcryptProvider()
	jwtProvider := providers.NewJWTProvider()

	// Repositories
	userBackofficeRepo := repository.NewUserBackofficeRepository(database)
	permissionRepo := repository.NewPermissionRepository(database)
	freightRepo := repository.NewFreightRepository(database)
	orderRepo := repository.NewOrderRepository(database)
	landingRepo := repository.NewLandingRepository(database)

	// Services
	userBackofficeService := services.NewUserBackofficeService(userBackofficeRepo, passwordProvider)
	permissionService := services.NewPermissionService(permissionRepo)
	authBackofficeService := services.NewAuthBackofficeService(userBackofficeRepo, passwordProvider, jwtProvider)
	freightService := services.NewFreightService(freightRepo)
	orderService := services.NewOrderService(orderRepo)
	landingService := services.NewLandingService(landingRepo)

	checkoutService, err := services.NewCheckoutService(orderService)
	if err != nil {
		panic("Checkout service: " + err.Error())
	}

	// Handlers
	userBackofficeHandler := handlers.NewUserBackofficeHandler(userBackofficeService, permissionService)
	authBackofficeHandler := handlers.NewAuthBackofficeHandler(authBackofficeService, permissionService)
	permissionHandler := handlers.NewPermissionHandler(permissionService, userBackofficeService)
	freightHandler := handlers.NewFreightHandler(freightService)
	checkoutHandler := handlers.NewCheckoutHandler(checkoutService)
	orderHandler := handlers.NewOrderHandler(orderService, os.Getenv("MP_ACCESS_TOKEN"))
	landingHandler := handlers.NewLandingHandler(landingService)

	// Inicializa admin padrão e suas permissões
	if _, err := userBackofficeService.InitializeAdmin(); err != nil {
		panic("Failed to initialize admin: " + err.Error())
	}
	if err := permissionService.InitializeAdminPermissions(); err != nil {
		panic("Failed to initialize admin permissions: " + err.Error())
	}
	if err := landingService.InitializeDefaults(); err != nil {
		panic("Failed to initialize landing content: " + err.Error())
	}

	r := gin.Default()

	r.Use(middleware.CORSMiddleware(
		"http://localhost:5173",
		"http://localhost:5174",
	))

	// Swagger
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	authMW := middleware.AuthBackofficeMiddleware(jwtProvider)
	permMW := func(resource string, level models.PermissionLevel) gin.HandlerFunc {
		return middleware.RequirePermission(permissionService, resource, level)
	}

	// Rotas públicas
	auth := r.Group("/admin/auth")
	auth.POST("/login", authBackofficeHandler.Login)

	// Registro: requer autenticação + permissão de escrita em "users"
	auth.POST("/register", authMW, permMW("users", models.PermWrite), userBackofficeHandler.Register)

	// Rotas administrativas protegidas
	admin := r.Group("/admin")
	admin.Use(authMW)

	admin.GET("/users", permMW("users", models.PermRead), userBackofficeHandler.GetAllUsers)
	admin.GET("/users/:email", permMW("users", models.PermRead), userBackofficeHandler.GetUserByEmail)
	admin.PUT("/users/:email", permMW("users", models.PermWrite), userBackofficeHandler.UpdateUser)
	admin.DELETE("/users/:email", permMW("users", models.PermWrite), userBackofficeHandler.DeleteUser)

	admin.GET("/users/:email/permissions", permMW("permissions", models.PermRead), permissionHandler.GetPermissions)
	admin.PUT("/users/:email/permissions", permMW("permissions", models.PermWrite), permissionHandler.SetPermissions)

	// Checkout - rota pública de criação de preferência MP
	r.POST("/checkout/preference", checkoutHandler.CreatePreference)

	// Frete - rota pública de cotação
	r.POST("/freight/quote", freightHandler.Quote)

	// Landing page - conteúdo público
	r.GET("/landing", landingHandler.GetPublic)

	// Frete - gestão de preço de frete (backoffice)
	freight := admin.Group("/freight")
	freight.GET("/rules", permMW("freight", models.PermRead), freightHandler.GetRules)
	freight.POST("/rules", permMW("freight", models.PermWrite), freightHandler.CreateRule)
	freight.PUT("/rules/:id", permMW("freight", models.PermWrite), freightHandler.UpdateRule)
	freight.DELETE("/rules/:id", permMW("freight", models.PermWrite), freightHandler.DeleteRule)

	// Pedidos (backoffice)
	orders := admin.Group("/orders")
	orders.GET("", permMW("orders", models.PermRead), orderHandler.GetAll)
	orders.GET("/:id", permMW("orders", models.PermRead), orderHandler.GetByID)
	orders.PUT("/:id/delivery-status", permMW("orders", models.PermWrite), orderHandler.UpdateDeliveryStatus)

	// Landing page (backoffice)
	landing := admin.Group("/landing")
	landing.GET("", permMW("landing", models.PermRead), landingHandler.GetAll)
	landing.POST("", permMW("landing", models.PermWrite), landingHandler.Create)
	landing.PUT("/:id", permMW("landing", models.PermWrite), landingHandler.Update)
	landing.DELETE("/:id", permMW("landing", models.PermWrite), landingHandler.Delete)

	// Webhook público do Mercado Pago
	r.POST("/webhook/mp", orderHandler.Webhook)

	r.Run(":4000")
}
