-- PostgreSQL Schema for Lemi Kura Subcity Administration System

-- Users table
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

-- Offices table
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

-- Reports table
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

-- Annual Plans table
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

-- Notifications table
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

-- Indexes
CREATE INDEX idx_reports_office_id ON reports(office_id);
CREATE INDEX idx_reports_date ON reports(date);
CREATE INDEX idx_reports_task_id ON reports(task_id);
CREATE INDEX idx_annual_plans_office_id ON annual_plans(office_id);
CREATE INDEX idx_annual_plans_year ON annual_plans(year);
CREATE INDEX idx_annual_plans_status ON annual_plans(status);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_users_username ON users(username);
