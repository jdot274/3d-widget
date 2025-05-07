import React from 'react';

/**
 * A consistent back button used across app screens
 * @param {Object} props - Component props
 * @param {Function} props.onClick - Function to call when button is clicked
 * @param {string} [props.label="Return Home"] - Button label
 * @param {Object} [props.style] - Additional styles
 */
const BackButton = ({ onClick, label = "Return Home", style = {} }) => {
  return (
    <button 
      onClick={onClick} 
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        padding: '10px 15px',
        background: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        zIndex: 1000,
        fontSize: '16px',
        fontWeight: '500',
        backdropFilter: 'blur(5px)',
        transition: 'all 0.2s ease',
        ...style
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.background = 'rgba(0, 0, 0, 0.8)';
        e.currentTarget.style.transform = 'scale(1.05)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.background = 'rgba(0, 0, 0, 0.7)';
        e.currentTarget.style.transform = 'scale(1)';
      }}
    >
      {label}
    </button>
  );
};

export default BackButton; 