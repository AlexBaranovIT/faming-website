// Leaflet map initialization
var map = L.map('map', { zoomControl: false }).setView([37.0902, -95.7129], 4);  // Centered on the US, zoom level 4

// Add dark map layer (CartoDB Dark Matter)
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://carto.com/attributions" target="_blank">CartoDB</a> contributors',
    subdomains: 'abcd',
    maxZoom: 19
}).addTo(map);

// Locations with coordinates
var locations = [
    { name: "Seattle", lat: 47.6062, lon: -122.3321 },
    { name: "Los Angeles", lat: 34.0522, lon: -118.2437 },
    { name: "Phoenix", lat: 33.4484, lon: -112.0740 },
    { name: "Denver", lat: 39.7392, lon: -104.9903 },
    { name: "Houston", lat: 29.7604, lon: -95.3698 }
    // Add more locations as needed
];

// Function to open pop-up and show data
function openPopup(data) {
    document.getElementById('region-name').textContent = data.name;
    document.getElementById('total-score').textContent = `Total Score: ${data.score}/100`;
    document.getElementById('temperature').textContent = data.temperature;
    document.getElementById('aqi').textContent = data.aqi;
    document.getElementById('pests').textContent = data.pests;
    document.getElementById('daylight').textContent = data.daylight;
    document.getElementById('humidity').textContent = data.humidity;
    document.getElementById('soil').textContent = data.soil;

    // Open the pop-up card
    var popup = document.getElementById('popup-container');
    popup.style.display = 'block';
}

// Close pop-up
function closePopup() {
    var popup = document.getElementById('popup-container');
    popup.style.display = 'none';
}

// Toggle side menu
function toggleMenu() {
    var menu = document.getElementById("side-menu");
    if (menu.style.width === "250px") {
        menu.style.width = "0";
    } else {
        menu.style.width = "250px";
    }
}

// Add markers and pop-up functionality
locations.forEach(function (location) {
    var marker = L.marker([location.lat, location.lon]).addTo(map);
    marker.on('click', function () {
        openPopup(location);
    });
});

/* 1. Fetch Humidity Data (OpenWeather API) */
const OPENWEATHER_API_KEY = 'your_openweather_api_key';
async function fetchHumidityData(city) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${OPENWEATHER_API_KEY}`);
        const data = await response.json();
        if (data.main && data.main.humidity) {
            return data.main.humidity;
        } else {
            console.log(`No humidity data available for ${city}.`);
            return null;
        }
    } catch (error) {
        console.error(`Error fetching humidity data for ${city}:`, error);
        return null;
    }
}

/* 2. Fetch Air Quality Data (WAQI API) */
const WAQI_API_KEY = 'your_waqi_api_key';
async function fetchAirQualityData(city) {
    try {
        const response = await fetch(`https://api.waqi.info/feed/${city}/?token=${WAQI_API_KEY}`);
        const data = await response.json();
        if (data.data && data.data.aqi) {
            return data.data.aqi;
        } else {
            console.log(`No air quality data available for ${city}.`);
            return null;
        }
    } catch (error) {
        console.error(`Error fetching air quality data for ${city}:`, error);
        return null;
    }
}

/* 3. Fetch Water Quality Data (USGS API) */
async function fetchWaterQualityData(siteId) {
    try {
        const response = await fetch(`https://waterservices.usgs.gov/nwis/iv/?format=json&sites=${siteId}&parameterCd=00060,00065&siteStatus=all`);
        const data = await response.json();
        if (data.value) {
            return data.value; // Adjust this depending on the actual data structure
        } else {
            console.log(`No water quality data available for site ID: ${siteId}.`);
            return null;
        }
    } catch (error) {
        console.error(`Error fetching water data for site ID: ${siteId}:`, error);
        return null;
    }
}

// Example usage:
(async () => {
    const humiditySeattle = await fetchHumidityData('Seattle');
    const airQualitySeattle = await fetchAirQualityData('Seattle');
    const waterQualitySeattle = await fetchWaterQualityData('12113350');  // Example USGS site ID for Seattle

    console.log(`Seattle - Humidity: ${humiditySeattle}%, AQI: ${airQualitySeattle}, Water Quality: ${waterQualitySeattle}`);
})();
