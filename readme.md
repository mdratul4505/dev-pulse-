# DevPulse – Internal Tech Issue & Feature Tracker

A collaborative backend platform for software teams to report bugs, request features, and manage issue workflows efficiently.

---

## 🚀 Live URL

- Backend API: https://dev-pulse-livid.vercel.app/

---

# 📌 Project Overview

DevPulse is a secure role-based issue tracking system built with Node.js, Express.js, TypeScript, and PostgreSQL.

The platform allows contributors to create and manage issues while maintainers can fully control issue workflows, updates, and deletions.

---

# ✨ Features

## 🔐 Authentication & Authorization
- JWT-based authentication system
- Secure password hashing using bcrypt
- Protected routes with middleware
- Role-based access control

## 🐛 Issue Management
- Create bug reports
- Create feature requests
- Update issue details
- Delete issues
- Manage issue workflow status

## 🔎 Filtering & Sorting
- Sort issues by newest or oldest
- Filter by issue type
- Filter by issue status

## 🛡️ Security Features
- Passwords are never exposed in responses
- JWT verification middleware
- Role validation before privileged actions

## 🗄️ Database
- PostgreSQL database
- Raw SQL queries using native pg driver
- No ORM or Query Builder used

---

# 🛠️ Tech Stack

| Technology | Purpose |
|------------|----------|
| Node.js | Backend Runtime |
| TypeScript | Type Safety |
| Express.js | Server Framework |
| PostgreSQL | Relational Database |
| pg | PostgreSQL Driver |
| bcryptjs | Password Hashing |
| jsonwebtoken | JWT Authentication |
| dotenv | Environment Variables |
| cors | Cross-Origin Resource Sharing |

---

# 📁 Project Structure

```bash
src/
│
├── app/
│   ├── modules/
│   │   ├── auth/
│   │   └── issues/
│   │
│   ├── middlewares/
│   ├── routes/
│   ├── interfaces/
│   └── utils/
│
├── config/
├── db/
├── app.ts
└── server.ts
```

---

# ⚙️ Installation & Setup

## 1️⃣ Clone Repository

```bash
git clone https://github.com/your-username/devpulse.git
```

---

## 2️⃣ Move Into Project Folder

```bash
cd devpulse
```

---

## 3️⃣ Install Dependencies

```bash
npm install
```

---

## 4️⃣ Setup Environment Variables

Create a `.env` file in the root directory.

```env
PORT=5000

DATABASE_URL=your_postgresql_database_url

JWT_SECRET=your_super_secret_key

BCRYPT_SALT_ROUNDS=10
```

---

## 5️⃣ Create Database Tables

### Users Table

```sql
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,

    name VARCHAR(100) NOT NULL,

    email VARCHAR(100) UNIQUE NOT NULL,

    password TEXT NOT NULL,

    role VARCHAR(20) DEFAULT 'contributor'
    CHECK (role IN ('contributor', 'maintainer')),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

### Issues Table

```sql
CREATE TABLE IF NOT EXISTS issues (
    id SERIAL PRIMARY KEY,

    title VARCHAR(150) NOT NULL,

    description TEXT NOT NULL
    CHECK (LENGTH(description) >= 20),

    type VARCHAR(20) NOT NULL
    CHECK (type IN ('bug', 'feature_request')),

    status VARCHAR(20) DEFAULT 'open'
    CHECK (status IN ('open', 'in_progress', 'resolved')),

    reporter_id INTEGER NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 6️⃣ Run Development Server

```bash
npm run dev
```

---

# 🔑 API Endpoints

## 🔹 Authentication Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register User |
| POST | `/api/auth/login` | User Login |

---

## 🔹 Issue Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/issues` | Create Issue |
| GET | `/api/issues` | Get All Issues |
| GET | `/api/issues/:id` | Get Single Issue |
| PATCH | `/api/issues/:id` | Update Issue |
| DELETE | `/api/issues/:id` | Delete Issue |

---

# 📥 Sample API Requests

## 🔹 User Registration

### Endpoint

```http
POST /api/auth/signup
```

### Request Body

```json
{
  "name": "John Doe",
  "email": "john.doe@devpulse.com",
  "password": "securePassword123",
  "role": "contributor"
}
```

---

## 🔹 User Login

### Endpoint

```http
POST /api/auth/login
```

### Request Body

```json
{
  "email": "john.doe@devpulse.com",
  "password": "securePassword123"
}
```

---

## 🔹 Create Issue

### Endpoint

```http
POST /api/issues
Authorization: Bearer <JWT_TOKEN>
```

### Request Body

```json
{
  "title": "Database connection timeout under load",
  "description": "Pool exhausts after 50+ concurrent queries, causing 500 errors",
  "type": "bug"
}
```

---

# 🔒 Authorization Rules

| Role | Permissions |
|------|-------------|
| contributor | Create & View Issues |
| maintainer | Full Access |

---

# 📊 Database Schema Summary

## users

| Column | Type |
|--------|------|
| id | SERIAL |
| name | VARCHAR |
| email | VARCHAR UNIQUE |
| password | TEXT |
| role | VARCHAR |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## issues

| Column | Type |
|--------|------|
| id | SERIAL |
| title | VARCHAR(150) |
| description | TEXT |
| type | VARCHAR |
| status | VARCHAR |
| reporter_id | INTEGER |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

# 🚨 Error Response Format

```json
{
  "success": false,
  "message": "Error description",
  "errors": "Detailed error information"
}
```

---

# ✅ Success Response Format

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

---

# 📌 HTTP Status Codes

| Code | Meaning |
|------|----------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Internal Server Error |

---

# 🧠 Future Improvements

- Pagination
- Search functionality
- Issue comments system
- Dashboard analytics
- Email notifications
- Activity logs

---

# 👨‍💻 Author

### Md Ratul Hasan

- Student of Computer Science
- Satkhira Polytechnic Institute

---

# 📄 License

This project is licensed under the MIT License.