# Quick Start Guide

## Initial Setup

### 1. Install Backend Dependencies

```bash
cd backend
npm install
```

### 2. Set Up Database

First, ensure MySQL is running, then:

```bash
mysql -u root -p
CREATE DATABASE work_management;
USE work_management;
SOURCE database.sql;
```

Update the `.env` file with your MySQL credentials:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=work_management
```

### 3. Start Backend Server

```bash
npm start
# or for development with auto-reload
npm run dev
```

The API will be available at `http://localhost:5000`

### 4. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### 5. Start Frontend Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 📍 Application Endpoints

**Frontend**: http://localhost:3000  
**Backend API**: http://localhost:5000  
**API Documentation**: http://localhost:5000/health

## 🧪 Testing the API

### Create a task:

```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My First Task",
    "description": "Test task",
    "status": "pending",
    "assignedTo": ""
  }'
```

### Get all tasks:

```bash
curl http://localhost:5000/api/tasks
```

## 📂 File Organization

- **Backend**: All server code, routes, and controllers
- **Frontend**: React components, styles, and client-side logic
- **Database**: SQL schema in `backend/database.sql`

## 🔄 Development Workflow

1. Frontend development server runs on port 3000 with hot reload
2. Backend API runs on port 5000
3. Frontend proxies API requests to backend via `vite.config.js`
4. Database changes require running SQL migrations

## ⚠️ Important Notes

- Keep `.env` file with secure credentials (never commit to git)
- Ensure MySQL is running before starting the backend
- Use `npm run dev` in backend for development with auto-reload (requires nodemon)
- Build frontend for production: `npm run build`

## 🐛 Common Issues

If the frontend can't reach the backend:

- Verify backend is running on port 5000
- Check browser console for CORS errors
- Ensure proxy is configured in `vite.config.js`

For database errors:

- Verify MySQL is running
- Check `.env` file has correct credentials
- Ensure database schema was imported
