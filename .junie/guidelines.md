# Junie AI Guidelines for Twixxer Project

This document provides guidelines for using Junie AI with the Twixxer project. These guidelines will help Junie understand the project structure, technologies, and coding standards to provide more accurate and helpful assistance.

## Project Overview

Twixxer is a modern social media platform built with React Router v7 using a server-side rendering (SSR) approach. The project aims to create a Twitter-like platform with a focus on user experience, performance, and scalability.

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

## Project Structure

- **app/**: Contains React components and routes
  - **routes/**: Route components following React Router v7 patterns
- **database/**: Database configuration and schema
- **server/**: Express server setup
- **public/**: Static assets
- **docs/**: Project documentation
- **.junie/**: Junie AI configuration and guidelines

## Coding Standards

When suggesting code changes, Junie should follow these guidelines:

### General Principles
- Write clean, readable, and maintainable code
- Follow the DRY (Don't Repeat Yourself) principle
- Use meaningful variable and function names
- Keep functions small and focused on a single responsibility
- Add comments for complex logic, but aim for self-documenting code

### TypeScript Guidelines
- Use TypeScript with strict typings
- Avoid using `any` type when possible
- Define interfaces for data structures
- Use type inference when the type is obvious
- Follow React Router v7's type generation pattern

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

## Database Schema

The database schema includes:

- **profileTable**: User profiles with fields for ID, about, activation token, email, image URL, username, password hash, verification status, and token expiry
- **chirpTable**: Posts (called "chirps") with fields for ID, profile ID (foreign key), content, and date

## Current Development Phase

The project is currently in Phase 1 (Foundation), focusing on establishing the core architecture and basic functionality. Key tasks include:

- Setting up project structure with React, TypeScript, and Vite
- Implementing server-side rendering with React Router v7
- Creating database schema and ORM integration with DrizzleORM
- Developing basic authentication system (signup, login, logout)
- Implementing basic user profile functionality
- Creating initial UI components with TailwindCSS

## How Junie Can Help

Junie can assist with:

1. **Code Generation**: Suggesting code that follows the project's coding standards and patterns
2. **Debugging**: Helping identify and fix issues in the codebase
3. **Feature Implementation**: Assisting with implementing new features according to the project plan
4. **Code Refactoring**: Suggesting improvements to existing code
5. **Documentation**: Helping create or improve documentation
6. **Best Practices**: Providing guidance on best practices for the technologies used in the project

## Important Considerations

When working with Junie on this project:

1. Always provide context about which part of the application you're working on
2. Specify whether you're working on frontend or backend code
3. Mention any related files or components that might be affected by changes
4. Indicate whether you're following a specific task from the project plan or tasks list
5. Share any error messages or unexpected behavior you're experiencing

By following these guidelines, Junie can provide more targeted and effective assistance for the Twixxer project.