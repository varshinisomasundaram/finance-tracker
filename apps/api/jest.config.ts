import type { Config } from 'jest'

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        rootDir: '.',
        paths: {
          '@/*': ['./src/*']
        }
      }
    }]
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/server.ts'
  ],
  globalSetup: '<rootDir>/tests/helpers/globalSetup.ts',
  globalTeardown: '<rootDir>/tests/helpers/globalTeardown.ts',
  setupFilesAfterEnv: [],
  testTimeout: 30000
}

export default config
