import React, { useState, useEffect } from 'react';
import WeatherEcosystemApp from './WeatherEcosystemApp';
import './styles/WeatherEcosystem.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    console.error("Error in WeatherEcosystemApp:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="weather-ecosystem-app" style={{ padding: '20px', color: 'white' }}>
          <h2>Something went wrong.</h2>
          <details style={{ whiteSpace: 'pre-wrap', marginTop: '20px' }}>
            <summary>Error Details</summary>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </details>
          <button 
            onClick={() => this.setState({ hasError: false })}
            style={{
              marginTop: '20px',
              padding: '8px 16px',
              background: 'rgba(0,0,0,0.7)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const WeatherEcosystemWrapper = () => {
  const [loading, setLoading] = useState(true);
  const [textures, setTextures] = useState({
    dayLoaded: false,
    cloudsLoaded: false
  });

  // Preload textures to check if they're available
  useEffect(() => {
    const checkTextures = async () => {
      try {
        console.log("Checking if textures are available...");
        
        // Check day texture
        const dayResponse = await fetch('/textures/earth-blue-marble.jpg', { method: 'HEAD' });
        const dayLoaded = dayResponse.ok;
        
        // Check clouds texture
        const cloudsResponse = await fetch('/textures/earth-clouds.png', { method: 'HEAD' });
        const cloudsLoaded = cloudsResponse.ok;
        
        setTextures({
          dayLoaded,
          cloudsLoaded
        });
        
        console.log("Texture check complete:", {
          dayLoaded,
          cloudsLoaded
        });
        
        setLoading(false);
      } catch (error) {
        console.error("Error checking textures:", error);
        setLoading(false);
      }
    };
    
    checkTextures();
  }, []);

  if (loading) {
    return (
      <div className="weather-ecosystem-app" style={{ color: 'white', textAlign: 'center', paddingTop: '100px' }}>
        <h2>Loading Weather Ecosystem...</h2>
        <p>Checking texture availability...</p>
      </div>
    );
  }

  const hasTextureIssues = !textures.dayLoaded || !textures.cloudsLoaded;

  if (hasTextureIssues) {
    return (
      <div className="weather-ecosystem-app" style={{ color: 'white', padding: '20px' }}>
        <h2>Texture Loading Issues</h2>
        <p>The following textures could not be loaded:</p>
        <ul>
          {!textures.dayLoaded && <li>/textures/earth-blue-marble.jpg</li>}
          {!textures.cloudsLoaded && <li>/textures/earth-clouds.png</li>}
        </ul>
        <p>
          Please verify that these files exist in the public/textures directory
          and that the paths are correct.
        </p>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <WeatherEcosystemApp />
    </ErrorBoundary>
  );
};

export default WeatherEcosystemWrapper; 