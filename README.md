# PeerCollab (Frontend + Backend)

This repository now includes:

- **Frontend**: React + Vite app (`/`)
- **Backend**: Node.js + Express + MySQL API (`/backend`)

## Backend features implemented

- Auth REST APIs:
  - `POST /api/auth/signup`
  - `POST /api/auth/login`
  - `POST /api/auth/verify-mfa`
- Project REST APIs:
  - `GET /api/projects` (authenticated)
  - `POST /api/projects` (teacher only, authenticated)
- MySQL database connection via `mysql2`
- Validation with `express-validator`
- Central error handling middleware
- Clean structure: `routes`, `controllers`, `middleware`, `config`

---

## Folder structure

```text
backend/
  src/
    config/db.js
    controllers/
      authController.js
      projectController.js
    middleware/
      authMiddleware.js
      errorHandler.js
      validate.js
    routes/
      authRoutes.js
      projectRoutes.js
    utils/
      asyncHandler.js
    app.js
    server.js
  sql/schema.sql
  .env.example
  package.json
```

---


## SQL queries (tables)

Use these queries directly in MySQL:

```sql
CREATE DATABASE IF NOT EXISTS peercollab;
USE peercollab;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('student', 'teacher') NOT NULL,
  student_id VARCHAR(20) UNIQUE,
  teacher_code VARCHAR(10) UNIQUE,
  department VARCHAR(120) DEFAULT 'Computer Science',
  mfa_code VARCHAR(6) NULL,
  mfa_expires_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(180) NOT NULL,
  description TEXT NOT NULL,
  due_date DATE NULL,
  max_team_size INT NULL,
  status ENUM('active', 'pending', 'completed', 'overdue') DEFAULT 'pending',
  submissions_count INT DEFAULT 0,
  progress INT DEFAULT 0,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_projects_user FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);
```

---

## Step-by-step: run backend

### 1) Create MySQL database and tables

Run the schema file in MySQL:

```sql
SOURCE /absolute/path/to/fullstack-frontend/backend/sql/schema.sql;
```

Or copy-paste `backend/sql/schema.sql` into your MySQL client and execute.

### 2) Configure backend environment

```bash
cd backend
cp .env.example .env
```

Then edit `.env` with your MySQL credentials and JWT secret.

### 3) Install backend dependencies

```bash
cd backend
npm install
```

### 4) Start backend server

```bash
npm run dev
```

Backend runs at: `http://localhost:5000`

Health check:

```bash
curl http://localhost:5000/api/health
```

---

## Step-by-step: run frontend

### 1) Configure frontend env

Create a root `.env` file:

```bash
VITE_API_BASE_URL=http://localhost:5000/api
```

### 2) Install and run frontend

```bash
npm install
npm run dev
```

Frontend runs at Vite's default port (usually `http://localhost:5173`).

---

## API request examples

### Signup

```http
POST /api/auth/signup
Content-Type: application/json

{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "secret123",
  "role": "teacher"
}
```

### Login (student)

```http
POST /api/auth/login
Content-Type: application/json

{
  "role": "student",
  "studentId": "1234567890",
  "password": "secret123"
}
```

### Login (teacher + MFA step 1)

```http
POST /api/auth/login
Content-Type: application/json

{
  "role": "teacher",
  "teacherCode": "1234",
  "password": "secret123"
}
```

### Verify MFA (step 2)

```http
POST /api/auth/verify-mfa
Content-Type: application/json

{
  "code": "123456",
  "mfaToken": "<token-from-login-teacher>"
}
```

### Get projects (auth required)

```http
GET /api/projects
Authorization: Bearer <jwt>
```

### Create project (teacher only)

```http
POST /api/projects
Authorization: Bearer <jwt>
Content-Type: application/json

{
  "title": "React Dashboard",
  "description": "Build a dashboard app",
  "dueDate": "2026-05-10",
  "maxTeamSize": 4,
  "status": "pending"
}
```
