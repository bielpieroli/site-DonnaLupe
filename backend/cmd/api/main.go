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

	if err := database.AutoMigrate(&models.UserBackoffice{}, &models.Permission{}); err != nil {
		panic("Failed to migrate database: " + err.Error())
	}

	// Providers
	passwordProvider := providers.NewBcryptProvider()
	jwtProvider := providers.NewJWTProvider()

	// Repositories
	userBackofficeRepo := repository.NewUserBackofficeRepository(database)
	permissionRepo := repository.NewPermissionRepository(database)

	// Services
	userBackofficeService := services.NewUserBackofficeService(userBackofficeRepo, passwordProvider)
	permissionService := services.NewPermissionService(permissionRepo)
	authBackofficeService := services.NewAuthBackofficeService(userBackofficeRepo, passwordProvider, jwtProvider)

	// Handlers
	userBackofficeHandler := handlers.NewUserBackofficeHandler(userBackofficeService, permissionService)
	authBackofficeHandler := handlers.NewAuthBackofficeHandler(authBackofficeService, permissionService)
	permissionHandler := handlers.NewPermissionHandler(permissionService, userBackofficeService)

	// Inicializa admin padrão e suas permissões
	if _, err := userBackofficeService.InitializeAdmin(); err != nil {
		panic("Failed to initialize admin: " + err.Error())
	}
	if err := permissionService.InitializeAdminPermissions(); err != nil {
		panic("Failed to initialize admin permissions: " + err.Error())
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

	r.Run(":4000")
}
