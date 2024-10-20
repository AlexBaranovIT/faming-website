const locations = ['Seattle', 'Los Angeles', 'Phoenix', 'Denver', 'Houston', 'New York City', 'Minneapolis', 'Chicago', 'New Orleans', 'Anchorage', 'Honolulu', 'Atlanta', 'Kansas City', 'Las Vegas'];

const waterQualityDataByCity = {
  'Seattle': [
    { parameter: 'Dissolved Oxygen', value: '8.0', unit: 'mg/l' },
    { parameter: 'pH', value: '8.1', unit: 'std units' },
    { parameter: 'Suspended Sediment Concentration', value: '86', unit: '%' },
    { parameter: 'Temperature', value: '31.7', unit: 'deg C' },
    { parameter: 'Specific Conductance', value: '383', unit: 'uS/cm @25C' },
    { parameter: 'Ammonia and Ammonium', value: '0.183', unit: 'mg/l as N' }
  ],
  'Phoenix': [
    { parameter: 'Dissolved Oxygen', value: '7.5', unit: 'mg/l' },
    { parameter: 'pH', value: '7.8', unit: 'std units' },
    { parameter: 'Suspended Sediment Concentration', value: '72', unit: '%' },
    { parameter: 'Temperature', value: '36.4', unit: 'deg C' },
    { parameter: 'Specific Conductance', value: '400', unit: 'uS/cm @25C' },
    { parameter: 'Ammonia and Ammonium', value: '0.150', unit: 'mg/l as N' }
  ],
  'Houston': [
    { parameter: 'Dissolved Oxygen', value: '6.9', unit: 'mg/l' },
    { parameter: 'pH', value: '7.2', unit: 'std units' },
    { parameter: 'Suspended Sediment Concentration', value: '92', unit: '%' },
    { parameter: 'Temperature', value: '30.2', unit: 'deg C' },
    { parameter: 'Specific Conductance', value: '450', unit: 'uS/cm @25C' },
    { parameter: 'Ammonia and Ammonium', value: '0.210', unit: 'mg/l as N' }
  ]
};

// Function to normalize values (example ranges for demonstration)
function normalizeValue(parameter, value) {
  switch (parameter) {
    case 'Dissolved Oxygen':
      return (value / 10) * 100;  // Example: normalize to 0-10 mg/l -> 0-100%
    case 'pH':
      return ((value - 6) / 2) * 100;  // Example: pH scale of 6 to 8 -> 0-100%
    case 'Suspended Sediment Concentration':
      return value;  // Assuming percentage already
    case 'Temperature':
      return (value / 40) * 100;  // Example: normalize to 0-40 deg C -> 0-100%
    case 'Specific Conductance':
      return (value / 1000) * 100;  // Normalize to 0-1000 uS/cm
    case 'Ammonia and Ammonium':
      return (value / 5) * 100;  // Normalize to a range of 0-5 mg/l
    default:
      return value;
  }
}

// Function to calculate total score based on all parameters
function calculateTotalScore(cityData) {
  let totalScore = 0;
  cityData.forEach(data => {
    totalScore += normalizeValue(data.parameter, parseFloat(data.value));
  });
  return (totalScore / cityData.length).toFixed(2); // Return the average score
}

// Loop through each city, normalize the values, and calculate the total score
locations.forEach(city => {
  if (waterQualityDataByCity[city]) {
    console.log(Water Quality Data for ${city}:);
    let cityData = waterQualityDataByCity[city];
    cityData.forEach(data => {
      const normalizedValue = normalizeValue(data.parameter, parseFloat(data.value));
      console.log(${data.parameter}: ${data.value} (${data.unit}), Normalized: ${normalizedValue.toFixed(2)}/100);
    });

    // Calculate and print total score for the city
    const totalScore = calculateTotalScore(cityData);
    console.log(Total Water Quality Score for ${city}: ${totalScore}/100\n);
  } else {
    console.log(No water quality data available for ${city}.\n);
  }
});


const fetch = require('node-fetch');  // Use require for CommonJS

const OPENWEATHER_API_KEY = 'e515b544496bc65d9d5ae5d265c06c2f';  // Replace with your actual API key
const cities = [
    'Seattle', 'Los Angeles', 'Phoenix', 'Denver', 'Houston',
    'Miami', 'New York City', 'Minneapolis', 'Chicago', 'New Orleans',
    'Anchorage', 'Honolulu', 'Atlanta', 'Kansas City', 'Las Vegas'
];

// Function to fetch humidity data for all cities
async function fetchHumidityData() {
    for (const city of cities) {
        try {
            const response = await fetch(https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${OPENWEATHER_API_KEY});
            const data = await response.json();
            
            // Log the entire response to inspect the structure
            console.log(API response for ${city}:, data);
            
            // Check if the 'main' property exists in the response
            if (data.main && data.main.humidity) {
                const humidity = data.main.humidity;
                console.log(Humidity in ${city}: ${humidity}%);
            } else {
                console.log(No humidity data available for ${city}.);
            }
        } catch (error) {
            console.error(Error fetching humidity data for ${city}:, error);
        }
    }
}

fetchHumidityData().catch(err => console.error('Error fetching humidity data:', err));

    
const fetch = require('node-fetch');  // Use require for CommonJS

const WAQI_API_KEY = 'fda8b1ee4f75065ebcb93e370083788fade625ba';  // Replace with your WAQI API key
// List of all locations
const cities = [
    'Seattle', 'Los Angeles', 'Phoenix', 'Denver', 'Houston',
    'Miami', 'New York City', 'Minneapolis', 'Chicago', 'New Orleans',
    'Anchorage', 'Honolulu', 'Atlanta', 'Kansas City', 'Las Vegas'
];

// Function to fetch air quality data for all cities
async function fetchAirQualityData() {
    for (const city of cities) {
        try {
            const response = await fetch(https://api.waqi.info/feed/${city}/?token=${WAQI_API_KEY});
            const data = await response.json();

            // Check if the data contains the AQI (Air Quality Index)
            if (data.data && data.data.aqi) {
                const aqi = data.data.aqi;
                console.log(Air Quality Index in ${city}: ${aqi});
            } else {
                console.log(No air quality data available for ${city}.);
            }
        } catch (error) {
            console.error(Error fetching air quality data for ${city}:, error);
        }
    }
}

// Fetch air quality for all cities
fetchAirQualityData().catch(err => console.error('Error fetching air quality data:', err));
