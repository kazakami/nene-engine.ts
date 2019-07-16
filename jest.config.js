module.exports = {
    "roots": [
      "<rootDir>/src/main"
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
      "imports-loader?.*": "<rootDir>/src/main/test/importsLoader.js",
      "GLTFLoader": "<rootDir>/src/main/test/emptyMock.js",
      "MTLLoader": "<rootDir>/src/main/test/emptyMock.js",
      "OBJLoader": "<rootDir>/src/main/test/emptyMock.js",
      "EffectComposer": "<rootDir>/src/main/test/emptyMock.js"
    },
    "setupFiles": ["jest-canvas-mock"]
  }
