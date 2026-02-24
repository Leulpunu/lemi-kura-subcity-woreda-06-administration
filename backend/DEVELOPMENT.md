# Lemi Kura Subcity Woreda 06 Administration - Development Guide

## Overview

This is an Ethiopian government KPI tracking system for Lemi Kura Subcity Woreda 06. The system tracks offices, reports, annual plans, and notifications.

## Tech Stack

- **Frontend**: React, React Router, Axios
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL (Neon Serverless)
- **Authentication**: JWT, bcrypt

## Project Structure

```
text
backend/
├── db.js                 # PostgreSQL connection
├── server.js            # Express server
├── routes/              # API routes
│   ├── auth.js          # Login, register, users
│   ├── offices.js       # Office CRUD
│   ├── reports.js       # Reports CRUD
│   ├── notifications.js # Notifications CRUD
│   ├── annualPlans.js   # Annual plans CRUD
│   └── changePassword.js# Password change
├── schema.sql           # Database schema
├── setup-schema.js      # Schema setup script
├── import-frontend-data.js # Import sample data
└── package.json

src/
├── contexts/            # React contexts
│   └── AuthContext.js   # Authentication
├── components/          # React components
├── pages/              # Page components
├── services/            # API services
└── styles/              # CSS files

package.json
```

## Database Setup

### 1. Environment Variables

Create `backend/.env` file:

```
text
DATABASE_URL=postgresql://neondb_owner:npg_xxx@ep-xxx-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=your-secret-key
PORT=3000
```

### 2. Run Database Schema

```
bash
cd backend
node setup-schema.js
```

### 3. Import Sample Data

```
bash
cd backend
node import-frontend-data.js
```

## Running the Application

### Development Mode

**Terminal 1 - Backend:**

```
bash
cd backend
npm run dev
```

Server runs on <http://localhost:3000>

**Terminal 2 - Frontend:**

```
bash
npm start
```

Frontend runs on <http://localhost:5000>

### Production Mode

**Build frontend:**

```
bash
npm run build
```

**Start backend:**

```
bash
cd backend
npm start
```

## API Endpoints

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/users` - Get all users

### Offices

- `GET /api/offices` - Get all offices
- `GET /api/offices/:id` - Get office by ID

### Reports

- `GET /api/reports` - Get all reports
- `POST /api/reports` - Create report
- `PUT /api/reports/:id` - Update report
- `DELETE /api/reports/:id` - Delete report

### Annual Plans

- `GET /api/annual-plans` - Get all annual plans
- `POST /api/annual-plans` - Create annual plan
- `PUT /api/annual-plans/:id` - Update annual plan

### Notifications

- `GET /api/notifications` - Get notifications
- `POST /api/notifications` - Create notification
- `PUT /api/notifications/:id` - Mark as read

## Database Schema

### Users Table

```
sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    office VARCHAR(50),
    position_am VARCHAR(255),
    position_en VARCHAR(255),
    "accessibleOffices" JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Offices Table

```
sql
CREATE TABLE offices (
    office_id VARCHAR(50) PRIMARY KEY,
    name_am VARCHAR(255) NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    description TEXT,
    parent_id VARCHAR(50),
    level INTEGER DEFAULT 1,
    target NUMERIC(10, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Reports Table

```
sql
CREATE TABLE reports (
    id SERIAL PRIMARY KEY,
    office_id VARCHAR(50) REFERENCES offices(office_id),
    task_id VARCHAR(50),
    value NUMERIC(10, 2) DEFAULT 0,
    date DATE,
    description TEXT,
    reported_by INTEGER REFERENCES users(id),
    report_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Annual Plans Table

```
sql
CREATE TABLE annual_plans (
    id SERIAL PRIMARY KEY,
    office_id VARCHAR(50) REFERENCES offices(office_id),
    task_id VARCHAR(50),
    annual_targets JSONB,
    distributed_plans JSONB,
    year INTEGER NOT NULL,
    submitted_by INTEGER REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'draft',
    approved_by INTEGER REFERENCES users(id),
    approved_at TIMESTAMP,
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Notifications Table

```
sql
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    type VARCHAR(50) DEFAULT 'info',
    recipient VARCHAR(50),
    sender VARCHAR(255),
    office VARCHAR(50),
    is_read BOOLEAN DEFAULT FALSE,
    priority VARCHAR(20) DEFAULT 'medium',
    data JSONB,
    user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Default Users

After importing data, you can login with:

- **Admin**: username: `tesfaye`, password: `password123`
- **User**: username: `mikael`, password: `password123`

## Troubleshooting

### 405 Method Not Allowed

- Ensure backend server is running on port 3000
- Check that the route is defined correctly
- Verify the HTTP method (GET, POST, PUT, DELETE)

### Database Connection Issues

- Verify DATABASE_URL in .env is correct
- Check Neon database is active:
  - Go to [Neon Console](https://console.neon.tech)
  - Sign in and select your project
  - Verify the database shows as "Available" (green status)
  - Check the connection string matches your .env file
- Ensure SSL is enabled (sslmode=require)

### CORS Errors

- Backend runs on port 3000
- Frontend proxy is configured to forward /api requests

## Available Scripts

### Backend

```
bash
npm start          # Start production server
npm run dev        # Start development server (with nodemon)
npm run seed       # Seed database with sample data
```

### Frontend

```
bash
npm start          # Start development server
npm run build      # Build for production
```

## License

© 2026 ELT Technology - Lemi Kura Subcity Woreda 06 Administration
