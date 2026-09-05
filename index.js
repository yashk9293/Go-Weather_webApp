/* ------------------------------------------------------------
   Search flow: weather -> local time -> background image.
   The card is a small state machine (idle | loading | error | ready)
   driven by the data-state attribute; style.css owns what each
   state shows.
   ------------------------------------------------------------ */

const weatherApiUrl = "/weather?city=";
const imageApiUrl   = "/image?city=";

const RECENT_KEY   = "gw:recent";
const RECENT_LIMIT = 5;

const card        = document.getElementById("card");
const form        = document.getElementById("search-form");
const searchBox   = document.getElementById("city-input");
const bg          = document.getElementById("bg");
const liveRegion  = document.getElementById("live-region");

const recentWrap  = document.getElementById("recent");
const recentChips = document.getElementById("recent-chips");

const els = {
    icon:      document.getElementById("weather-icon"),
    condition: document.getElementById("condition"),
    temp:      document.getElementById("temp-value"),
    city:      document.getElementById("city"),
    date:      document.getElementById("date"),
    humidity:  document.getElementById("humidity"),
    wind:      document.getElementById("wind"),
    feels:     document.getElementById("feels"),
    pressure:  document.getElementById("pressure"),
    errTitle:  document.getElementById("error-title"),
    errHint:   document.getElementById("error-hint")
};

const ICONS = {
    Clear:        "images/clear.png",
    Clouds:       "images/clouds.png",
    Rain:         "images/rain.png",
    Drizzle:      "images/drizzle.png",
    Snow:         "images/snow.png",
    Thunderstorm: "images/rain.png",
    Mist:         "images/mist.png",
    Fog:          "images/mist.png",
    Haze:         "images/mist.png",
    Smoke:        "images/mist.png",
    Squall:       "images/wind.png",
    Tornado:      "images/wind.png"
};

/* ── State ─────────────────────────────────────────────────── */

let inFlight = null; // guards against a slow search overwriting a newer one

function setState(state) {
    card.dataset.state = state;
}

function announce(message) {
    liveRegion.textContent = message;
}

function showError(title, hint) {
    els.errTitle.textContent = title;
    els.errHint.textContent  = hint;
    setState("error");
    announce(`${title}. ${hint}`);
}

/* ── Search ────────────────────────────────────────────────── */

async function search(rawCity) {
    const city = rawCity.trim();

    if (!city) {
        searchBox.focus();
        showError("Enter a city name", "Try “Tokyo”, “Manchester” or “São Paulo”.");
        return;
    }

    const token = Symbol(city);
    inFlight = token;
    setState("loading");
    announce(`Searching for ${city}…`);

    try {
        const response = await fetch(weatherApiUrl + encodeURIComponent(city));

        if (inFlight !== token) return; // a newer search took over

        if (response.status === 404) {
            showError("City not found", `We couldn't find “${city}”. Check the spelling and try again.`);
            return;
        }
        if (!response.ok) {
            showError("Weather service unavailable", "The weather service didn't respond. Please try again in a moment.");
            return;
        }

        const data = await response.json();
        if (inFlight !== token) return;

        if (!data?.name) {
            showError("City not found", `We couldn't find “${city}”. Check the spelling and try again.`);
            return;
        }

        render(data);
        rememberCity(data.name);

        // Local time and imagery are enhancements — a failure in either
        // must not take the weather reading down with it.
        fetchLocalTime(city).then((formatted) => {
            if (inFlight === token) els.date.textContent = formatted ?? "Local time unavailable";
        });

        loadBackground(city, token);

    } catch (error) {
        console.error(error);
        if (inFlight === token) {
            showError("Connection problem", "We couldn't reach the server. Check your connection and try again.");
        }
    }
}

function render(data) {
    const condition = data.weather?.[0];

    els.icon.src           = ICONS[condition?.main] || ICONS.Clear;
    els.icon.alt           = condition?.description || condition?.main || "Current weather";
    els.condition.textContent = condition?.description || condition?.main || "—";

    els.temp.textContent   = Math.round(data.main.temp);
    els.city.textContent   = data.sys?.country ? `${data.name}, ${data.sys.country}` : data.name;
    els.date.textContent   = "—";

    els.humidity.textContent = `${data.main.humidity}%`;
    // OpenWeatherMap reports metric wind in m/s; the UI shows km/h.
    els.wind.textContent     = `${Math.round(data.wind.speed * 3.6)} km/h`;
    els.feels.textContent    = `${Math.round(data.main.feels_like)}°C`;
    els.pressure.textContent = `${data.main.pressure} hPa`;

    setState("ready");
    announce(`${els.city.textContent}: ${Math.round(data.main.temp)} degrees, ${els.condition.textContent}.`);
}

async function loadBackground(city, token) {
    try {
        const response = await fetch(imageApiUrl + encodeURIComponent(city));
        if (!response.ok) return;

        const { urls } = await response.json();
        if (!urls?.regular || inFlight !== token) return;

        // Preload, then crossfade — avoids a flash of half-painted image.
        const image = new Image();
        image.onload = () => {
            if (inFlight !== token) return;
            bg.classList.add("is-swapping");
            setTimeout(() => {
                bg.style.backgroundImage = `url("${urls.regular}")`;
                bg.classList.add("has-photo");
                bg.classList.remove("is-swapping");
            }, 260);
        };
        image.src = urls.regular;
    } catch (error) {
        console.warn("Background image unavailable:", error);
    }
}

/* ── Recent searches ───────────────────────────────────────── */

function readRecent() {
    try {
        const stored = JSON.parse(localStorage.getItem(RECENT_KEY));
        return Array.isArray(stored) ? stored : [];
    } catch {
        return [];
    }
}

function rememberCity(city) {
    const next = [city, ...readRecent().filter((c) => c.toLowerCase() !== city.toLowerCase())]
        .slice(0, RECENT_LIMIT);
    try {
        localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    } catch {
        /* storage may be unavailable (private mode) — chips are optional */
    }
    renderRecent(next);
}

function renderRecent(cities = readRecent()) {
    recentWrap.hidden = cities.length === 0;
    recentChips.replaceChildren(
        ...cities.map((city) => {
            const chip = document.createElement("button");
            chip.type        = "button";
            chip.className   = "chip";
            chip.textContent = city;
            chip.addEventListener("click", () => {
                searchBox.value = city;
                search(city);
            });
            return chip;
        })
    );
}

/* ── Wiring ────────────────────────────────────────────────── */

form.addEventListener("submit", (event) => {
    event.preventDefault();
    search(searchBox.value);
});

// Typing again clears a stale error so the card doesn't nag.
searchBox.addEventListener("input", () => {
    if (card.dataset.state === "error") setState("idle");
});

renderRecent();
searchBox.focus();
