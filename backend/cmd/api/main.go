package main

import (
	"os"
	"time"

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

	// Remove constraints legadas do campo preference_id (substituído por payment_id PIX).
	// AutoMigrate não remove colunas nem constraints; fazemos manualmente antes de migrar.
	database.Exec("DROP INDEX IF EXISTS idx_orders_preference_id")
	database.Exec("ALTER TABLE orders ALTER COLUMN preference_id DROP NOT NULL")

	if err := database.AutoMigrate(
		&models.UserBackoffice{},
		&models.Permission{},
		&models.FreightRule{},
		&models.Order{},
		&models.LandingContent{},
		&models.Product{},
		&models.PageContent{},
		&models.Ingredient{},
		&models.ProductIngredient{},
	); err != nil {
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
	productRepo := repository.NewProductRepository(database)
	pageContentRepo := repository.NewPageContentRepository(database)
	ingredientRepo := repository.NewIngredientRepository(database)

	// Services
	emailService := services.NewEmailService()
	userBackofficeService := services.NewUserBackofficeService(userBackofficeRepo, passwordProvider)
	permissionService := services.NewPermissionService(permissionRepo)
	authBackofficeService := services.NewAuthBackofficeService(userBackofficeRepo, passwordProvider, jwtProvider)
	freightService := services.NewFreightService(freightRepo)
	orderService := services.NewOrderService(orderRepo, emailService)
	landingService := services.NewLandingService(landingRepo)
	productService := services.NewProductService(productRepo)
	pageContentService := services.NewPageContentService(pageContentRepo)
	ingredientService := services.NewIngredientService(ingredientRepo)

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
	productHandler := handlers.NewProductHandler(productService)
	pageContentHandler := handlers.NewPageContentHandler(pageContentService)
	ingredientHandler := handlers.NewIngredientHandler(ingredientService)

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
	if err := productService.InitializeDefaults(); err != nil {
		panic("Failed to initialize products: " + err.Error())
	}
	if err := pageContentService.InitializeDefaults(); err != nil {
		panic("Failed to initialize page contents: " + err.Error())
	}

	// Cancela automaticamente pedidos PIX não pagos após 6 minutos
	go func() {
		ticker := time.NewTicker(2 * time.Minute)
		defer ticker.Stop()
		for range ticker.C {
			orderService.CancelStaleOrders(6 * time.Minute) //nolint:errcheck
		}
	}()

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

	// Rotas públicas de autenticação
	auth := r.Group("/admin/auth")
	auth.POST("/login", authBackofficeHandler.Login)
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

	// Checkout PIX — rota pública
	r.POST("/checkout/pix", checkoutHandler.CreatePixPayment)
	r.GET("/checkout/pix/:payment_id/status", orderHandler.GetPixStatus)

	// Frete — rota pública de cotação
	r.POST("/freight/quote", freightHandler.Quote)

	// Landing page — conteúdo público
	r.GET("/landing", landingHandler.GetPublic)

	// Produtos — catálogo público
	r.GET("/products", productHandler.GetPublic)

	// Conteúdos das páginas públicas
	r.GET("/page-contents/:page", pageContentHandler.GetPublic)

	// Frete — gestão (backoffice)
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
	orders.PUT("/:id/confirm-payment", permMW("orders", models.PermWrite), orderHandler.ConfirmPayment)
	orders.POST("/:id/refund", permMW("orders", models.PermWrite), orderHandler.Refund)
	orders.PUT("/:id/completed", permMW("orders", models.PermWrite), orderHandler.SetCompleted)

	// Landing page (backoffice)
	landing := admin.Group("/landing")
	landing.GET("", permMW("landing", models.PermRead), landingHandler.GetAll)
	landing.POST("", permMW("landing", models.PermWrite), landingHandler.Create)
	landing.PUT("/:id", permMW("landing", models.PermWrite), landingHandler.Update)
	landing.DELETE("/:id", permMW("landing", models.PermWrite), landingHandler.Delete)

	// Produtos (backoffice)
	products := admin.Group("/products")
	products.GET("", permMW("products", models.PermRead), productHandler.GetAll)
	products.POST("", permMW("products", models.PermWrite), productHandler.Create)
	products.PUT("/:id", permMW("products", models.PermWrite), productHandler.Update)
	products.DELETE("/:id", permMW("products", models.PermWrite), productHandler.Delete)

	// Conteúdos das páginas (backoffice)
	pageContents := admin.Group("/page-contents")
	pageContents.GET("", permMW("content", models.PermRead), pageContentHandler.GetAll)
	pageContents.POST("", permMW("content", models.PermWrite), pageContentHandler.Create)
	pageContents.PUT("/:id", permMW("content", models.PermWrite), pageContentHandler.Update)
	pageContents.DELETE("/:id", permMW("content", models.PermWrite), pageContentHandler.Delete)

	// Ingredientes (backoffice)
	ingredients := admin.Group("/ingredients")
	ingredients.GET("", permMW("ingredients", models.PermRead), ingredientHandler.GetAll)
	ingredients.POST("", permMW("ingredients", models.PermWrite), ingredientHandler.Create)
	ingredients.PUT("/:name", permMW("ingredients", models.PermWrite), ingredientHandler.Update)
	ingredients.DELETE("/:name", permMW("ingredients", models.PermWrite), ingredientHandler.Delete)

	// Webhook público do Mercado Pago
	r.POST("/webhook/mp", orderHandler.Webhook)

	r.Run(":4000")
}