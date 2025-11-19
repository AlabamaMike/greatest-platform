module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests/integration', '<rootDir>/tests/e2e'],
  testMatch: ['**/*.integration.test.ts', '**/*.e2e.test.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverageFrom: [
    'services/**/src/**/*.{ts,tsx}',
    '!services/**/src/**/*.d.ts',
    '!services/**/src/**/index.ts',
    '!**/node_modules/**',
    '!**/dist/**',
  ],
  coverageDirectory: 'coverage/integration',
  coverageReporters: ['text', 'lcov', 'html'],
  testTimeout: 60000,
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  maxWorkers: 1,
  runInBand: true,
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js', '<rootDir>/tests/e2e/setup.ts'],
  globalTeardown: '<rootDir>/tests/e2e/teardown.ts',
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: {
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
        },
      },
    ],
  },
};
