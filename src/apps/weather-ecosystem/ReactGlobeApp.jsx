import React, { useState, useEffect, useRef } from 'react';
import './styles/WeatherEcosystem.css';

// Component that uses dynamic import for better compatibility
const ReactGlobeApp = () => {
  const containerRef = useRef(null);
  const [Globe, setGlobe] = useState(null);
  const [countries, setCountries] = useState([]);
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper function to create random points
  const generateRandomPoints = (count) => {
    return Array.from({ length: count }, () => ({
      lat: (Math.random() - 0.5) * 180,
      lng: (Math.random() - 0.5) * 360,
      size: Math.random() * 7 + 3,
      color: ['#ff5e63', '#61d836', '#ffcb39', '#33bbff'][
        Math.floor(Math.random() * 4)
      ]
    }));
  };

  // Load dependencies dynamically
  useEffect(() => {
    const loadDependencies = async () => {
      try {
        setLoading(true);
        
        // Dynamic import of react-globe.gl
        const GlobeModule = await import('react-globe.gl');
        setGlobe(() => GlobeModule.default);
        
        // Load country data
        fetch('https://unpkg.com/world-atlas/countries-110m.json')
          .then(res => res.json())
          .then(data => {
            setCountries(data.features);
          })
          .catch(err => {
            console.error("Failed to load country data:", err);
            // Generate simple countries as fallback
            setCountries([]);
          });
        
        // Generate random points
        setPoints(generateRandomPoints(300));
        
        setLoading(false);
      } catch (err) {
        console.error("Failed to load dependencies:", err);
        setError(`Failed to load: ${err.message}`);
        setLoading(false);
      }
    };
    
    loadDependencies();
  }, []);

  // When container size changes
  useEffect(() => {
    const handleResize = () => {
      // Force re-render on resize
      setPoints(prev => [...prev]);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="weather-ecosystem-app" ref={containerRef}>
      {loading && (
        <div className="loading-indicator">
          Loading globe visualization...
        </div>
      )}
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      {Globe && !loading && !error && (
        <Globe
          backgroundColor="#000010"
          globeImageUrl={null}
          showGraticules={true}
          pointsData={points}
          pointAltitude={0.01}
          pointRadius="size"
          pointColor="color"
          pointsMerge={true}
          atmosphereColor="#3a228a"
          atmosphereAltitude={0.25}
          hexPolygonsData={countries}
          hexPolygonResolution={3}
          hexPolygonMargin={0.7}
          hexPolygonColor={() => `hsl(${110 + Math.random() * 40}, 50%, 50%)`}
          width={window.innerWidth}
          height={window.innerHeight}
        />
      )}
      
      <div className="globe-info">
        <div className="globe-title">React Globe Visualization</div>
      </div>
    </div>
  );
};

export default ReactGlobeApp; 