"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.glassMaterials = exports.createGlassMaterial = void 0;

var THREE = _interopRequireWildcard(require("three"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * Factory function to create customizable glass materials
 * @param {Object} options - Material customization options
 * @returns {MeshPhysicalMaterial} Configured glass material
 */
var createGlassMaterial = function createGlassMaterial() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var defaults = {
    color: '#ffffff',
    metalness: 0.1,
    roughness: 0.05,
    transmission: 0.9,
    thickness: 0.5,
    ior: 1.5,
    envMapIntensity: 1.0,
    clearcoat: 0.5,
    clearcoatRoughness: 0.04,
    transparent: true,
    opacity: 0.9,
    side: THREE.DoubleSide
  };

  var config = _objectSpread({}, defaults, {}, options);

  if (typeof config.color === 'string') {
    config.color = new THREE.Color(config.color);
  }

  return new THREE.MeshPhysicalMaterial(config);
}; // Predefined material presets


exports.createGlassMaterial = createGlassMaterial;
var glassMaterials = {
  // Silver 3D (Highly Reflective Metallic Glass)
  silver: createGlassMaterial({
    color: '#ffffff',
    metalness: 1.0,
    roughness: 0.05,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    reflectivity: 1.0,
    envMapIntensity: 1.2,
    opacity: 0.9
  }),
  // macOS Foggy/Dark Glass (Frosted, Subtle, Modern)
  macOS: createGlassMaterial({
    color: '#2A2A2A',
    metalness: 0.1,
    roughness: 0.7,
    transmission: 0.6,
    opacity: 0.85,
    ior: 1.5,
    thickness: 0.3,
    envMapIntensity: 0.5,
    clearcoat: 0.3,
    clearcoatRoughness: 0.4,
    sheen: 0.8,
    sheenColor: new THREE.Color('#FFFFFF'),
    sheenRoughness: 0.1
  }),
  // Frosted Blue Glass (Soft, Bright, iOS/Home Icon Style)
  frostedBlue: createGlassMaterial({
    color: '#6EC1FF',
    metalness: 0.0,
    roughness: 0.55,
    transmission: 0.85,
    opacity: 0.85,
    ior: 1.45,
    thickness: 0.35,
    envMapIntensity: 0.4,
    clearcoat: 0.15,
    clearcoatRoughness: 0.25,
    sheen: 0.5,
    sheenColor: new THREE.Color('#FFFFFF'),
    sheenRoughness: 0.2
  }),
  // Clear Glass
  clear: createGlassMaterial({
    color: '#ffffff',
    metalness: 0.0,
    roughness: 0.1,
    transmission: 0.95,
    opacity: 0.95,
    ior: 1.5,
    thickness: 0.2,
    envMapIntensity: 0.6
  }),
  // Glowing Blue Button
  glowingBlue: createGlassMaterial({
    color: '#4A90E2',
    metalness: 0.0,
    roughness: 0.7,
    transmission: 0.92,
    opacity: 0.9,
    ior: 1.35,
    thickness: 0.8,
    envMapIntensity: 0.3,
    emissive: new THREE.Color('#87CEFA'),
    emissiveIntensity: 0.7,
    clearcoat: 0.1,
    clearcoatRoughness: 0.5
  })
};
exports.glassMaterials = glassMaterials;
var _default = glassMaterials;
exports["default"] = _default;
//# sourceMappingURL=glass.dev.js.map
