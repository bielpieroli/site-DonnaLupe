package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// CORSMiddleware sets CORS headers for listed origins and short-circuits OPTIONS preflights.
// This replaces gin-contrib/cors to avoid its preflight rejection behaviour in Docker environments.
func CORSMiddleware(allowedOrigins ...string) gin.HandlerFunc {
	originSet := make(map[string]struct{}, len(allowedOrigins))
	for _, o := range allowedOrigins {
		originSet[o] = struct{}{}
	}

	return func(c *gin.Context) {
		origin := c.GetHeader("Origin")

		if _, ok := originSet[origin]; ok {
			c.Header("Access-Control-Allow-Origin", origin)
			c.Header("Access-Control-Allow-Credentials", "true")
			c.Header("Vary", "Origin")
		}

		if c.Request.Method == http.MethodOptions {
			c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH")
			c.Header("Access-Control-Allow-Headers", "Origin, Content-Type, Authorization, Accept")
			c.Header("Access-Control-Max-Age", "43200")
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	}
}
