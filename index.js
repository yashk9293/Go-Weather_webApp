const weatherApiUrl = "/weather?city=";
const imageApiUrl = "/image?city=";

const searchBox = document.querySelector(".search input")
const searchBtn = document.querySelector(".search button")
const weatherIcon = document.querySelector(".weather-icon")

async function checkWeather(city){
    try {
        const response = await fetch(weatherApiUrl + city);
        if (!response.ok) throw new Error("Weather fetch failed");
        
        const data = await response.json();

        document.querySelector(".city").innerHTML = data.name;
        document.querySelector(".temp").innerHTML = Math.round(data.main.temp) + "°c";
        document.querySelector(".humidity").innerHTML = data.main.humidity + "%";
        document.querySelector(".wind").innerHTML = data.wind.speed + " km/h";

        const iconMap = {
            "Clouds": "images/clouds.png",
            "Rain": "images/rain.png",
            "Clear": "images/clear.png",
            "Drizzle": "images/drizzle.png",
            "Mist": "images/mist.png"
        };
        
        weatherIcon.src = iconMap[data.weather[0].main] || "images/clear.png";
        document.querySelector(".weather").style.display = "block";

        // Fetch Image
        const unsplashres = await fetch(`${imageApiUrl}${city}`);
        const unsplashdata = await unsplashres.json();
        
        document.body.style.backgroundImage = `url(${unsplashdata.urls.regular})`;
        document.body.style.backgroundRepeat = "no-repeat";
        document.body.style.backgroundSize = "cover";
        document.body.style.backgroundPosition = "center";

    } catch (error) {
        console.error(error);
        alert("Location not found or API error"); 
    }
}

searchBtn.addEventListener("click", () => {
    checkWeather(searchBox.value);
});