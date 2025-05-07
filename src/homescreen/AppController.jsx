// src/homescreen/AppController.jsx
import React from 'react';

const AppController = () => {
  return (
    <div id="app-controller" className="app-controller" style={{ 
      width: '100vw', 
      height: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      fontSize: '2em', 
      color: 'black', 
      backgroundColor: 'white', 
      border: '5px solid red' 
    }}>
      Hello from Simple AppController!
    </div>
  );
};

export default AppController; 