/** @type {import('jest').Config} */
const config = {
  transform: {
    '^.+\.jsx?$': ['babel-jest', { rootMode: 'upward' }]
  },
  transformIgnorePatterns: [
    'node_modules/(?!(rxjs)/)'
  ],
  testEnvironment: 'node',
  moduleFileExtensions: ['js', 'jsx', 'json', 'node'],
  moduleDirectories: ['node_modules', 'src'],
  verbose: true,
  extensionsToTreatAsEsm: ['.jsx'],
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
  setupFiles: []
};

export default config;