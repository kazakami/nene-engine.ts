module.exports = {
    "roots": [
      "<rootDir>/src"
    ],
    "transform": {
      "^.+\\.ts$": "ts-jest"
    },
    "testRegex": "\\.test\\.ts$",
    "moduleFileExtensions": [
      "ts",
      "js",
      "json",
      "node"
    ],
    "moduleNameMapper": {
      "imports-loader?.*": "<rootDir>/src/test/importsLoader.js",
      "GLTFLoader": "<rootDir>/src/test/emptyMock.js",
      "MTLLoader": "<rootDir>/src/test/emptyMock.js",
      "OBJLoader": "<rootDir>/src/test/emptyMock.js"
    },
    "setupFiles": ["jest-canvas-mock"]
  }
