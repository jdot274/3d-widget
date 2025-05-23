import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import HomeScreen from './homescreen/HomeScreen';
import GalleryScreen from './homescreen/GalleryScreen';
import SphericalDesignerApp from './apps/spherical-designer/SphericalDesignerApp';
import SphericalSceneApp from './apps/spherical-scene/SphericalSceneApp';
import EditorApp from './apps/3d-editor/EditorApp';
import EarthWidgetApp from './apps/earth-widget/EarthWidgetApp';
import Earth2WidgetApp from './apps/earth2-widget/Earth2WidgetApp';
import SplineWidgetApp from './apps/spline-widget/SplineWidgetApp';
import Gallery2App from './apps/gallery2-widget/Gallery2App';
import './styles/global.css';

// Main App with app switching functionality
function App() {
  const [currentApp, setCurrentApp] = useState('home');
  
  // Handle app switching when a card is clicked
  const handleLaunchApp = (appId) => {
    setCurrentApp(appId);
  };
  
  // Return to home screen
  const handleBackToHome = () => {
    setCurrentApp('home');
  };
  
  // Render the appropriate app based on currentApp state
  const renderApp = () => {
    switch (currentApp) {
      case 'editor':
        return <EditorApp onBack={handleBackToHome} />;
      case 'gallery':
        return <GalleryScreen onBack={handleBackToHome} />;
      case 'gallery2':
        return <Gallery2App onBack={handleBackToHome} />;
      case 'spherical_designer':
        return <SphericalDesignerApp onBack={handleBackToHome} />;
      case 'spherical_scene':
        return <SphericalSceneApp onBack={handleBackToHome} />;
      case 'three-globe-earth':
        return <EarthWidgetApp onBack={handleBackToHome} />;
      case 'three-globe-earth2':
        return <Earth2WidgetApp onBack={handleBackToHome} />;
      case 'spline-widget':
        return <SplineWidgetApp onBack={handleBackToHome} />;
      case 'home':
      default:
        return <HomeScreen onLaunchApp={handleLaunchApp} />;
    }
  };
  
  return renderApp();
}

createRoot(document.getElementById('root')).render(<App />); 