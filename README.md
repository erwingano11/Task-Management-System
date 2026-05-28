# Work Management System

A full-stack work management application built with React (Vite), Node.js (Express), and MySQL.

## 🏗️ Project Structure

```
Work-Management-System/
├── backend/                    # Node.js Express Server
│   ├── controllers/            # Business logic for routes
│   ├── routes/                 # API route definitions
│   ├── server.js               # Main server entry point
│   ├── db.js                   # Database configuration
│   ├── database.sql            # Database schema
│   ├── package.json
│   └── .env                    # Environment variables
│
├── frontend/                   # React + Vite Application
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── services/           # API service utilities
│   │   ├── App.jsx             # Main App component
│   │   ├── main.jsx            # Entry point
│   │   └── index.css           # Global styles
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── README.md
```

## 🚀 Features

- **Task Management**: Create, read, update, and delete tasks
- **User Management**: Manage team members
- **Status Tracking**: Track task progress (Pending, In Progress, Completed)
- **Task Assignment**: Assign tasks to team members
- **Responsive UI**: Mobile-friendly interface
- **Real-time Updates**: Instant feedback on actions

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MySQL (v5.7 or higher)

## 🔧 Installation

### Backend Setup

1. Navigate to the backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file with your database configuration:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=work_management
```

4. Create the MySQL database and tables:

```bash
mysql -u root -p
CREATE DATABASE work_management;
USE work_management;
SOURCE database.sql;
```

5. Start the backend server:

```bash
npm start
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## 📡 API Endpoints

### Tasks

- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/:id` - Get task by ID
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Users

- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

## 📝 Example API Requests

### Create a Task

```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Design Homepage",
    "description": "Create mockups for the homepage",
    "status": "in-progress",
    "assignedTo": "user-id-123"
  }'
```

### Create a User

```bash
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

## 🗄️ Database Schema

### Users Table

- `id` (VARCHAR 36, Primary Key)
- `name` (VARCHAR 100)
- `email` (VARCHAR 100, Unique)
- `password` (VARCHAR 255)
- `createdAt` (TIMESTAMP)

### Tasks Table

- `id` (VARCHAR 36, Primary Key)
- `title` (VARCHAR 255)
- `description` (TEXT)
- `status` (ENUM: pending, in-progress, completed)
- `assignedTo` (VARCHAR 36, Foreign Key)
- `createdAt` (TIMESTAMP)
- `updatedAt` (TIMESTAMP)

## 🎨 Frontend Components

- **App**: Main component managing app state
- **TaskForm**: Form to create new tasks
- **TaskList**: Display list of tasks
- **TaskItem**: Individual task card with edit/delete capabilities

## 🔐 Security Notes

- Remember to update the `.env` file with secure database credentials
- Never commit `.env` file to version control
- Implement proper authentication/authorization in production
- Add input validation and sanitization
- Use HTTPS in production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Backend won't start

- Check if MySQL is running
- Verify database credentials in `.env`
- Ensure port 5000 is available

### Frontend won't connect to backend

- Make sure backend is running on port 5000
- Check if CORS is properly configured
- Verify proxy settings in `vite.config.js`

### Database connection errors

- Verify MySQL is running: `mysql -u root -p`
- Check database exists: `SHOW DATABASES;`
- Verify credentials in `.env` match your MySQL setup

## 📞 Support

For issues and questions, please open an issue in the repository.
