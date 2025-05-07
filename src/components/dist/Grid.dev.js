"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var THREE = _interopRequireWildcard(require("three"));

var _Chip = _interopRequireDefault(require("./Chip.js"));

var _sceneConfig = _interopRequireDefault(require("../scene.config.json"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Grid =
/*#__PURE__*/
function () {
  function Grid(scene) {
    _classCallCheck(this, Grid);

    this.scene = scene;
    this.chips = [];
    this.size = _sceneConfig["default"].gridSize; // Create grid container for organization

    this.container = new THREE.Group();
    this.scene.add(this.container); // Create grid - just the chips, no debug visuals

    this.createGrid();
  }

  _createClass(Grid, [{
    key: "createGrid",
    value: function createGrid() {
      // Create chips in a grid pattern
      for (var row = 0; row < this.size; row++) {
        for (var col = 0; col < this.size; col++) {
          // Create the chip with explicit scene reference
          var chip = new _Chip["default"](row, col, this.scene);
          this.chips.push(chip);
        }
      }
    }
  }, {
    key: "getChipFromMesh",
    value: function getChipFromMesh(mesh) {
      return mesh.userData.chip;
    }
  }, {
    key: "update",
    value: function update(time) {
      // Update each chip
      for (var i = 0; i < this.chips.length; i++) {
        var chip = this.chips[i];

        if (chip && chip.update) {
          chip.update(time);
        }
      }
    }
  }, {
    key: "clear",
    value: function clear() {
      // Remove and dispose all chips
      if (this.chips && this.chips.length > 0) {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = this.chips[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var chip = _step.value;

            if (chip && chip.dispose) {
              chip.dispose();
            }
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator["return"] != null) {
              _iterator["return"]();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }

        this.chips = [];
      }
    }
  }, {
    key: "resize",
    value: function resize() {// Handle grid resizing if needed
    }
  }, {
    key: "dispose",
    value: function dispose() {
      this.clear();

      if (this.container) {
        this.scene.remove(this.container);
      }
    }
  }]);

  return Grid;
}();

var _default = Grid;
exports["default"] = _default;
//# sourceMappingURL=Grid.dev.js.map
