# Contributing to FoodConnect

## 🎯 Project Overview

FoodConnect is a social food discovery platform. We're building a community-driven gastronomy experience for Brazil.

## 📋 Development Setup

1. Follow [docs/quick-start.md](docs/quick-start.md) for initial setup
2. Read [.copilot/instructions.md](.copilot/instructions.md) for coding standards
3. Check [docs/development-roadmap.md](docs/development-roadmap.md) for current priorities

## 🔄 Development Workflow

### Branching Strategy

- `main` - Production-ready code
- `develop` - Integration branch
- `feature/[task-name]` - New features
- `bugfix/[bug-description]` - Bug fixes
- `hotfix/[critical-fix]` - Critical production fixes

### Commit Messages

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(feed): add post creation endpoint
fix(auth): resolve JWT token expiration issue
docs(readme): update installation instructions
refactor(database): optimize user queries
test(feed): add integration tests for post API
```

### Pull Request Process

1. Create feature branch from `develop`
2. Implement changes following coding standards
3. Add/update tests (coverage > 80%)
4. Update documentation if needed
5. Create PR using the template
6. Request review
7. Merge after approval

## 🧪 Testing Standards

- **Unit Tests**: All services and utilities
- **Integration Tests**: API endpoints
- **E2E Tests**: Critical user journeys
- **Coverage**: Maintain > 80%

```bash
# Run tests
npm run test           # Unit tests
npm run test:e2e       # Integration tests
npm run test:cov       # Coverage report
```

## 📊 Code Quality

- **Linting**: ESLint + Prettier
- **Type Safety**: TypeScript strict mode
- **Security**: Regular audits
- **Performance**: Response time < 500ms

```bash
# Quality checks
npm run lint           # Code linting
npm run format         # Code formatting
npm run type-check     # TypeScript check
npm audit              # Security audit
```

## 🎯 Priority Areas (Current Sprint)

1. **Feed Social**: Core posting and interaction features
2. **WhatsApp Bot**: Lead capture and basic responses
3. **Search**: Semantic search with embeddings
4. **Analytics**: Event tracking and metrics

## 📝 Code Review Guidelines

- **Architecture**: Follows DDD patterns?
- **Performance**: Optimized queries and caching?
- **Security**: Input validation and error handling?
- **Observability**: Logging and metrics added?
- **Testing**: Adequate coverage and edge cases?

## 🐛 Bug Reports

Use GitHub Issues with the bug template. Include:

- Steps to reproduce
- Expected vs actual behavior
- Environment details
- Screenshots if applicable

## 💡 Feature Requests

Use GitHub Issues with the feature template. Include:

- User story format
- Acceptance criteria
- Success metrics
- Priority level

## ❓ Getting Help

- 📖 Check existing documentation first
- 🔍 Search GitHub Issues
- 💬 Create new issue with question
- 📧 Contact maintainers if urgent

## 🏆 Recognition

Contributors will be acknowledged in:

- README.md contributors section
- Release notes
- Monthly team highlights

## 📜 Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow
- Maintain professional communication

---

**Thank you for contributing to FoodConnect! 🍽️🚀**
