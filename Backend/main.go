package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

// Config struct
type Config struct {
	Port  string
	AIKey string
}

// Request/Response structs
type SummarizeRequest struct {
	Transcript string `json:"transcript"`
	Prompt     string `json:"prompt"`
}

type GeminiResponse struct {
	Candidates []struct {
		Content struct {
			Parts []struct {
				Text string `json:"text"`
			} `json:"parts"`
		} `json:"content"`
	} `json:"candidates"`
}

// Config functions
func loadConfig() Config {
	_ = godotenv.Load()

	cfg := Config{
		Port:  getEnv("PORT", "8080"),
		AIKey: getEnv("AI_API_KEY", ""),
	}

	if cfg.AIKey == "" {
		log.Println("Warning: AI_API_KEY not set")
	}
	return cfg
}

func getEnv(key, fallback string) string {
	if val, ok := os.LookupEnv(key); ok {
		return val
	}
	return fallback
}

// Handler function
func summarizeHandler(c *gin.Context) {
	var req SummarizeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	apiKey := os.Getenv("AI_API_KEY")
	if apiKey == "" {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "AI_API_KEY not set"})
		return
	}

	body := map[string]interface{}{
		"contents": []map[string]interface{}{
			{
				"parts": []map[string]string{
					{"text": fmt.Sprintf("Transcript: %s\n\nInstruction: %s", req.Transcript, req.Prompt)},
				},
			},
		},
	}

	jsonBody, _ := json.Marshal(body)

	url := "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + apiKey

	resp, err := http.Post(url, "application/json", bytes.NewBuffer(jsonBody))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to call Gemini API"})
		return
	}
	defer resp.Body.Close()

	bodyBytes, _ := ioutil.ReadAll(resp.Body)

	fmt.Println("Gemini raw response:", string(bodyBytes))

	var geminiResp GeminiResponse
	if err := json.Unmarshal(bodyBytes, &geminiResp); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid response from Gemini"})
		return
	}

	summary := "No summary generated"
	if len(geminiResp.Candidates) > 0 &&
		len(geminiResp.Candidates[0].Content.Parts) > 0 {
		summary = geminiResp.Candidates[0].Content.Parts[0].Text
	}

	c.JSON(http.StatusOK, gin.H{"summary": summary})
}

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}
	cfg := loadConfig()
	r := gin.Default()
	corsConfig := cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Length", "Content-Type", "Authorization", "Accept", "X-Requested-With"},
		AllowCredentials: true,
	}
	r.Use(cors.New(corsConfig))
	r.POST("/summarize", summarizeHandler)
	fmt.Printf("Server running at http://localhost:%s\n", cfg.Port)
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatal(err)
	}
}