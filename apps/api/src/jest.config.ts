import type { Config } from 'jest';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.(t|j)s',
    '!src/**/*.spec.ts',
    '!src/**/*.test.ts',
    '!src/**/*.module.ts',
    '!src/**/*.dto.ts',
    '!src/**/*.schema.ts',
    '!src/main.ts',
    '!src/**/index.ts',
    '!src/app.controller.ts',
    '!src/app.service.ts',
    '!src/**/*controller.ts',
    '!src/**/controllers/*.ts',
    '!src/**/*filter.ts',
    '!src/**/filters/*.ts',
    '!src/**/mappers/*.ts',
  ],
  coverageDirectory: './coverage',
  testEnvironment: 'node',
  collectCoverage: true,
  coverageThreshold: {
    global: {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95,
    },
  },
  coverageReporters: ['text', 'text-summary', 'lcov', 'html'],
  verbose: true,
};

export default config;
