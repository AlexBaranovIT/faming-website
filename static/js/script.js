// Initialize the map with zoom control disabled
var map = L.map('map', { zoomControl: false }).setView([37.0902, -95.7129], 4);

// Add dark tile layer
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://carto.com/attributions" target="_blank">CartoDB</a> contributors',
    subdomains: 'abcd',
    maxZoom: 19
}).addTo(map);

const OPENWEATHER_API_KEY = 'e515b544496bc65d9d5ae5d265c06c2f';
const WAQI_API_KEY = 'fda8b1ee4f75065ebcb93e370083788fade625ba';

// List of all 15 locations
var locations = [
    { name: "Seattle", lat: 47.6062, lon: -122.3321 },
    { name: "Los Angeles", lat: 34.0522, lon: -118.2437 },
    { name: "Phoenix", lat: 33.4484, lon: -112.0740 },
    { name: "Denver", lat: 39.7392, lon: -104.9903 },
    { name: "Houston", lat: 29.7604, lon: -95.3698 },
    { name: "Miami", lat: 25.7617, lon: -80.1918 },
    { name: "New York City", lat: 40.7128, lon: -74.0060 },
    { name: "Minneapolis", lat: 44.9778, lon: -93.2650 },
    { name: "Chicago", lat: 41.8781, lon: -87.6298 },
    { name: "New Orleans", lat: 29.9511, lon: -90.0715 },
    { name: "Anchorage", lat: 61.2181, lon: -149.9003 },
    { name: "Honolulu", lat: 21.3069, lon: -157.8583 },
    { name: "Atlanta", lat: 33.7490, lon: -84.3880 },
    { name: "Kansas City", lat: 39.0997, lon: -94.5786 },
    { name: "Las Vegas", lat: 36.1699, lon: -115.1398 }
];

// Water quality data (hardcoded for all cities)
const waterQualityDataByCity = {
    'Seattle': [
        { parameter: 'Dissolved Oxygen', value: '8.0', unit: 'mg/l' },
        { parameter: 'pH', value: '8.1', unit: 'std units' },
        { parameter: 'Suspended Sediment Concentration', value: '86', unit: '%' },
        { parameter: 'Temperature', value: '15.0', unit: 'deg C' },
        { parameter: 'Specific Conductance', value: '383', unit: 'µS/cm @25C' },
        { parameter: 'Ammonia and Ammonium', value: '0.183', unit: 'mg/l as N' }
    ],
    'Los Angeles': [
        { parameter: 'Dissolved Oxygen', value: '7.5', unit: 'mg/l' },
        { parameter: 'pH', value: '7.8', unit: 'std units' },
        { parameter: 'Suspended Sediment Concentration', value: '75', unit: '%' },
        { parameter: 'Temperature', value: '18.0', unit: 'deg C' },
        { parameter: 'Specific Conductance', value: '400', unit: 'µS/cm @25C' },
        { parameter: 'Ammonia and Ammonium', value: '0.150', unit: 'mg/l as N' }
    },
    // ... include all other cities with their respective water quality data
    'Las Vegas': [
        { parameter: 'Dissolved Oxygen', value: '6.5', unit: 'mg/l' },
        { parameter: 'pH', value: '7.5', unit: 'std units' },
        { parameter: 'Suspended Sediment Concentration', value: '85', unit: '%' },
        { parameter: 'Temperature', value: '23.0', unit: 'deg C' },
        { parameter: 'Specific Conductance', value: '460', unit: 'µS/cm @25C' },
        { parameter: 'Ammonia and Ammonium', value: '0.220', unit: 'mg/l as N' }
    ]
};

