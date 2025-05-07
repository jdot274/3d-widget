// src/components/ui/AppCard.jsx
// Reusable card component for displaying apps in the home screen

import React from 'react';
import { Link } from 'react-router-dom';
import './AppCard.css';

/**
 * A card component for displaying an app in the home screen gallery
 * 
 * @param {Object} props - Component properties
 * @param {string} props.title - The title of the app
 * @param {string} props.description - Short description of the app
 * @param {string} props.thumbnail - URL to the app thumbnail image
 * @param {string} props.path - Path to navigate to when clicked
 * @param {string} props.bgColor - Background color (optional)
 * @returns {JSX.Element} App card component
 */
const AppCard = ({ 
  title, 
  description, 
  thumbnail, 
  path, 
  bgColor = 'rgba(30, 30, 40, 0.7)' 
}) => {
  return (
    <Link to={path} className="app-card-link">
      <div 
        className="app-card" 
        style={{ 
          backgroundColor: bgColor,
        }}
      >
        <div className="app-card-thumbnail">
          {thumbnail ? (
            <img src={thumbnail} alt={`${title} thumbnail`} />
          ) : (
            <div className="app-card-thumbnail-placeholder">
              {title.charAt(0)}
            </div>
          )}
        </div>
        <div className="app-card-content">
          <h3 className="app-card-title">{title}</h3>
          <p className="app-card-description">{description}</p>
        </div>
        <div className="app-card-footer">
          <button className="app-card-button">Open</button>
        </div>
      </div>
    </Link>
  );
};

export default AppCard; 