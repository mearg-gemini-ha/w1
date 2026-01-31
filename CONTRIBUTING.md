# Contributing to W Game

Thank you for your interest in contributing to W Game! This document provides guidelines and instructions for contributing.

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Help maintain a positive community

## Getting Started

1. Fork the repository
2. Clone your fork locally
3. Follow the setup instructions in README.md
4. Create a new branch for your feature/fix

## Development Process

### 1. Branch Naming

Use descriptive branch names:

- `feature/add-character-selection`
- `fix/socket-connection-issue`
- `docs/update-readme`
- `refactor/improve-auth-flow`

### 2. Commit Messages

Follow conventional commits:

- `feat: add character selection screen`
- `fix: resolve socket disconnection bug`
- `docs: update setup instructions`
- `refactor: improve authentication middleware`
- `test: add unit tests for game service`
- `chore: update dependencies`

### 3. Code Style

- Follow the existing code style
- Run `npm run lint` before committing
- Run `npm run format` to auto-format code
- Ensure all tests pass: `npm test`

### 4. Testing

- Write tests for new features
- Ensure existing tests pass
- Aim for good test coverage
- Test both frontend and backend changes

### 5. Pull Requests

**Before submitting:**

- Update relevant documentation
- Add tests for new functionality
- Ensure all CI checks pass
- Rebase on latest main branch

**PR Description should include:**

- Clear description of changes
- Related issue numbers (if applicable)
- Screenshots/videos for UI changes
- Testing instructions

## Project Structure Guidelines

### Frontend (client/)

- Place React components in `src/components/`
- Keep pages in `src/pages/`
- Store Phaser game code in `src/game/`
- Add custom hooks to `src/hooks/`
- Define types in `src/types/`

### Backend (server/)

- API routes go in `src/routes/`
- Business logic in `src/services/`
- Database models in `src/models/`
- Middleware in `src/middleware/`
- Types in `src/types/`

## Development Guidelines

### TypeScript

- Always use TypeScript
- Define proper types (avoid `any`)
- Export/import types properly
- Use interfaces for object shapes

### React

- Use functional components with hooks
- Keep components small and focused
- Extract reusable logic to custom hooks
- Use proper prop types

### Node.js/Express

- Use async/await (not callbacks)
- Implement proper error handling
- Validate input data
- Use middleware appropriately

### Database

- Write migrations for schema changes
- Use transactions where appropriate
- Index frequently queried columns
- Document complex queries

## Code Review Process

1. Automated checks must pass
2. At least one approval required
3. Address review comments
4. Resolve merge conflicts
5. Squash commits if needed

## Need Help?

- Check existing issues and discussions
- Ask questions in pull request comments
- Reach out to maintainers

Thank you for contributing! 🎮
