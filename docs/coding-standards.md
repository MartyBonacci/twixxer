# Twixxer Coding Standards and Stack

This document outlines the technology stack, coding conventions, and style guide for the Twixxer project.

## Technology Stack

### Core Technologies
- **Frontend**: React 19, React Router v7
- **Backend**: Express, Node.js
- **Database**: PostgreSQL with DrizzleORM
- **Build Tools**: Vite, TypeScript
- **Styling**: TailwindCSS

### Development Tools
- **Package Manager**: npm
- **Version Control**: Git
- **Containerization**: Docker

## Coding Style Guide

### General Principles
- Write clean, readable, and maintainable code
- Follow the DRY (Don't Repeat Yourself) principle
- Use meaningful variable and function names
- Keep functions small and focused on a single responsibility
- Add comments for complex logic, but aim for self-documenting code

### TypeScript Guidelines
- Use TypeScript for all new code with strict typings
- Avoid using `any` type when possible
- Define interfaces for data structures
- Use type inference when the type is obvious
- Follow React Router v7's type generation pattern:
  ```typescript
  import type { Route } from "./+types/route-name";
  
  export function loader({ request }: Route.LoaderArgs) {}
  
  export function meta({}: Route.MetaArgs) {}
  
  export async function action({ request }: Route.ActionArgs) {}
  ```

### React Guidelines
- Use functional components with hooks
- Keep components small and focused
- Use React Router's loader and action functions for data fetching and mutations
- Follow the container/presentational component pattern where appropriate
- Use React context for global state management

### CSS/Styling Guidelines
- Use TailwindCSS for styling
- Follow utility-first approach
- Create custom components for repeated UI patterns
- Use responsive design principles
- Maintain consistent spacing and sizing

### File Structure
- Follow the established project structure
- Place route components in the `app/routes/` directory
- Keep related files together
- Use consistent file naming conventions

### Code Quality Tools
- Use ESLint for code linting
- Use Prettier for code formatting
- Run TypeScript type checking before commits

## Testing Standards
- Write unit tests for utility functions
- Write integration tests for API endpoints
- Test critical user flows with end-to-end tests
- Aim for good test coverage of business logic

## Git Workflow
- Use feature branches for new development
- Write clear, descriptive commit messages
- Keep commits focused and atomic
- Create pull requests for code review before merging

## Documentation
- Document complex algorithms and business logic
- Keep API documentation up to date
- Document database schema changes
- Add JSDoc comments to functions and classes