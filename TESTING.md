# Testing Guide

This document provides comprehensive guidance on testing in the Nexus Platform.

## Table of Contents

- [Overview](#overview)
- [Testing Strategy](#testing-strategy)
- [Setup](#setup)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [Coverage Reports](#coverage-reports)
- [CI/CD Integration](#cicd-integration)
- [Best Practices](#best-practices)

## Overview

The Nexus Platform implements a comprehensive testing strategy with three layers:

1. **Unit Tests**: Test individual components in isolation
2. **Integration Tests**: Test service interactions and workflows
3. **End-to-End (E2E) Tests**: Test complete user journeys

### Test Coverage Goals

- **Minimum Coverage**: 70% across all services
- **Target Coverage**: 80%+
- **Critical Paths**: 90%+ coverage required

## Testing Strategy

### Unit Tests

Unit tests verify individual functions, methods, and components in isolation.

**Technologies:**
- **Node.js Services**: Jest + Supertest
- **Python Services**: Pytest
- **Go Services**: Go testing + Testify

**What to Test:**
- Controllers and handlers
- Business logic
- Utility functions
- Middleware
- Data validation
- Error handling

### Integration Tests

Integration tests verify that services work correctly together.

**Technologies:**
- Jest + Testcontainers
- Supertest for API testing
- Docker containers for databases

**What to Test:**
- API endpoints
- Database interactions
- Service-to-service communication
- Event publishing/subscribing (Kafka)
- Cache operations (Redis)

### E2E Tests

E2E tests verify complete user workflows through the UI.

**Technologies:**
- Playwright

**What to Test:**
- User authentication flows
- Critical user journeys
- Cross-service workflows
- UI interactions

## Setup

### Prerequisites

```bash
# Install Node.js 20+
node --version

# Install Python 3.11+
python --version

# Install Go 1.21+
go version

# Install Docker (for integration tests)
docker --version
```

### Installation

```bash
# Install root dependencies
npm install

# Install service-specific dependencies
cd services/auth && npm install
cd ../healthcare && npm install
cd ../economic && npm install
cd ../education && npm install

# Install Python dependencies
cd ../data-analytics && pip install -r requirements.txt

# Install Go dependencies
cd ../crisis && go mod download

# Install Playwright browsers (for E2E tests)
npx playwright install
```

## Running Tests

### Run All Tests

```bash
# Run all tests (unit + integration + E2E)
npm run test:all
```

### Unit Tests

```bash
# Run all unit tests
npm run test:unit

# Run tests for specific service
cd services/auth && npm test
cd services/healthcare && npm test
cd services/economic && npm test
cd services/education && npm test

# Python service
cd services/data-analytics && pytest

# Go service
cd services/crisis && go test ./...
```

### Integration Tests

```bash
# Run integration tests
npm run test:integration

# Run with Docker containers
docker-compose -f docker-compose.test.yml up -d
npm run test:integration
docker-compose -f docker-compose.test.yml down
```

### E2E Tests

```bash
# Run E2E tests
npm run test:e2e

# Run specific E2E test file
npx playwright test tests/e2e/auth.spec.ts

# Run in headed mode (with browser UI)
npx playwright test --headed

# Run in debug mode
npx playwright test --debug
```

### Watch Mode

```bash
# Run tests in watch mode (auto-rerun on changes)
npm run test:watch

# Service-specific watch mode
cd services/auth && npm run test:watch
```

### Coverage

```bash
# Generate coverage report
npm run test:coverage

# View HTML coverage report
open coverage/index.html
```

## Writing Tests

### Unit Test Examples

#### Node.js/TypeScript (Jest)

```typescript
// services/auth/src/__tests__/controllers/auth.controller.test.ts
import { AuthController } from '../../controllers/auth.controller';

describe('AuthController', () => {
  let authController: AuthController;

  beforeEach(() => {
    authController = new AuthController();
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      // Arrange
      const mockRequest = {
        body: {
          email: 'test@example.com',
          password: 'Password123!',
          fullName: 'Test User',
        },
      };
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      // Act
      await authController.register(mockRequest, mockResponse);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            user: expect.any(Object),
            accessToken: expect.any(String),
          }),
        })
      );
    });
  });
});
```

#### Python (Pytest)

```python
# services/data-analytics/tests/test_main.py
import pytest
from fastapi.testclient import TestClient
from main import app

@pytest.fixture
def client():
    return TestClient(app)

def test_health_check(client):
    """Test the health check endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_get_sdg_data(client):
    """Test getting SDG data."""
    response = client.get("/api/v1/data/sdg/3")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["goal"] == 3
```

#### Go (Testing + Testify)

```go
// services/crisis/handlers/incidents_test.go
package handlers

import (
    "testing"
    "github.com/stretchr/testify/assert"
)

func TestCreateIncident(t *testing.T) {
    // Arrange
    app := setupTestApp()
    payload := map[string]interface{}{
        "type": "flood",
        "severity": "high",
    }

    // Act
    resp := makeRequest(app, "POST", "/incidents", payload)

    // Assert
    assert.Equal(t, 201, resp.StatusCode)
}
```

### Integration Test Example

```typescript
// tests/integration/auth-service.integration.test.ts
import request from 'supertest';

describe('Auth Service Integration', () => {
  const baseUrl = 'http://localhost:3001';

  it('should complete full registration and login flow', async () => {
    // Register
    const userData = {
      email: `test${Date.now()}@example.com`,
      password: 'TestPassword123!',
      fullName: 'Integration Test User',
    };

    const registerResponse = await request(baseUrl)
      .post('/api/v1/auth/register')
      .send(userData)
      .expect(201);

    expect(registerResponse.body.data.accessToken).toBeDefined();

    // Login
    const loginResponse = await request(baseUrl)
      .post('/api/v1/auth/login')
      .send({
        email: userData.email,
        password: userData.password,
      })
      .expect(200);

    expect(loginResponse.body.data.accessToken).toBeDefined();

    // Access protected route
    const profileResponse = await request(baseUrl)
      .get('/api/v1/auth/profile')
      .set('Authorization', `Bearer ${loginResponse.body.data.accessToken}`)
      .expect(200);

    expect(profileResponse.body.data.email).toBe(userData.email);
  });
});
```

### E2E Test Example

```typescript
// tests/e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test('user registration flow', async ({ page }) => {
  // Navigate to registration
  await page.goto('/');
  await page.click('text=Sign Up');

  // Fill form
  await page.fill('input[name="email"]', 'e2e@example.com');
  await page.fill('input[name="password"]', 'Password123!');
  await page.fill('input[name="fullName"]', 'E2E Test User');

  // Submit
  await page.click('button[type="submit"]');

  // Verify redirect
  await expect(page).toHaveURL(/dashboard/);
  await expect(page.locator('text=Welcome')).toBeVisible();
});
```

## Coverage Reports

### Viewing Coverage

```bash
# Generate coverage
npm run test:coverage

# View HTML report (Node.js)
open coverage/index.html

# View Python coverage
open services/data-analytics/htmlcov/index.html

# View Go coverage
cd services/crisis && go tool cover -html=coverage.out
```

### Coverage Thresholds

Coverage thresholds are enforced in `jest.config.js`:

```javascript
coverageThreshold: {
  global: {
    branches: 70,
    functions: 70,
    lines: 70,
    statements: 70,
  },
}
```

### CI Coverage Reports

Coverage reports are automatically:
- Uploaded to Codecov
- Commented on pull requests
- Tracked over time

## CI/CD Integration

### GitHub Actions

Tests run automatically on:
- Every push to `main`, `develop`, or `claude/**` branches
- Every pull request
- Manual workflow dispatch

### Workflow Structure

1. **Unit Tests** (parallel)
   - Node.js services
   - Python services
   - Go services

2. **Integration Tests** (after unit tests)
   - Spins up test databases
   - Runs cross-service tests

3. **E2E Tests** (after integration tests)
   - Installs Playwright browsers
   - Runs full user journey tests

4. **Coverage Report**
   - Aggregates coverage from all tests
   - Uploads to Codecov
   - Comments on PR

### Badges

Add badges to README:

```markdown
[![Test Coverage](https://codecov.io/gh/org/repo/branch/main/graph/badge.svg)](https://codecov.io/gh/org/repo)
[![Tests](https://github.com/org/repo/actions/workflows/test.yml/badge.svg)](https://github.com/org/repo/actions)
```

## Best Practices

### General Guidelines

1. **Test Naming**: Use descriptive test names
   ```typescript
   it('should return 401 when token is invalid')
   // Better than: it('test auth')
   ```

2. **AAA Pattern**: Arrange, Act, Assert
   ```typescript
   // Arrange
   const input = { email: 'test@example.com' };

   // Act
   const result = await service.validate(input);

   // Assert
   expect(result.isValid).toBe(true);
   ```

3. **Isolation**: Tests should not depend on each other
4. **Mocking**: Mock external dependencies
5. **Cleanup**: Always clean up test data

### Unit Test Best Practices

- Test one thing per test
- Use mocks for external dependencies
- Test edge cases and error conditions
- Keep tests fast (<100ms per test)

### Integration Test Best Practices

- Use test databases/containers
- Clean up data between tests
- Test realistic scenarios
- Verify end-to-end workflows

### E2E Test Best Practices

- Test critical user paths
- Use page objects for reusability
- Handle async operations properly
- Take screenshots on failure
- Keep tests stable and reliable

### Code Coverage Best Practices

- Aim for meaningful coverage, not just high numbers
- Focus on critical paths
- Don't skip error handling tests
- Review uncovered lines regularly

## Troubleshooting

### Common Issues

**Tests timing out:**
```bash
# Increase timeout in jest.config.js
testTimeout: 30000
```

**Database connection errors:**
```bash
# Ensure Docker containers are running
docker-compose -f docker-compose.test.yml up -d
```

**Playwright browser errors:**
```bash
# Reinstall browsers
npx playwright install --with-deps
```

**Coverage not generated:**
```bash
# Ensure coverage is enabled
npm test -- --coverage
```

## Resources

- [Jest Documentation](https://jestjs.io/)
- [Pytest Documentation](https://docs.pytest.org/)
- [Playwright Documentation](https://playwright.dev/)
- [Testcontainers Documentation](https://testcontainers.com/)
- [Testing Best Practices](https://testingjavascript.com/)

## Contributing

When contributing code:
1. Write tests for new features
2. Maintain or improve coverage
3. Ensure all tests pass before submitting PR
4. Update test documentation as needed

## Support

For testing support:
- Check this documentation
- Review existing tests for examples
- Ask in #testing channel
- Create an issue for test infrastructure problems
