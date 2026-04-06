# Zorvyn Backend

Express + TypeScript backend for user management, OTP-based authentication, and financial record tracking.

## Tech Stack

- Node.js
- TypeScript
- Express
- PostgreSQL
- Sequelize
- Zod
- JWT

## Features

- OTP login flow
- Access token + refresh token rotation
- Role-based authorization (`admin`, `analyst`, `viewer`)
- User CRUD with soft delete
- Record CRUD (income/expense)
- Dashboard summary with weekly/monthly trend aggregation
- Rate limiting per route group

## Project Structure

```
backend/
	index.ts
	controllers/
	middlewares/
	models/
	routers/
	services/
	types/
	validationSchema/
```

## Prerequisites

- Node.js 20+
- npm 10+
- PostgreSQL 14+

## Environment Variables

Create a `.env` file in `backend/`:

```env
PORT=8080
DATABASE_URL=postgres://username:password@localhost:5432/zorvyn

JWT_SECRET=your_access_token_secret
JWT_REFRESH_SECRET=your_refresh_token_secret

JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

Notes:

- `JWT_REFRESH_SECRET` falls back to `JWT_SECRET` if not set.
- If you do not set `PORT`, server starts on `8080`.

## Setup On A New Machine

1. Clone the repository. https://github.com/Vikrampoonia/zorvynAssignment.git
2. Open terminal in the `backend/` folder.
3. Install dependencies:

	 ```bash
	 npm install
	 ```

4. Create PostgreSQL database (example name: `zorvyn`).
5. Add `.env` with correct database and JWT values.
6. Start development server:

	 ```bash
	 npm run dev
	 ```

Server boot behavior:

- Connects to PostgreSQL.
- Runs `sequelize.sync({ alter: true })` and falls back to `sequelize.sync()`.
- Starts cleanup job for expired OTP and refresh-token records every 24 hours.

## Available Script

- `npm run dev`: starts server with `nodemon` + `tsx` and watches `.ts` and `.json` changes.

## Base URLs

- Health check: `GET /`
- Auth routes base: `/auth`
- User routes base: `/user`
- Record routes base: `/record`

## API Endpoints

The current routers read input from query parameters (`req.query`) for most endpoints.

### Auth

- `POST /auth/send-otp?phoneNumber=9876543210`
- `POST /auth/verify-otp?phoneNumber=9876543210&otp=123456`
- `POST /auth/login?phoneNumber=9876543210&otp=123456`
- `POST /auth/refresh-token?refreshToken=<token>`
- `POST /auth/logout` (requires `Authorization: Bearer <accessToken>`)

### Users

- `POST /user/create-user?name=John&phoneNumber=9876543210&role=admin`
- `PUT /user/update-user?id=1&name=John%20Doe`
- `DELETE /user/delete-user?id=1`
- `GET /user/get-user?pageSize=10&pageNumber=1`

### Records

- `POST /record/create-record?userId=1&amount=2500&type=income&category=Salary&date=2026-04-01`
- `PUT /record/update-record?id=1&amount=3000`
- `DELETE /record/delete-record?id=1`
- `GET /record/get-record?pageSize=10&pageNumber=1`
- `GET /record/get-dashboard-summary?trend=monthly`

## Auth Flow Summary

1. `send-otp`
2. `verify-otp`
3. `login` -> returns access token + refresh token
4. Use access token for protected routes
5. On access token expiry, call `refresh-token` to rotate and get a new token pair

## Roles And Access

- `admin`: full user and record management
- `analyst`: read + write records, read users
- `viewer`: read-only record and dashboard access

## Validation And Errors

- Input validation is done using Zod schemas in `validationSchema/`.
- Standard response shape is:

	```json
	{
		"status": 200,
		"message": "...",
		"data": {}
	}
	```

- Common status codes:
	- `400` invalid payload
	- `401` unauthorized or invalid token/OTP
	- `403` forbidden
	- `404` not found
	- `429` too many requests
	- `500` internal server error

## Quick Test Commands

```bash
curl -X GET http://localhost:8080/
curl -X POST "http://localhost:8080/auth/send-otp?phoneNumber=9876543210"
curl -X GET "http://localhost:8080/record/get-record?pageSize=5&pageNumber=1" -H "Authorization: Bearer <accessToken>"
```

## Troubleshooting

- Database connection errors:
	- Verify `DATABASE_URL`
	- Confirm PostgreSQL is running and reachable
- JWT errors:
	- Ensure `JWT_SECRET` is set
	- Ensure `Authorization` header format is `Bearer <token>`
- 429 errors:
	- Wait for rate-limit window to reset

