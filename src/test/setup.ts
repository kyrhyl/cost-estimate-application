import '@testing-library/jest-dom'

// Setup global test utilities
global.console = {
  ...console,
  error: vi.fn(),
  warn: vi.fn(),
}

// Mock environment variables for tests
process.env.MONGODB_URI = 'mongodb://localhost:27017/test-db'
