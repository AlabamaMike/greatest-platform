# Contributing to Nexus Platform

Thank you for your interest in contributing to Nexus! We're building the world's most impactful software platform, and we need your help.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)

## Code of Conduct

We are committed to providing a welcoming and inclusive environment for all contributors. We expect:

- **Respect**: Treat everyone with respect and kindness
- **Inclusion**: Welcome diverse perspectives and experiences
- **Collaboration**: Work together constructively
- **Focus**: Keep discussions focused on improving the platform
- **Impact**: Remember we're building this to help people

Unacceptable behavior includes harassment, discrimination, trolling, or any conduct that makes others feel unwelcome.

## How Can I Contribute?

### 🐛 Reporting Bugs

- Check if the bug has already been reported in Issues
- Use the bug report template
- Include detailed steps to reproduce
- Include logs and error messages
- Specify your environment (OS, Node version, etc.)

### ✨ Suggesting Features

- Check if the feature has already been suggested
- Use the feature request template
- Explain the problem you're trying to solve
- Describe how it aligns with Nexus's mission
- Consider the impact on users globally

### 💻 Code Contributions

We welcome contributions in many areas:

**Backend Development**
- Implement new microservices features
- Improve API performance and reliability
- Add database optimizations
- Enhance security

**Frontend Development**
- Build web application (React)
- Build mobile apps (React Native)
- Create admin dashboard features
- Improve UI/UX

**AI/ML**
- Improve existing models
- Add new AI capabilities
- Optimize model performance
- Ensure privacy and ethics

**Infrastructure**
- Kubernetes configurations
- CI/CD improvements
- Monitoring and observability
- Deployment automation

**Documentation**
- API documentation
- Developer guides
- User tutorials
- Localization

**Testing**
- Unit tests
- Integration tests
- End-to-end tests
- Performance tests

**Design**
- UI/UX design
- Accessibility improvements
- Mobile-first design
- Localization support

## Development Setup

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- Git
- A GitHub account

### Getting Started

```bash
# Fork the repository on GitHub

# Clone your fork
git clone https://github.com/YOUR_USERNAME/nexus-platform.git
cd nexus-platform

# Add upstream remote
git remote add upstream https://github.com/nexus-foundation/nexus-platform.git

# Install dependencies
npm install

# Start development environment
docker-compose up

# In another terminal, run a specific service
cd services/auth
npm install
npm run dev
```

### Running Services Locally

Each service can be run independently:

```bash
cd services/[service-name]
npm install
npm run dev
```

Services:
- `auth` - Authentication (port 3001)
- `healthcare` - Healthcare (port 3003)
- `education` - Education (port 3004)
- `economic` - Economic (port 3005)
- `data-analytics` - Data & Analytics (port 3006)
- `crisis` - Crisis Response (port 3007)

## Pull Request Process

### 1. Create a Branch

```bash
# Update your fork
git checkout main
git pull upstream main

# Create a feature branch
git checkout -b feature/your-feature-name
```

Branch naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Test additions or changes

### 2. Make Your Changes

- Write clear, readable code
- Follow the coding standards (see below)
- Add tests for new functionality
- Update documentation as needed
- Keep commits focused and atomic

### 3. Test Your Changes

```bash
# Run linting
npm run lint

# Run tests
npm test

# Run integration tests
npm run test:integration

# Test specific service
cd services/auth
npm test
```

### 4. Commit Your Changes

Write clear commit messages:

```bash
git commit -m "Add telemedicine appointment booking feature

- Implement appointment scheduling API
- Add WebRTC video consultation support
- Create appointment database schema
- Add unit and integration tests
- Update API documentation

Closes #123"
```

Commit message format:
- First line: Brief summary (50 chars or less)
- Blank line
- Detailed explanation of changes
- Reference related issues

### 5. Push and Create Pull Request

```bash
# Push to your fork
git push origin feature/your-feature-name

# Create pull request on GitHub
```

Pull request checklist:
- [ ] Code follows style guidelines
- [ ] Tests pass locally
- [ ] New tests added for new features
- [ ] Documentation updated
- [ ] Commit messages are clear
- [ ] Pull request description is detailed
- [ ] Related issues are referenced

### 6. Code Review

- Respond to review comments promptly
- Make requested changes
- Push updates to your branch
- Be open to feedback and suggestions

### 7. Merge

Once approved, a maintainer will merge your pull request. Thank you for your contribution!

## Coding Standards

### TypeScript/JavaScript

- Use TypeScript for all new code
- Follow the project's ESLint configuration
- Use async/await instead of callbacks
- Handle errors properly
- Use meaningful variable and function names
- Add JSDoc comments for public APIs

Example:

```typescript
/**
 * Register a new user in the system
 * @param email - User's email address
 * @param password - User's password (will be hashed)
 * @param fullName - User's full name
 * @returns Promise with user object and JWT tokens
 */
async function registerUser(
  email: string,
  password: string,
  fullName: string
): Promise<UserRegistrationResponse> {
  // Implementation
}
```

### Python

- Follow PEP 8 style guide
- Use type hints
- Document functions with docstrings
- Use meaningful variable names

### API Design

- Follow RESTful principles
- Use proper HTTP methods (GET, POST, PUT, DELETE)
- Return appropriate status codes
- Include error messages in responses
- Version APIs (/api/v1/)

### Database

- Use migrations for schema changes
- Add indexes for frequently queried fields
- Follow naming conventions (snake_case for tables/columns)
- Document complex queries

### Security

- Never commit secrets or credentials
- Sanitize user inputs
- Use parameterized queries (prevent SQL injection)
- Validate all inputs
- Follow OWASP best practices

## Testing

### Unit Tests

Test individual functions and methods in isolation.

```typescript
describe('AuthController', () => {
  describe('register', () => {
    it('should create a new user with valid data', async () => {
      // Test implementation
    });

    it('should reject duplicate email addresses', async () => {
      // Test implementation
    });
  });
});
```

### Integration Tests

Test how services work together.

```typescript
describe('User Registration Flow', () => {
  it('should register user, send verification email, and emit event', async () => {
    // Test implementation
  });
});
```

### Test Coverage

- Aim for >80% code coverage
- Focus on critical paths
- Test error cases
- Test edge cases

## Documentation

### Code Documentation

- Add JSDoc/docstrings for all public APIs
- Explain complex logic with comments
- Keep README files up to date in each service

### API Documentation

- Document all endpoints in OpenAPI/Swagger format
- Include request/response examples
- Document error responses
- Keep documentation in sync with code

### User Documentation

- Write clear, step-by-step guides
- Include screenshots where helpful
- Consider non-technical users
- Translate to multiple languages

## Getting Help

- **Discord**: Join our Discord community
- **Forum**: Post on forum.nexusplatform.org
- **Issues**: Ask questions in GitHub issues
- **Email**: dev@nexusplatform.org

## Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Nexus Platform website
- Annual contributor reports

## Thank You!

Every contribution, no matter how small, makes a difference. You're helping build technology that will improve lives around the world.

Together, we're building the greatest software platform ever created.

**Let's change the world. Let's build Nexus.**
