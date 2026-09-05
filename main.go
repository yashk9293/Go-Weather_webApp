package main

import (
	"embed"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	neturl "net/url"
	"os"

	"github.com/joho/godotenv"
)

//go:embed index.html index.js style.css setdates.js images/*
var content embed.FS

var (
	weatherAPIKey  string
	dateAPIKey     string
	unsplashAPIKey string
)

func init() {
	// Use _ to ignore error; if .env is missing (like in prod), it just skips
	_ = godotenv.Load(".env")
}

type WeatherResponse struct {
	Name string `json:"name"`
	Main struct {
		Temp      float64 `json:"temp"`
		FeelsLike float64 `json:"feels_like"`
		Humidity  int     `json:"humidity"`
		Pressure  int     `json:"pressure"`
	} `json:"main"`
	Wind struct {
		Speed float64 `json:"speed"`
	} `json:"wind"`
	Weather []struct {
		Main        string `json:"main"`
		Description string `json:"description"`
	} `json:"weather"`
	Sys struct {
		Country string `json:"country"`
	} `json:"sys"`
}

type DateResponse struct {
	Location struct {
		Localtime string `json:"localtime"`
	} `json:"location"`
}

type UnsplashResponse struct {
	Urls struct {
		Regular string `json:"regular"`
	} `json:"urls"`
}

func enableCORS(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
}

// forwardUpstreamError relays a non-200 from an upstream provider using the
// same status code, so the frontend can distinguish a bad city (404) from a
// provider outage. Returns true when the response was an error.
func forwardUpstreamError(w http.ResponseWriter, resp *http.Response, what string) bool {
	if resp.StatusCode == http.StatusOK {
		return false
	}
	status := resp.StatusCode
	if status < 400 || status > 599 {
		status = http.StatusBadGateway
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(map[string]string{"error": what})
	return true
}

func weatherHandler(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)
	city := r.URL.Query().Get("city")
	if city == "" {
		http.Error(w, "City is required", http.StatusBadRequest)
		return
	}
	url := fmt.Sprintf("https://api.openweathermap.org/data/2.5/weather?q=%s&units=metric&appid=%s", neturl.QueryEscape(city), weatherAPIKey)
	resp, err := http.Get(url)
	if err != nil {
		http.Error(w, "Error fetching weather", http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()
	if forwardUpstreamError(w, resp, "city not found") {
		return
	}
	var data WeatherResponse
	json.NewDecoder(resp.Body).Decode(&data)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(data)
}

func dateHandler(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)
	city := r.URL.Query().Get("city")
	if city == "" {
		http.Error(w, "City is required", http.StatusBadRequest)
		return
	}
	url := fmt.Sprintf("https://api.weatherapi.com/v1/current.json?key=%s&q=%s", dateAPIKey, neturl.QueryEscape(city))
	resp, err := http.Get(url)
	if err != nil {
		http.Error(w, "Error fetching date", http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()
	if forwardUpstreamError(w, resp, "local time unavailable") {
		return
	}
	var data DateResponse
	json.NewDecoder(resp.Body).Decode(&data)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(data)
}

func imageHandler(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)
	city := r.URL.Query().Get("city")
	url := fmt.Sprintf("https://api.unsplash.com/photos/random?query=%s&client_id=%s", neturl.QueryEscape(city), unsplashAPIKey)
	resp, err := http.Get(url)
	if err != nil {
		http.Error(w, "Error fetching image", http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()
	if forwardUpstreamError(w, resp, "image unavailable") {
		return
	}
	var data UnsplashResponse
	if err := json.NewDecoder(resp.Body).Decode(&data); err != nil {
		http.Error(w, "Error decoding image data", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(data)
}

func main() {
	weatherAPIKey = os.Getenv("WEATHER_API_KEY")
	dateAPIKey = os.Getenv("DATE_API_KEY")
	unsplashAPIKey = os.Getenv("UNSPLASH_ACCESS_KEY")

	fileServer := http.FileServer(http.FS(content))

	// API Routes
	http.HandleFunc("/weather", weatherHandler)
	http.HandleFunc("/date", dateHandler)
	http.HandleFunc("/image", imageHandler)

	// Serve static files for everything else
	http.Handle("/", fileServer)

	// Determine Port
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	fmt.Printf("Server running on port %s\n", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}