// Normalize water quality values
function normalizeValue(parameter, value) {
    switch (parameter) {
        case 'Dissolved Oxygen':
            return (value / 10) * 100;  // Assuming 10 mg/l is optimal
        case 'pH':
            if (value >= 7 && value <= 8.5) {
                return 100;  // Ideal pH range
            } else if (value < 7) {
                return ((value - 6) / (7 - 6)) * 50; // Below ideal range
            } else {
                return ((9 - value) / (9 - 8.5)) * 50; // Above ideal range
            }
        case 'Suspended Sediment Concentration':
            return 100 - value;  // Lower percentages are better
        case 'Temperature':
            return ((40 - value) / 40) * 100;  // Assuming 0-40°C is the range
        case 'Specific Conductance':
            return ((1000 - value) / 1000) * 100;  // Lower is better
        case 'Ammonia and Ammonium':
            return ((5 - value) / 5) * 100;  // Lower concentrations are better
        default:
            return 0;
    }
}

// Fetch humidity data from OpenWeatherMap API
function fetchHumidityData(city) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${OPENWEATHER_API_KEY}&units=metric`;
    return fetch(url)
        .then(response => response.json())
        .then(data => data.main ? data.main.humidity : null)
        .catch(error => {
            console.error(`Error fetching humidity data for ${city}:`, error);
            return null;
        });
}

// Fetch air quality data from WAQI API
function fetchAirQualityData(city) {
    const url = `https://api.waqi.info/feed/${encodeURIComponent(city)}/?token=${WAQI_API_KEY}`;
    return fetch(url)
        .then(response => response.json())
        .then(data => data.data ? data.data.aqi : null)
        .catch(error => {
            console.error(`Error fetching air quality data for ${city}:`, error);
            return null;
        });
}

// Fetch water quality data
function fetchWaterQualityData(city) {
    return new Promise((resolve) => {
        if (waterQualityDataByCity[city]) {
            const cityData = waterQualityDataByCity[city];
            const totalScore = calculateTotalScore(cityData);
            resolve(totalScore);
        } else {
            resolve(null);
        }
    });
}

// Calculate total water quality score
function calculateTotalScore(cityData) {
    let totalScore = 0;
    cityData.forEach(data => {
        totalScore += normalizeValue(data.parameter, parseFloat(data.value));
    });
    return (totalScore / cityData.length).toFixed(2);
}

// Global variable to store current region data
var currentRegionData = {};

// Custom Icon
var customIcon = L.icon({
    iconUrl: '/static/img/pointToGo.jpg', // Ensure this path is correct
    iconSize: [32, 32], // Adjust the size if needed
    iconAnchor: [16, 32], // Point of the icon which will correspond to marker's location
    popupAnchor: [0, -32] // Point from which the popup should open relative to the iconAnchor
});

// Add markers to the map after fetching data
locations.forEach(function(location) {
    Promise.all([
        fetchHumidityData(location.name),
        fetchAirQualityData(location.name),
        fetchWaterQualityData(location.name)
    ]).then(function(values) {
        const [humidity, aqi, waterQualityScore] = values;

        // Update the location object with fetched data
        location.humidity = humidity;
        location.aqi = aqi;
        location.waterQualityScore = waterQualityScore;

        // Example providedScore object; replace or extend as needed
        const providedScore = {
            'Seattle': 70,
            'Los Angeles': 60,
            'Phoenix': 60,
            'Denver': 75,
            'Houston': 60,
            'Miami': 85,
            'New York City': 65,
            'Minneapolis': 80,
            'Chicago': 65,
            'New Orleans': 60,
            'Anchorage': 90,
            'Honolulu': 90,
            'Atlanta': 65,
            'Kansas City': 70,
            'Las Vegas': 60
        };
        location.score = providedScore[location.name] || 'N/A';

        // Add marker to the map with custom icon
        const marker = L.marker([location.lat, location.lon], { icon: customIcon }).addTo(map);
        marker.on('click', function() {
            openPopup(location);
        });
    });
});

// Function to display the popup
function openPopup(data) {
    currentRegionData = data; // Update global variable
    updateRegionInfo(data);

    // Open the popup
    document.getElementById('popup-container').style.display = 'block';
}

// Function to close the popup
function closePopup() {
    document.getElementById('popup-container').style.display = 'none';
}

// Toggle side menu
function toggleMenu() {
    const menu = document.getElementById("side-menu");
    menu.style.width = menu.style.width === "250px" ? "0" : "250px";
}
