module.exports = {
    testEnvironment: "node",
    "watchPathIgnorePatterns": [
        "<rootDir>/dist"
    ],
    transform: {
        '\\.[jt]sx?$': 'babel-jest',
    },
    coverageDirectory: "coverage",
    coverageProvider: "v8",
    coverageThreshold: {
        "global": {
            "branches": 100,
            "functions": 100,
            "lines": 100,
            "statements": 100
        }
    },
}