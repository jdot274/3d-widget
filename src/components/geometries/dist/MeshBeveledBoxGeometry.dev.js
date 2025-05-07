"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MeshBeveledBoxGeometry = void 0;

var THREE = _interopRequireWildcard(require("three"));

var _BufferGeometryUtils = require("three/examples/jsm/utils/BufferGeometryUtils.js");

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

/**
 * Creates a box with beveled edges, similar to the macOS UI elements
 */
var MeshBeveledBoxGeometry =
/*#__PURE__*/
function (_THREE$BufferGeometry) {
  _inherits(MeshBeveledBoxGeometry, _THREE$BufferGeometry);

  function MeshBeveledBoxGeometry() {
    var _this;

    var width = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
    var height = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
    var depth = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;
    var bevelSize = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0.1;
    var bevelSegments = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 4;

    _classCallCheck(this, MeshBeveledBoxGeometry);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(MeshBeveledBoxGeometry).call(this));
    _this.parameters = {
      width: width,
      height: height,
      depth: depth,
      bevelSize: bevelSize,
      bevelSegments: bevelSegments
    }; // Create a properly beveled box with aesthetically pleasing proportions

    var geometry = new THREE.BoxGeometry(width - bevelSize * 2, height - bevelSize * 2, depth - bevelSize * 2, bevelSegments, bevelSegments, bevelSegments); // Create a sphere for smooth corners

    var sphere = new THREE.SphereGeometry(bevelSize, bevelSegments * 2, bevelSegments * 2); // Create bevel cylinder for edges

    var cylinder = new THREE.CylinderGeometry(bevelSize, bevelSize, 1, bevelSegments * 2); // Combine geometries

    var geometries = [];
    geometries.push(geometry); // Position corner spheres

    var hw = (width - bevelSize * 2) / 2;
    var hh = (height - bevelSize * 2) / 2;
    var hd = (depth - bevelSize * 2) / 2; // Add 8 corners

    for (var x = -1; x <= 1; x += 2) {
      for (var y = -1; y <= 1; y += 2) {
        for (var z = -1; z <= 1; z += 2) {
          var cornerSphere = sphere.clone();
          var matrix = new THREE.Matrix4().makeTranslation(x * hw, y * hh, z * hd);
          cornerSphere.applyMatrix4(matrix);
          geometries.push(cornerSphere);
        }
      }
    } // Add 12 edge cylinders
    // X-aligned edges


    for (var _y = -1; _y <= 1; _y += 2) {
      for (var _z = -1; _z <= 1; _z += 2) {
        var edgeCylinder = cylinder.clone();
        var length = width - bevelSize * 2;
        edgeCylinder.scale(1, length, 1);

        var _matrix = new THREE.Matrix4().makeRotationZ(Math.PI / 2).multiply(new THREE.Matrix4().makeTranslation(0, _y * hh, _z * hd));

        edgeCylinder.applyMatrix4(_matrix);
        geometries.push(edgeCylinder);
      }
    } // Y-aligned edges


    for (var _x = -1; _x <= 1; _x += 2) {
      for (var _z2 = -1; _z2 <= 1; _z2 += 2) {
        var _edgeCylinder = cylinder.clone();

        var _length = height - bevelSize * 2;

        _edgeCylinder.scale(1, _length, 1);

        var _matrix2 = new THREE.Matrix4().multiply(new THREE.Matrix4().makeTranslation(_x * hw, 0, _z2 * hd));

        _edgeCylinder.applyMatrix4(_matrix2);

        geometries.push(_edgeCylinder);
      }
    } // Z-aligned edges


    for (var _x2 = -1; _x2 <= 1; _x2 += 2) {
      for (var _y2 = -1; _y2 <= 1; _y2 += 2) {
        var _edgeCylinder2 = cylinder.clone();

        var _length2 = depth - bevelSize * 2;

        _edgeCylinder2.scale(1, _length2, 1);

        var _matrix3 = new THREE.Matrix4().makeRotationX(Math.PI / 2).multiply(new THREE.Matrix4().makeTranslation(_x2 * hw, _y2 * hh, 0));

        _edgeCylinder2.applyMatrix4(_matrix3);

        geometries.push(_edgeCylinder2);
      }
    } // Merge all geometries into one


    var mergedGeometry = _BufferGeometryUtils.BufferGeometryUtils.mergeBufferGeometries(geometries); // Copy the merged geometry attributes


    _this.copy(mergedGeometry); // Compute normals for smooth shading


    _this.computeVertexNormals();

    return _this;
  }

  return MeshBeveledBoxGeometry;
}(THREE.BufferGeometry);

exports.MeshBeveledBoxGeometry = MeshBeveledBoxGeometry;
//# sourceMappingURL=MeshBeveledBoxGeometry.dev.js.map
