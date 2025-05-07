import * as THREE from 'three';
import Chip from './Chip.js';
import config from '../scene.config.json';

class Grid {
  constructor(scene) {
    this.scene = scene;
    this.chips = [];
    this.size = config.gridSize;
    
    // Create grid container for organization
    this.container = new THREE.Group();
    this.scene.add(this.container);
    
    // Create grid - just the chips, no debug visuals
    this.createGrid();
  }
  
  createGrid() {
    // Create chips in a grid pattern
    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        // Create the chip with explicit scene reference
        const chip = new Chip(row, col, this.scene);
        this.chips.push(chip);
      }
    }
  }
  
  getChipFromMesh(mesh) {
    return mesh.userData.chip;
  }
  
  update(time) {
    // Update each chip
    for (let i = 0; i < this.chips.length; i++) {
      const chip = this.chips[i];
      if (chip && chip.update) {
        chip.update(time);
      }
    }
  }
  
  clear() {
    // Remove and dispose all chips
    if (this.chips && this.chips.length > 0) {
      for (const chip of this.chips) {
        if (chip && chip.dispose) {
          chip.dispose();
        }
      }
      this.chips = [];
    }
  }
  
  resize() {
    // Handle grid resizing if needed
  }
  
  dispose() {
    this.clear();
    if (this.container) {
      this.scene.remove(this.container);
    }
  }
}

export default Grid; 