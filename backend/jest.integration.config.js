module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'test',
  testRegex: '.integration-spec.ts$',
  transform: {
    '^.+\.(t|j)s$': 'ts-jest',
  },
  testEnvironment: 'node',
  collectCoverageFrom: ['../src/**/*.service.ts'],
  coverageDirectory: '../coverage/integration',
};
