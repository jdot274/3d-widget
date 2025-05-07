import * as THREE from 'three';
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

/**
 * Creates a box with beveled edges, similar to the macOS UI elements
 */
export class MeshBeveledBoxGeometry extends THREE.BufferGeometry {
  constructor(width = 1, height = 1, depth = 1, bevelSize = 0.1, bevelSegments = 4) {
    super();
    
    this.parameters = {
      width: width,
      height: height,
      depth: depth,
      bevelSize: bevelSize,
      bevelSegments: bevelSegments
    };
    
    // Create a properly beveled box with aesthetically pleasing proportions
    const geometry = new THREE.BoxGeometry(
      width - bevelSize * 2, 
      height - bevelSize * 2, 
      depth - bevelSize * 2, 
      bevelSegments, 
      bevelSegments, 
      bevelSegments
    );
    
    // Create a sphere for smooth corners
    const sphere = new THREE.SphereGeometry(
      bevelSize, 
      bevelSegments * 2, 
      bevelSegments * 2
    );
    
    // Create bevel cylinder for edges
    const cylinder = new THREE.CylinderGeometry(
      bevelSize, 
      bevelSize, 
      1, 
      bevelSegments * 2
    );
    
    // Combine geometries
    const geometries = [];
    geometries.push(geometry);
    
    // Position corner spheres
    const hw = (width - bevelSize * 2) / 2;
    const hh = (height - bevelSize * 2) / 2;
    const hd = (depth - bevelSize * 2) / 2;
    
    // Add 8 corners
    for (let x = -1; x <= 1; x += 2) {
      for (let y = -1; y <= 1; y += 2) {
        for (let z = -1; z <= 1; z += 2) {
          const cornerSphere = sphere.clone();
          const matrix = new THREE.Matrix4().makeTranslation(
            x * hw,
            y * hh,
            z * hd
          );
          cornerSphere.applyMatrix4(matrix);
          geometries.push(cornerSphere);
        }
      }
    }
    
    // Add 12 edge cylinders
    // X-aligned edges
    for (let y = -1; y <= 1; y += 2) {
      for (let z = -1; z <= 1; z += 2) {
        const edgeCylinder = cylinder.clone();
        const length = width - bevelSize * 2;
        edgeCylinder.scale(1, length, 1);
        const matrix = new THREE.Matrix4()
          .makeRotationZ(Math.PI / 2)
          .multiply(new THREE.Matrix4().makeTranslation(
            0,
            y * hh,
            z * hd
          ));
        edgeCylinder.applyMatrix4(matrix);
        geometries.push(edgeCylinder);
      }
    }
    
    // Y-aligned edges
    for (let x = -1; x <= 1; x += 2) {
      for (let z = -1; z <= 1; z += 2) {
        const edgeCylinder = cylinder.clone();
        const length = height - bevelSize * 2;
        edgeCylinder.scale(1, length, 1);
        const matrix = new THREE.Matrix4()
          .multiply(new THREE.Matrix4().makeTranslation(
            x * hw,
            0,
            z * hd
          ));
        edgeCylinder.applyMatrix4(matrix);
        geometries.push(edgeCylinder);
      }
    }
    
    // Z-aligned edges
    for (let x = -1; x <= 1; x += 2) {
      for (let y = -1; y <= 1; y += 2) {
        const edgeCylinder = cylinder.clone();
        const length = depth - bevelSize * 2;
        edgeCylinder.scale(1, length, 1);
        const matrix = new THREE.Matrix4()
          .makeRotationX(Math.PI / 2)
          .multiply(new THREE.Matrix4().makeTranslation(
            x * hw,
            y * hh,
            0
          ));
        edgeCylinder.applyMatrix4(matrix);
        geometries.push(edgeCylinder);
      }
    }
    
    // Merge all geometries into one
    const mergedGeometry = BufferGeometryUtils.mergeBufferGeometries(geometries);
    
    // Copy the merged geometry attributes
    this.copy(mergedGeometry);
    
    // Compute normals for smooth shading
    this.computeVertexNormals();
  }
} 