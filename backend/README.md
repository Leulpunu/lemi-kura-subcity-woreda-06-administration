# Ethiopian KPI System Backend

This is the backend API for the Ethiopian KPI System, built with Node.js, Express, and MongoDB.

## Features

- User authentication and authorization
- Office and KPI management
- Report submission and tracking
- Multilingual support (Amharic and English)

## Installation

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env` file and update the values as needed.

4. Start MongoDB (if running locally).

5. Seed the database:

   ```bash
   npm run seed
   ```

6. Start the server:

   ```bash
   npm run dev
   ```

The server will run on <http://localhost:5000>

## API Endpoints

### Authentication

- POST /api/auth/login - User login
- POST /api/auth/register - Register new user (admin only)

### Offices

- GET /api/offices - Get all offices
- GET /api/offices/:id - Get office by ID

### Reports

- GET /api/reports - Get all reports
- POST /api/reports - Create new report
- GET /api/reports/office/:officeId - Get reports by office

## Technologies Used

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcrypt for password hashing
- CORS for cross-origin requests
