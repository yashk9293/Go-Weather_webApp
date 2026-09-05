/* ------------------------------------------------------------
   Local time for the searched city.
   Exposes window.fetchLocalTime(city) -> formatted string.
   index.js owns the search flow and calls into this module.
   ------------------------------------------------------------ */

const dateApiUrl = "/date?city=";

const DAY_NAMES = [
    "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
];

const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

/**
 * Fetch the city's local time and format it as
 * "21:17 · Sunday, 4 June 2023".
 * Returns null when the time is unavailable — the caller decides
 * whether that is worth surfacing (weather alone is still useful).
 */
async function fetchLocalTime(city) {
    try {
        const response = await fetch(dateApiUrl + encodeURIComponent(city));
        if (!response.ok) return null;

        const data = await response.json();
        const localtime = data?.location?.localtime;
        if (!localtime) return null;

        const [datePart, timePart] = localtime.split(" ");
        const [hour, minute] = timePart.split(":");

        // Parse as local calendar parts so the browser's own timezone
        // can't shift the day across a boundary.
        const [year, month, day] = datePart.split("-").map(Number);
        const parsed = new Date(year, month - 1, day);

        return `${hour}:${minute} · ${DAY_NAMES[parsed.getDay()]}, ${day} ${MONTH_NAMES[month - 1]} ${year}`;
    } catch (error) {
        console.warn("Local time unavailable:", error);
        return null;
    }
}

window.fetchLocalTime = fetchLocalTime;
