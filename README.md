# 🌦️ Go Weather WebApp

A sleek, full-stack weather application built with a **Go (Golang)** backend and a **Vanilla JavaScript** frontend. This app provides real-time weather data, local time for searched cities, and dynamically changes the background image based on the location using the Unsplash API.

Live Demo : https://go-weather-webapp-2.onrender.com

<img alt="Image" src="https://github.com/user-attachments/assets/9bc83195-d40c-4474-9231-4756a1055360" />

<br/>

---

<img alt="Image" src="https://github.com/user-attachments/assets/c4cf1ff3-0cfa-4f5c-bce5-e194e60ff2b3" />

---

## 🚀 Features

* **Real-time Weather:** Get temperature, humidity, and wind speed via OpenWeatherMap.
* **Local Time:** Displays the current local time of the searched city.
* **Dynamic Backgrounds:** Automatically fetches high-quality city-specific images from Unsplash.
* **Secure Backend:** All API keys are hidden on the server-side using a Go proxy to prevent exposure in the browser.
* **CORS Enabled:** Seamless communication between the frontend and backend.

---

## 🛠️ Tech Stack

| Component | Technology |
| :--- | :--- |
| **Backend** | Go (Golang) |
| **Frontend** | HTML5, CSS3, JavaScript (ES6+) |
| **APIs** | OpenWeatherMap, WeatherAPI, Unsplash |
| **Environment** | `joho/godotenv` for secret management |

---
## 📁 Project Structure

```
Go-Weather-webapp/
│
├── backend/
│   ├── main.go
│   ├── go.mod
│   ├── go.sum
│   ├── .env (ignored)
│   └── .gitignore
├── index.html
├── index.js
├── setdates.js
├── style.css
├── images/
└── README.md
```

## 📦 Setup & Installation

### 1. Prerequisites
* [Go](https://go.dev/doc/install) installed on your machine.
* API Keys from:
    * [OpenWeatherMap](https://openweathermap.org/api)
    * [WeatherAPI](https://www.weatherapi.com/)
    * [Unsplash Developers](https://unsplash.com/developers)

### 2. Environment Configuration
Navigate to the `backend` folder and create a `.env` file:

```env
WEATHER_API_KEY=your_openweather_key_here
DATE_API_KEY=your_weatherapi_key_here
UNSPLASH_ACCESS_KEY=your_unsplash_key_here
```


### 3. Running the Backend
```
cd backend
go mod tidy
go run main.go
```

The server will start at http://localhost:8080.

### 4. Running the Frontend
Simply open the index.html file in your browser or use a VS Code extension like Live Server.



## 🔌API Endpoints
The Go backend acts as a proxy for the following routes:

| Endpoint               | Description                   |
| ---------------------- | ------------------------------|
| `/weather?city={name}` | Fetches weather data          |
| `/date?city={name}`    | Fetches local time data       |
| `/image?city={name}`   | Fetches a random city image   |


## Author

👤 **Yash Kumar**

- Github: [@githubhandle](https://github.com/yashk9293)
- Twitter: [@twitterhandle](https://twitter.com/Yashk_9293)
- Linkedin: [linkedin](https://www.linkedin.com/in/yashk9293/)

---

## ⭐ Show Your Support

If you like this project, give it a ⭐ on GitHub!
