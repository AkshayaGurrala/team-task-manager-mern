# 🚀 TaskFlow – Team Task Manager (MERN Stack)

A production-ready full-stack Task Management application built with MongoDB, Express.js, React.js, and Node.js.

---

## 🌐 Live Demo

| Service  | URL |
|----------|-----|
| Frontend | *(Deploy to Vercel – see below)* |
| Backend  | *(Deploy to Railway – see below)* |

---

## ✨ Features

- 🔐 **JWT Authentication** – Secure login/signup with bcrypt password hashing
- 👥 **Role-Based Access Control** – Admin and Member roles with different permissions
- 📁 **Project Management** – Create, update, delete projects; manage team members
- ✅ **Task Management** – Create tasks, assign to users, update status, filter by status
- 📊 **Dashboard** – Live stats: total, completed, pending, in-progress, and overdue tasks
- 📱 **Responsive Design** – Mobile-friendly dark UI with glassmorphism effects

---

## 🧪 Default Test Credentials

| Role   | Email             | Password |
|--------|-------------------|----------|
| Admin  | admin@test.com    | 123456   |
| Member | member@test.com   | 123456   |

---

## 🏗️ Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Frontend  | React 18, Vite, React Router v6   |
| Styling   | Vanilla CSS (custom design system)|
| State     | React Context API                 |
| HTTP      | Axios                             |
| Backend   | Node.js, Express.js               |
| Database  | MongoDB (Mongoose ODM)            |
| Auth      | JWT + bcryptjs                    |
| Icons     | Lucide React                      |

---

## 📂 Project Structure

```
team-task-manager-mern/
├── backend/
│   ├── config/db.js          # MongoDB connection
│   ├── controllers/          # Auth, Project, Task controllers
│   ├── middleware/           # Auth & role middleware
│   ├── models/               # User, Project, Task schemas
│   ├── routes/               # API routes
│   ├── seed.js               # Database seeder
│   ├── server.js             # Express entry point
│   └── .env                  # Environment variables
└── frontend/
    └── src/
        ├── api/              # Axios API client
        ├── components/       # Navbar, Sidebar, Cards, Layout
        ├── context/          # AuthContext
        └── pages/            # Login, Signup, Dashboard, Projects, Tasks
```

---

## ⚙️ Local Setup

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (or local MongoDB)

### 1. Clone & Install

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Environment

**backend/.env**
```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key
NODE_ENV=development
```

**frontend/.env**
```
VITE_API_URL=http://localhost:5000/api
```

### 3. Seed Database

```bash
cd backend
node seed.js
```

### 4. Run Development Servers

```bash
# Terminal 1 – Backend
cd backend
npm run dev

# Terminal 2 – Frontend
cd frontend
npm run dev
```

- Backend: http://localhost:5000
- Frontend: http://localhost:5173

## 🌐 Deployment (Unified MERN on Railway)

This project is optimized for a single-service deployment on Railway. The backend serves the built frontend automatically.

1. Go to [railway.app](https://railway.app) and create a new project.
2. Connect your GitHub repo.
3. **IMPORTANT**: Keep the `Root Directory` as `/` (default).
4. Add the following environment variables:
   - `MONGO_URI`: Your MongoDB connection string.
   - `JWT_SECRET`: A secure random key.
   - `NODE_ENV`: `production`
5. Railway will automatically detect the root `package.json`, install all dependencies for both frontend and backend, build the frontend, and start the production server.

---


## 📡 API Endpoints

### Auth
| Method | Endpoint          | Access  | Description       |
|--------|-------------------|---------|-------------------|
| POST   | /api/auth/signup  | Public  | Register new user |
| POST   | /api/auth/login   | Public  | Login user        |
| GET    | /api/auth/me      | Private | Get current user  |
| GET    | /api/auth/users   | Admin   | Get all users     |

### Teams
| Method | Endpoint                  | Access  | Description           |
|--------|---------------------------|---------|-----------------------|
| GET    | /api/teams                | Private | Get all teams         |
| POST   | /api/teams                | Admin   | Create a team         |
| GET    | /api/teams/:id            | Private | Get team details      |
| PUT    | /api/teams/:id            | Admin   | Update team           |
| DELETE | /api/teams/:id            | Admin   | Delete team           |
| PUT    | /api/teams/:id/members    | Admin   | Add member to team    |
| DELETE | /api/teams/:id/members/:uid| Admin   | Remove member         |

### Projects
| Method | Endpoint                        | Access  |
|--------|---------------------------------|---------|
| GET    | /api/projects                   | Private |
| POST   | /api/projects                   | Admin   |
| PUT    | /api/projects/:id               | Admin   |
| DELETE | /api/projects/:id               | Admin   |
| POST   | /api/projects/:id/members       | Admin   |
| DELETE | /api/projects/:id/members/:uid  | Admin   |
| POST   | /api/projects/:id/teams         | Admin   |
| DELETE | /api/projects/:id/teams/:tid    | Admin   |

### Tasks
| Method | Endpoint            | Access         |
|--------|---------------------|----------------|
| GET    | /api/tasks          | Private        |
| POST   | /api/tasks          | Admin          |
| PUT    | /api/tasks/:id      | Private (RBAC) |
| DELETE | /api/tasks/:id      | Admin          |
| GET    | /api/tasks/dashboard| Private        |

---

## 👤 Role Permissions

| Feature              | Admin | Member |
|----------------------|-------|--------|
| Create Projects      | ✅    | ❌     |
| Edit/Delete Projects | ✅    | ❌     |
| Manage Teams         | ✅    | ❌     |
| Assign Teams         | ✅    | ❌     |
| Manage Members       | ✅    | ❌     |
| Create Tasks         | ✅    | ❌     |
| Edit/Delete Tasks    | ✅    | ❌     |
| Update Task Status   | ✅    | ✅     |
| View All Tasks       | ✅    | ❌     |
| View Own/Team Tasks  | ✅    | ✅     |
