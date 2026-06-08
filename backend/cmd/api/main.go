package main

import (
	"backend/internal/db"
	"backend/internal/handlers"
	"backend/internal/middleware"
	"backend/internal/models"
	"backend/internal/providers"
	"backend/internal/repository"
	"backend/internal/services"

	_ "backend/docs"

	"github.com/gin-contrib/cors"
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

	if err := database.AutoMigrate(&models.UserBackoffice{}); err != nil {
		panic("Failed to migrate database: " + err.Error())
	}

	// Providers
	passwordProvider := providers.NewBcryptProvider()
	jwtProvider := providers.NewJWTProvider()

	// Backoffice users
	userBackofficeRepo := repository.NewUserBackofficeRepository(database)
	userBackofficeService := services.NewUserBackofficeService(userBackofficeRepo, passwordProvider)
	userBackofficeHandler := handlers.NewUserBackofficeHandler(userBackofficeService)

	// Auth backoffice
	authBackofficeService := services.NewAuthBackofficeService(userBackofficeRepo, passwordProvider, jwtProvider)
	authBackofficeHandler := handlers.NewAuthBackofficeHandler(authBackofficeService)

	// Inicializa admin padrão do .env
	if err := userBackofficeService.InitializeAdmin(); err != nil {
		panic("Failed to initialize admin: " + err.Error())
	}

	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173", "http://localhost:5174"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
		ExposeHeaders:    []string{"Content-Length"},
	}))

	// Swagger
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	// Rotas públicas
	admin := r.Group("/admin")
	admin.POST("/login", authBackofficeHandler.Login)

	// Rotas protegidas
	backoffice := admin.Group("/")
	backoffice.Use(middleware.AuthBackofficeMiddleware(jwtProvider))

	backoffice.POST("/usersBackoffice", userBackofficeHandler.CreateUser)
	backoffice.GET("/usersBackoffice", userBackofficeHandler.GetAllUsers)
	backoffice.GET("/usersBackoffice/:email", userBackofficeHandler.GetUserByEmail)
	backoffice.PUT("/usersBackoffice/:email", userBackofficeHandler.UpdateUser)
	backoffice.DELETE("/usersBackoffice/:email", userBackofficeHandler.DeleteUser)

	r.Run(":4000")
}