package main

import (
	"encoding/json"
	"fmt"
	"net/http"
)

import ( 
	"os" 
	"log" 
	
	"github.com/joho/godotenv" 
) 


var weatherAPIKey string
var dateAPIKey string
var unsplashAPIKey string

func init() { 
	err := godotenv.Load(".env") 
	if err != nil { 
		log.Fatal("Error loading .env file") 
	} 
} 


// Structs
type WeatherResponse struct {
	Name string `json:"name"`
	Main struct {
		Temp     float64 `json:"temp"`
		Humidity int     `json:"humidity"`
	} `json:"main"`
	Wind struct {
		Speed float64 `json:"speed"`
	} `json:"wind"`
	Weather []struct {
		Main string `json:"main"`
	} `json:"weather"`
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

// Enable CORS
func enableCORS(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
}

// Weather Handler
func weatherHandler(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)

	city := r.URL.Query().Get("city")
	if city == "" {
		http.Error(w, "City is required", http.StatusBadRequest)
		return
	}

	url := fmt.Sprintf("https://api.openweathermap.org/data/2.5/weather?q=%s&units=metric&appid=%s", city, weatherAPIKey)

	resp, err := http.Get(url)
	if err != nil {
		http.Error(w, "Error fetching weather", http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	var data WeatherResponse
	json.NewDecoder(resp.Body).Decode(&data)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(data)
}

// Date Handler
func dateHandler(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)

	city := r.URL.Query().Get("city")
	if city == "" {
		http.Error(w, "City is required", http.StatusBadRequest)
		return
	}

	url := fmt.Sprintf("https://api.weatherapi.com/v1/current.json?key=%s&q=%s", dateAPIKey, city)

	resp, err := http.Get(url)
	if err != nil {
		http.Error(w, "Error fetching date", http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	var data DateResponse
	json.NewDecoder(resp.Body).Decode(&data)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(data)
}


// Image Handler
func imageHandler(w http.ResponseWriter, r *http.Request) {
    enableCORS(w)
    city := r.URL.Query().Get("city")
    
    // Construct the Unsplash URL
    url := fmt.Sprintf("https://api.unsplash.com/photos/random?query=%s&client_id=%s", city, unsplashAPIKey)

    resp, err := http.Get(url)
    if err != nil {
        http.Error(w, "Error fetching image", http.StatusInternalServerError)
        return
    }
    defer resp.Body.Close()

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

	http.HandleFunc("/weather", weatherHandler)
	http.HandleFunc("/date", dateHandler)
	http.HandleFunc("/image", imageHandler)

	fmt.Println("Server running on http://localhost:8080")
	http.ListenAndServe(":8080", nil)
}