// jest.unit.config.js
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src', // This means Jest will look for tests in the src directory
  testRegex: '.spec.ts$', // Match files ending with .spec.ts
  transform: {
    '^.+\.(t|j)s$': 'ts-jest',
  },
  testEnvironment: 'node',
  collectCoverageFrom: ['**/*.service.ts'],
  coverageDirectory: '../coverage/unit',
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
