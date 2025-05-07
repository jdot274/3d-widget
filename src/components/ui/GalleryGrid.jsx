// src/components/ui/GalleryGrid.jsx
// Grid layout for displaying app cards in the gallery

import React from 'react';
import './GalleryGrid.css';

/**
 * A responsive grid layout for displaying app cards
 * 
 * @param {Object} props - Component properties
 * @param {React.ReactNode} props.children - Child components (usually AppCards)
 * @param {string} props.title - Section title
 * @returns {JSX.Element} Gallery grid component
 */
const GalleryGrid = ({ children, title }) => {
  return (
    <div className="gallery-section">
      {title && <h2 className="gallery-title">{title}</h2>}
      <div className="gallery-grid">
        {children}
      </div>
    </div>
  );
};

export default GalleryGrid; 