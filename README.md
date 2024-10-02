# Forum Project

## Project Description

This project is a forum platform built with a modern tech stack that allows users to engage in discussions by creating posts, commenting, and interacting with content. The platform supports role-based access control, with admin and regular user roles. It also implements authentication, including OAuth support through Google. The project is designed with scalability and best practices in mind, ensuring clean architecture, maintainability, and security.

## Features

- User authentication and authorization (local login and OAuth through Google)
- Role-based access control (Admin, User)
- Creation of forum posts.
- Liking posts and adding comments.
- System to follow/unfollow users.
- Password reset functionality via email
- Image uploads via the Imgur API.

## Technologies

The project uses a wide array of modern technologies to ensure performance, security, and ease of development:

### Backend

- **Node.js** - JavaScript runtime for building server-side applications.
- **NestJS** - A progressive Node.js framework for building efficient and scalable server-side applications.
- **Prisma** - An ORM for working with the database in a type-safe manner.
- **Passport.js** - Middleware for authentication and OAuth integration (Google).
- **Ethereal Email** - Email service for password reset functionality.
- **PostgreSQL** - Relational database system.
- **Imgur API** – service used for hosting images uploaded by users.
- **Validation** - Class Validator and Class Transformer

### Tools & DevOps

- **Git** - Version control system.
- **Prettier/ESLint** - Code formatting and linting tools.
- **Jest** - Testing framework for unit and integration testing.

## Usage

Once the server is running, you can access the API at `http://localhost:3000`

- Register and log in with local credentials or via Google OAuth.
- Create and manage posts and comments.
- Admin users can manage users and posts.
