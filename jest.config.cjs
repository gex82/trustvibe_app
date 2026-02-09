/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/packages/shared/src', '<rootDir>/functions/src'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.base.json' }],
  },
  moduleNameMapper: {
    '^@trustvibe/shared$': '<rootDir>/packages/shared/src/index.ts',
    '^@trustvibe/shared/(.*)$': '<rootDir>/packages/shared/src/$1',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
};
