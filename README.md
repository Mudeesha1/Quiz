# Quiz Platform

![Quiz Logo](frontend/public/logo.svg)

This repository contains a student quiz platform with a React frontend and an Express + Sequelize backend.

## Project Structure

- `frontend/` - Vite + React client application
- `backend/` - Express API server with MySQL + Sequelize

## Frontend

The frontend is built with React, Vite, React Router, and Tailwind CSS.

### Run locally

```bash
cd frontend
npm install
npm run dev
```

### Available scripts

- `npm run dev` - Start the development server
- `npm run build` - Create a production build
- `npm run lint` - Run ESLint
- `npm run preview` - Preview the production build

## Backend

The backend uses Express, Sequelize, and MySQL for the API layer.

### Run locally

```bash
cd backend
npm install
npm run dev
```

### Required environment variables

Copy `backend/.env.example` to `backend/.env` and update the values for your machine.

### API health check

```bash
GET /api/v1/health
```

## Developer

Sahan Kaushalya

## License

MIT
