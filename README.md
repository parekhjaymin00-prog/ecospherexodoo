# EcoSphere - ESG Management Platform

A full-stack authentication system for the EcoSphere ESG Management Platform.

## Project Structure

```
├── frontend/          # React.js (Vite) frontend
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Login, Signup pages
│   │   ├── layouts/      # AuthLayout
│   │   ├── contexts/     # AuthContext
│   │   ├── hooks/        # useAuth hook
│   │   └── services/     # Axios API service
│   └── ...
├── backend/           # Node.js + Express backend
│   ├── config/        # Database configuration
│   ├── middleware/    # JWT auth middleware
│   ├── routes/        # API routes
│   └── ...
└── README.md
```

## Tech Stack

### Frontend
- React.js (Vite)
- Tailwind CSS v4
- React Router DOM
- Axios
- React Hook Form + Zod validation

### Backend
- Node.js + Express
- PostgreSQL (with in-memory fallback for development)
- JWT (jsonwebtoken)
- bcryptjs

## Getting Started

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/ecosphere
JWT_SECRET=your-secret-key-at-least-32-characters-long
PORT=5000
```

```bash
npm run dev
```

The backend will automatically create the database tables on first run.

> **Note:** If PostgreSQL is not available, the backend falls back to an in-memory store for development (data resets on restart).

## Features

- User Registration (Signup)
- User Authentication (Login)
- JWT-based session management
- Protected routes
- Form validation (Zod schemas)
- Session persistence across page reloads
- Black & white gradient glassmorphism UI theme
- Fully responsive (320px - 1920px)

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/signup | Register a new user |
| POST | /api/auth/login | Authenticate user |
| GET | /api/auth/me | Get current user (protected) |
