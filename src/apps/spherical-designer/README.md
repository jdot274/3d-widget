# Spherical Designer

A powerful 3D design tool that bridges the gap between 2D design intent and 3D visualization. Create beautiful glass-like spherical objects with intuitive tools and real-time 3D preview.

## Features

### 2D Design Tools
- **Gradient Tool**: Click and drag to create directional gradients
- **Inner Shadow Tool**: Add depth with customizable inner shadows
- **Brush Tool**: Direct painting with adjustable size and opacity
- **One-Click Glass Effect**: Apply a complete glass material with a single click
- **Texture Grain**: Add subtle noise for realistic glass imperfections

### 3D Preview & Material Controls
- **Real-time 3D Preview**: See your design applied to a 3D sphere instantly
- **Interactive Camera**: Orbit around your creation to view from any angle
- **Material Properties**: Fine-tune physical properties:
  - Roughness: Control surface smoothness
  - Metalness: Add metallic qualities
  - Transmission: Adjust transparency
  - Clearcoat: Add glossy finish

### Material Presets
- Silver Glass
- macOS Blur
- Frosted Blue
- Crystal Clear
- Glowing Blue

### Export Options
- Export as Image (PNG)
- Export as Design JSON (with material properties)
- Import previously saved designs

## How It Works

The Spherical Designer analyzes your 2D design's visual properties and automatically translates them into 3D material properties:

1. **Edge Detection**: Bright edges and highlights inform the roughness and clearcoat properties
2. **Color Analysis**: Color distribution helps determine transmission and environment mapping
3. **Equirectangular Mapping**: Your 2D design is mapped to a sphere for accurate visualization

## Integration with Glass Grid Widget

The Spherical Designer is a core component of the glass-grid-widget project, allowing you to:

1. Create custom glass-like materials for use in grid cells
2. Design spherical elements that integrate with the transparent UI system
3. Experiment with material properties before applying them to other components

The materials created in the Spherical Designer can be exported and used with:
- GlassSphere components
- Grid cell backgrounds
- Custom UI elements

## Getting Started

1. Use the 2D editor to create your design
2. Preview in 3D to see how it looks on a sphere
3. Adjust material properties for the perfect look
4. Export your design for use in other components

## Technical Details

- Built with React and Three.js
- Uses React Three Fiber for 3D rendering
- Implements physically-based rendering (PBR) materials
- Canvas-based 2D editor with custom tools 