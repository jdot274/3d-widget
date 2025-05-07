// src/App.jsx
// Main application with routing between different 3D pages

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import GalleryPage from './pages/GalleryPage';
import EditorApp from '../apps/editor/App';
import './App.css';

/**
 * Main application component with routing
 */
const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/apps/editor" element={<EditorApp />} />
        <Route path="/apps/gallery" element={<GalleryPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App; 