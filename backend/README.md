# Backend

This folder contains the Express API for the quiz platform.

## Stack

- Express
- Sequelize
- MySQL
- dotenv

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file from `.env.example` and update the MySQL credentials.

3. Start the server:

```bash
npm run dev
```

## Environment Variables

- `PORT` - API port
- `NODE_ENV` - runtime mode
- `DB_HOST` - MySQL host
- `DB_PORT` - MySQL port
- `DB_USER` - MySQL username
- `DB_PASSWORD` - MySQL password
- `DB_NAME` - MySQL database name

## Health Check

The server exposes a simple health endpoint:

```bash
GET /api/v1/health
```

## Notes

The database connection is initialized in `app.js` using Sequelize and the values from `.env`.