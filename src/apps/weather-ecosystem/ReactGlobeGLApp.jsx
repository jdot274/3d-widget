import React, { useEffect, useRef, useState } from 'react';
import Globe from 'react-globe.gl';
import './styles/WeatherEcosystem.css';

const ReactGlobeGLApp = () => {
  const globeRef = useRef();
  const [points, setPoints] = useState([]);
  const [arcs, setArcs] = useState([]);
  const [countries, setCountries] = useState({ features: [] });
  const [ringsData, setRingsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Generate random points data
    const generatePoints = () => {
      return Array.from({ length: 300 }, () => ({
        lat: (Math.random() - 0.5) * 180,
        lng: (Math.random() - 0.5) * 360,
        size: Math.random() * 7 + 3,
        color: ['#ff5e63', '#61d836', '#ffcb39', '#33bbff'][Math.floor(Math.random() * 4)]
      }));
    };
    
    // Generate arcs between points
    const generateArcs = (pointsData) => {
      if (!pointsData || pointsData.length < 2) return [];
      
      return Array.from({ length: 100 }, () => {
        const startIndex = Math.floor(Math.random() * pointsData.length);
        const endIndex = Math.floor(Math.random() * pointsData.length);
        
        return {
          startLat: pointsData[startIndex].lat,
          startLng: pointsData[startIndex].lng,
          endLat: pointsData[endIndex].lat,
          endLng: pointsData[endIndex].lng,
          color: `rgba(${Math.round(Math.random() * 255)}, ${Math.round(Math.random() * 255)}, ${Math.round(Math.random() * 255)}, 0.8)`,
          altitude: Math.random() * 0.5 + 0.1
        };
      });
    };
    
    // Load country data
    const loadCountries = async () => {
      try {
        const response = await fetch('https://unpkg.com/world-atlas/countries-110m.json');
        const data = await response.json();
        setCountries(data);
      } catch (err) {
        console.error("Failed to load country data:", err);
      }
    };
    
    // Generate initial data
    const pointsData = generatePoints();
    setPoints(pointsData);
    setArcs(generateArcs(pointsData));
    loadCountries();
    setLoading(false);
    
    // Periodic rings generation
    const ringsInterval = setInterval(() => {
      if (pointsData.length > 0) {
        const ringPoints = Array.from({ length: 5 }, () => {
          const point = pointsData[Math.floor(Math.random() * pointsData.length)];
          return {
            lat: point.lat,
            lng: point.lng,
            maxR: Math.random() * 5 + 2,
            propagationSpeed: Math.random() * 2 + 0.5,
            repeatPeriod: Math.random() * 2000 + 500
          };
        });
        setRingsData(ringPoints);
      }
    }, 2000);
    
    return () => clearInterval(ringsInterval);
  }, []);
  
  return (
    <div className="weather-ecosystem-app">
      {loading ? (
        <div className="loading-indicator">Loading globe data...</div>
      ) : (
        <>
          <Globe
            ref={globeRef}
            globeImageUrl={null} // No texture for procedural rendering
            
            // Base globe configuration
            showGraticules={true}
            showAtmosphere={true}
            atmosphereColor="#3a228a"
            atmosphereAltitude={0.25}
            backgroundColor="#000010"
            
            // Points configuration
            pointsData={points}
            pointAltitude={0.01}
            pointRadius="size"
            pointColor="color"
            pointsMerge={true}
            
            // Arcs configuration
            arcsData={arcs}
            arcColor="color"
            arcAltitude="altitude"
            arcStroke={0.5}
            arcDashLength={0.4}
            arcDashGap={0.2}
            arcDashAnimateTime={1500}
            
            // Polygons configuration
            hexPolygonsData={countries.features}
            hexPolygonResolution={3}
            hexPolygonMargin={0.7}
            hexPolygonColor={() => `hsl(${110 + Math.random() * 40}, 50%, 50%)`}
            
            // Rings configuration
            ringsData={ringsData}
            ringColor={() => {
              const t = new THREE.Color();
              t.setHSL(0.58 + Math.random() * 0.05, 1, 0.6);
              return t.getStyle();
            }}
            ringMaxRadius="maxR"
            ringPropagationSpeed="propagationSpeed"
            ringRepeatPeriod="repeatPeriod"
            
            // Controls
            enablePointerInteraction={true}
            height={window.innerHeight}
            width={window.innerWidth}
            onGlobeReady={() => console.log('Globe is ready')}
          />
          
          <div className="globe-info">
            <div className="globe-title">Interactive Earth Visualization</div>
          </div>
        </>
      )}
    </div>
  );
};

export default ReactGlobeGLApp; 