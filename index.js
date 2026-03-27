const apiUrl = "http://localhost:8080/weather?city=";

const searchBox = document.querySelector(".search input")
const searchBtn = document.querySelector(".search button")
const weatherIcon = document.querySelector(".weather-icon")

async function checkWeather(city){
    try {
        const response = await fetch(apiUrl + city);
        
        var data = await response.json();

        document.querySelector(".city").innerHTML = data.name;
        document.querySelector(".temp").innerHTML = Math.round(data.main.temp) + "°c";
        document.querySelector(".humidity").innerHTML = data.main.humidity + "%";
        document.querySelector(".wind").innerHTML = data.wind.speed + " km/h";

        if(data.weather[0].main == "Clouds") {
            weatherIcon.src = "images/clouds.png"
        }
        else if(data.weather[0].main == "Rain") {
            weatherIcon.src = "images/rain.png"
        }
        else if(data.weather[0].main == "Clear") {
            weatherIcon.src = "images/clear.png"
        }
        else if(data.weather[0].main == "Drizzle") {
            weatherIcon.src = "images/drizzle.png"
        }
        else if(data.weather[0].main == "Mist") {
            weatherIcon.src = "images/mist.png"
        }

        document.querySelector(".weather").style.display = "block";

        const unsplashres = await fetch(`http://localhost:8080/image?city=${city}`);
        const unsplashdata = await unsplashres.json();
        
        document.body.style.backgroundImage = `url(${unsplashdata.urls.regular})`;
        document.body.style.backgroundRepeat = "no-repeat";
        document.body.style.backgroundSize = "cover";
        document.body.style.backgroundPosition = "center";

    } catch (error) {
        alert("Location not found"); 
    }
    
}

searchBtn.addEventListener("click",()=>{
    checkWeather(searchBox.value);
})