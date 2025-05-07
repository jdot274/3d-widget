/**
 * WeatherService.js - Module for fetching and processing weather data
 * 
 * This service handles communication with the weather API and processes
 * data into formats required by the 3D globe visualization.
 */

// Mock weather data for development (replace with actual API call)
const MOCK_WEATHER_DATA = {
  temperature: [
    { lat: 27.9881, lng: 86.9250, temp: 38, name: 'Mount Everest Region' },
    { lat: 36.1699, lng: -115.1398, temp: 45, name: 'Las Vegas' },
    { lat: 25.2048, lng: 55.2708, temp: 42, name: 'Dubai' },
    { lat: -23.5558, lng: -46.6396, temp: 35, name: 'São Paulo' },
    { lat: 19.4326, lng: -99.1332, temp: 32, name: 'Mexico City' },
    { lat: 51.5074, lng: -0.1278, temp: 18, name: 'London' },
    { lat: 40.7128, lng: -74.0060, temp: 24, name: 'New York' },
    { lat: 35.6762, lng: 139.6503, temp: 28, name: 'Tokyo' },
    { lat: -33.8688, lng: 151.2093, temp: 26, name: 'Sydney' },
    { lat: 37.7749, lng: -122.4194, temp: 22, name: 'San Francisco' }
  ],
  weather: [
    { lat: 27.9881, lng: 86.9250, condition: 'clear', windSpeed: 15 },
    { lat: 36.1699, lng: -115.1398, condition: 'clear', windSpeed: 8 },
    { lat: 25.2048, lng: 55.2708, condition: 'clear', windSpeed: 12 },
    { lat: -23.5558, lng: -46.6396, condition: 'rain', windSpeed: 5 },
    { lat: 19.4326, lng: -99.1332, condition: 'clouds', windSpeed: 7 },
    { lat: 51.5074, lng: -0.1278, condition: 'rain', windSpeed: 14 },
    { lat: 40.7128, lng: -74.0060, condition: 'clouds', windSpeed: 10 },
    { lat: 35.6762, lng: 139.6503, condition: 'clear', windSpeed: 9 },
    { lat: -33.8688, lng: 151.2093, condition: 'clear', windSpeed: 11 },
    { lat: 37.7749, lng: -122.4194, condition: 'fog', windSpeed: 6 }
  ]
};

/**
 * Fetches weather data from the API or returns mock data in development
 * @param {boolean} useMock - Whether to use mock data (default: true)
 * @returns {Promise<Object>} - Weather data object
 */
export const fetchWeatherData = async (useMock = true) => {
  if (useMock) {
    return new Promise(resolve => {
      setTimeout(() => resolve(MOCK_WEATHER_DATA), 500); // Simulate API delay
    });
  }
  
  // In a real implementation, this would call the weather API
  // Example with fetch:
  /* 
  try {
    // If using Tauri, you could use the Rust backend to make this call
    // or call directly from the frontend:
    const response = await fetch('https://api.openweathermap.org/data/2.5/...');
    const data = await response.json();
    return processWeatherData(data);
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return MOCK_WEATHER_DATA; // Fallback to mock data
  }
  */
  
  return MOCK_WEATHER_DATA;
};

/**
 * Processes raw weather data into a format suitable for visualization
 * @param {Object} rawData - Raw data from the weather API
 * @returns {Object} - Processed data object with temperature and weather arrays
 */
export const processWeatherData = (rawData) => {
  // In a real implementation, this would transform API response to the format needed
  // Example transformation logic:
  /*
  return {
    temperature: rawData.list.map(item => ({
      lat: item.coord.lat,
      lng: item.coord.lon,
      temp: Math.round(item.main.temp - 273.15), // Convert Kelvin to Celsius
      name: item.name
    })),
    weather: rawData.list.map(item => ({
      lat: item.coord.lat,
      lng: item.coord.lon,
      condition: item.weather[0].main.toLowerCase(),
      windSpeed: item.wind.speed
    }))
  };
  */
  
  return rawData;
};

/**
 * Gets temperature hotspots filtered by minimum temperature
 * @param {Object} weatherData - Weather data object
 * @param {number} minTemp - Minimum temperature to consider as hotspot (default: 30)
 * @returns {Array} - Array of temperature hotspots
 */
export const getTemperatureHotspots = (weatherData, minTemp = 30) => {
  return weatherData.temperature.filter(spot => spot.temp >= minTemp);
};

/**
 * Gets weather data suitable for mist/fog effect
 * @param {Object} weatherData - Weather data object
 * @returns {Array} - Array of weather conditions
 */
export const getWeatherConditions = (weatherData) => {
  return weatherData.weather.map(item => ({
    position: [item.lng, item.lat], // Note the order: [longitude, latitude]
    intensity: item.condition === 'rain' || item.condition === 'fog' ? 0.8 : 0.2,
    color: getWeatherColor(item.condition),
    radius: getWeatherRadius(item.condition, item.windSpeed)
  }));
};

/**
 * Maps weather condition to color
 * @param {string} condition - Weather condition
 * @returns {string} - Color in hex format
 */
const getWeatherColor = (condition) => {
  const colors = {
    'clear': '#87CEEB',
    'clouds': '#B0C4DE',
    'rain': '#4682B4',
    'fog': '#D3D3D3',
    'snow': '#FFFFFF',
    'thunderstorm': '#483D8B'
  };
  
  return colors[condition] || '#87CEEB';
};

/**
 * Calculates radius based on weather condition and wind speed
 * @param {string} condition - Weather condition
 * @param {number} windSpeed - Wind speed in m/s
 * @returns {number} - Radius value
 */
const getWeatherRadius = (condition, windSpeed) => {
  // Base radius by condition
  const baseRadius = {
    'clear': 1,
    'clouds': 2,
    'rain': 1.5,
    'fog': 3,
    'snow': 2,
    'thunderstorm': 2.5
  }[condition] || 1;
  
  // Adjust by wind speed (stronger wind = larger radius)
  return baseRadius * (1 + (windSpeed / 20));
};

export default {
  fetchWeatherData,
  processWeatherData,
  getTemperatureHotspots,
  getWeatherConditions
}; 