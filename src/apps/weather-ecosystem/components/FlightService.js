/**
 * FlightService.js - Module for managing flight data and animations
 * 
 * This service handles flight data and provides methods for
 * visualization on the 3D globe.
 */

// Sample flight data (replace with API call in production)
const FLIGHT_DATA = [
  { 
    from: { lat: 40.7128, lng: -74.0060, name: 'New York' }, 
    to: { lat: 51.5074, lng: -0.1278, name: 'London' },
    color: '#00ff00',
    altitude: 1.2
  },
  { 
    from: { lat: 35.6762, lng: 139.6503, name: 'Tokyo' }, 
    to: { lat: 22.3193, lng: 114.1694, name: 'Hong Kong' },
    color: '#00ff88',
    altitude: 1.1
  },
  { 
    from: { lat: -33.8688, lng: 151.2093, name: 'Sydney' }, 
    to: { lat: 1.3521, lng: 103.8198, name: 'Singapore' },
    color: '#00ff00',
    altitude: 1.3
  },
  { 
    from: { lat: 37.7749, lng: -122.4194, name: 'San Francisco' }, 
    to: { lat: 34.0522, lng: -118.2437, name: 'Los Angeles' },
    color: '#00ff44',
    altitude: 0.9
  },
  { 
    from: { lat: 48.8566, lng: 2.3522, name: 'Paris' }, 
    to: { lat: 41.9028, lng: 12.4964, name: 'Rome' },
    color: '#00ff66',
    altitude: 1.0
  },
  { 
    from: { lat: 55.7558, lng: 37.6173, name: 'Moscow' }, 
    to: { lat: 39.9042, lng: 116.4074, name: 'Beijing' },
    color: '#00ff00',
    altitude: 1.5
  },
  { 
    from: { lat: -22.9068, lng: -43.1729, name: 'Rio de Janeiro' }, 
    to: { lat: -34.6037, lng: -58.3816, name: 'Buenos Aires' },
    color: '#00ff88',
    altitude: 1.0
  },
  { 
    from: { lat: 25.2048, lng: 55.2708, name: 'Dubai' }, 
    to: { lat: 28.6139, lng: 77.2090, name: 'New Delhi' },
    color: '#00ff44',
    altitude: 1.2
  }
];

/**
 * Fetches flight data from API or returns mock data
 * @param {boolean} useMock - Whether to use mock data (default: true)
 * @returns {Promise<Array>} - Array of flight routes
 */
export const fetchFlightData = async (useMock = true) => {
  if (useMock) {
    return new Promise(resolve => {
      setTimeout(() => resolve(FLIGHT_DATA), 300); // Simulate API delay
    });
  }
  
  // In a real implementation, this would call a flight tracking API
  /* 
  try {
    const response = await fetch('https://api.flighttracker.example/v1/flights');
    const data = await response.json();
    return processFlightData(data);
  } catch (error) {
    console.error('Error fetching flight data:', error);
    return FLIGHT_DATA; // Fallback to mock data
  }
  */
  
  return FLIGHT_DATA;
};

/**
 * Processes raw flight data into a format suitable for three-globe
 * @param {Array} flightData - Array of flight routes
 * @returns {Array} - Processed flight data for visualization
 */
export const processArcData = (flightData) => {
  return flightData.map(flight => ({
    startLat: flight.from.lat,
    startLng: flight.from.lng,
    endLat: flight.to.lat,
    endLng: flight.to.lng,
    color: flight.color || '#00ff00',
    altitude: flight.altitude || 1.2,
    name: `${flight.from.name} to ${flight.to.name}`,
    // Additional data for reference
    from: flight.from,
    to: flight.to
  }));
};

/**
 * Creates flight path particle data for animating along the arcs
 * @param {Array} flightData - Array of flight routes
 * @param {number} particlesPerArc - Number of particles per arc
 * @returns {Array} - Particle data for visualization
 */
export const createParticleData = (flightData, particlesPerArc = 5) => {
  const particles = [];
  
  flightData.forEach(flight => {
    for (let i = 0; i < particlesPerArc; i++) {
      particles.push({
        arcData: {
          startLat: flight.from.lat,
          startLng: flight.from.lng,
          endLat: flight.to.lat,
          endLng: flight.to.lng,
        },
        position: i / particlesPerArc, // Initial position along the arc (0-1)
        speed: 0.005 + (Math.random() * 0.003), // Random speed variation
        color: flight.color || '#00ff00',
        flightInfo: `${flight.from.name} to ${flight.to.name}`
      });
    }
  });
  
  return particles;
};

/**
 * Finds a flight by name
 * @param {Array} flightData - Array of flight routes
 * @param {string} flightName - Name of the flight route to find
 * @returns {Object|null} - Flight object or null if not found
 */
export const findFlightByName = (flightData, flightName) => {
  return flightData.find(flight => 
    `${flight.from.name} to ${flight.to.name}` === flightName
  ) || null;
};

/**
 * Updates particle positions for animation
 * @param {Array} particles - Array of particles
 * @returns {Array} - Updated particles with new positions
 */
export const updateParticles = (particles) => {
  return particles.map(particle => {
    // Update position along the arc
    particle.position += particle.speed;
    
    // Reset position if it exceeds 1
    if (particle.position > 1) {
      particle.position = 0;
    }
    
    return particle;
  });
};

export default {
  fetchFlightData,
  processArcData,
  createParticleData,
  findFlightByName,
  updateParticles
}; 