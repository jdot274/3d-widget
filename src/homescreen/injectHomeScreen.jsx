// src/homescreen/injectHomeScreen.jsx
// This file injects our HomeScreen functionality without disrupting the main app

import React from 'react';
import { createRoot } from 'react-dom/client';
import AppController from './AppController'; // Restore AppController import

// Create home screen container if it doesn't exist (can be uncommented later if needed)
/*
const createHomeContainer = () => {
  if (!document.getElementById('home-screen-root')) {
    const container = document.createElement('div');
    container.id = 'home-screen-root';
    document.body.appendChild(container);
    return container;
  }
  return document.getElementById('home-screen-root');
};
*/

// Inject our app controller
const injectHomeScreen = () => {
  // Wait for the DOM to be fully loaded
  window.addEventListener('DOMContentLoaded', () => {
    console.log('Injecting home screen functionality with AppController...');
    
    // Use a simple div for now, or re-enable createHomeContainer if preferred
    let container = document.getElementById('home-screen-root');
    if (!container) {
      container = document.createElement('div');
      container.id = 'home-screen-root'; 
      container.style.width = '100vw'; // Ensure it has dimensions
      container.style.height = '100vh';
      document.body.appendChild(container);
    }

    const root = createRoot(container);
    root.render(<AppController />); // Render the (still simplified) AppController
    console.log('AppController render call initiated.');
  });
};

// Auto-execute
injectHomeScreen(); 