# E2E Tests for Nexus Platform

This directory contains end-to-end (E2E) tests for the Nexus Platform microservices.

## Setup

### Prerequisites

- Node.js >= 20.0.0
- Docker and Docker Compose
- npm >= 10.0.0

### Installation

```bash
# Install dependencies
npm install

# Install additional test dependencies
npm install --save-dev axios pg
```

### Starting Test Environment

Start the test databases:

```bash
docker-compose -f docker-compose.test.yml up -d
```

Wait for services to be healthy:

```bash
docker-compose -f docker-compose.test.yml ps
```

### Starting Application Services

You need to start the application services before running E2E tests:

```bash
# Option 1: Start all services with Docker
docker-compose up -d

# Option 2: Start services individually for development
npm run dev:services
```

## Running Tests

### Run all E2E tests

```bash
npm run test:integration
```

### Run specific test file

```bash
npm run test:integration -- tests/e2e/auth.e2e.test.ts
```

### Run with coverage

```bash
npm run test:integration -- --coverage
```

### Run in watch mode

```bash
npm run test:integration -- --watch
```

## Test Structure

```
tests/e2e/
├── helpers/
│   ├── api-client.ts       # HTTP client for API calls
│   ├── database.ts         # Database utilities
│   └── test-data.ts        # Test data generators
├── auth.e2e.test.ts        # Auth service tests
├── healthcare.e2e.test.ts  # Healthcare service tests
├── ai-ml.e2e.test.ts       # AI/ML service tests
├── services-integration.e2e.test.ts  # Cross-service tests
├── setup.ts                # Test setup
└── teardown.ts             # Test cleanup
```

## Writing Tests

### Test File Template

```typescript
import { getServiceClient } from './helpers/api-client';
import { generateTestUser } from './helpers/test-data';

describe('Service Name E2E Tests', () => {
  let client: ReturnType<typeof getServiceClient>;

  beforeAll(() => {
    client = getServiceClient();
  });

  describe('Feature', () => {
    it('should do something', async () => {
      const response = await client.get('/endpoint');
      expect(response.status).toBe(200);
    });
  });
});
```

### Best Practices

1. **Isolation**: Each test should be independent
2. **Cleanup**: Clean up test data after tests
3. **Realistic**: Use realistic test data
4. **Assertions**: Check both success and error cases
5. **Timeouts**: Set appropriate timeouts for async operations
6. **Environment**: Use `.env.test` for test configuration

## Debugging

### Enable verbose logging

```bash
LOG_LEVEL=debug npm run test:integration
```

### Debug specific test

```bash
node --inspect-brk node_modules/.bin/jest tests/e2e/auth.e2e.test.ts
```

### Check service logs

```bash
docker-compose logs -f auth
```

## Troubleshooting

### Tests failing with connection errors

- Ensure all services are running: `docker-compose ps`
- Check service health: `docker-compose logs service-name`
- Verify ports are not in use: `lsof -i :3001`

### Database errors

- Reset test database:
  ```bash
  docker-compose -f docker-compose.test.yml down -v
  docker-compose -f docker-compose.test.yml up -d
  ```

### Tests timing out

- Increase timeout in jest.integration.config.js
- Check if services are responding: `curl http://localhost:3001/health`

## CI/CD Integration

The E2E tests run automatically in GitHub Actions on:
- Pull requests
- Pushes to main branch
- Manual workflow dispatch

See `.github/workflows/ci-cd.yml` for configuration.

## Coverage Goals

- Target: 80% coverage across all services
- Critical paths: 100% coverage
- Error handling: All error cases tested

## Contributing

1. Write tests for new features
2. Ensure tests pass locally
3. Update this README if adding new test patterns
4. Follow existing test structure and naming conventions
