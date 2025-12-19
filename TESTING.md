# Testing Guide

## Test Structure

This project contains two types of tests:

### Unit Tests
Located in: `src/lib/calc/__tests__/`

These tests verify calculation logic and business rules without dependencies on external services.

**Run unit tests:**
```bash
npm test
# or
npx vitest run
```

### Integration Tests  
Located in: 
- `src/app/api/master/__tests__/`
- `tests/integration/`

These tests verify full API functionality including database operations and require a running Next.js server with MongoDB connection.

## Running Integration Tests

Integration tests are **excluded by default** to allow unit tests to run quickly without server dependencies.

### Prerequisites
1. Ensure MongoDB is running and accessible
2. Set `MONGODB_URI` environment variable
3. Start the Next.js development server in one terminal:
   ```bash
   npm run dev
   ```

### Run Integration Tests
In a separate terminal:
```bash
npm run test:integration
# or
npm run test:integration:watch
```

## Test Configuration

The test configuration in `vitest.config.ts` excludes integration tests by default:
- `**/tests/integration/**`
- `**/src/app/api/**/\__tests\__/**`

To include them temporarily, you can modify the `exclude` array in the config file.

## Writing Tests

### Unit Tests
- Should test pure functions and calculation logic
- Should not require database or external services
- Use mocks for dependencies
- Fast execution (<1s)

### Integration Tests
- Test full API routes with real database
- Verify end-to-end functionality
- Use test database (never production!)
- Slower execution acceptable

## Coverage

Generate coverage report:
```bash
npm run test:coverage
```

## Test Scripts

| Script | Description |
|--------|-------------|
| `npm test` | Run unit tests in watch mode |
| `npm run test:ui` | Run tests with Vitest UI |
| `npm run test:coverage` | Generate coverage report |
| `npm run test:integration` | Run integration tests (requires server) |
| `npm run test:integration:watch` | Run integration tests in watch mode |

## Current Test Status

✅ **Unit Tests**: All passing (21/21)
- Labor cost calculations
- Equipment cost calculations  
- Material cost calculations
- Direct cost summation
- Add-ons computation (DPWH formula)
- Currency formatting

⚠️ **Integration Tests**: Require server setup
- Materials API (24 tests)
- Labor Rates API (19 tests)
- Material Prices API (28 tests)
- Equipment API (20 tests)
- DUPA Template workflow (6 tests)

## Troubleshooting

### "ECONNREFUSED ::1:3000" Error
This means integration tests are trying to connect to the Next.js server but it's not running.

**Solution:**
1. Start the dev server: `npm run dev`
2. Run integration tests in separate terminal: `npm run test:integration`

### MongoDB Connection Errors
Ensure MongoDB is running and `MONGODB_URI` is set correctly in your environment.

### Tests Running Slowly
Unit tests should be fast. If slow:
1. Check that integration tests are excluded in `vitest.config.ts`
2. Verify you're running `npm test` not `npm run test:integration`
