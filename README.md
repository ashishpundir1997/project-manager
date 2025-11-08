# Project Manager

A full-stack project management application built with React, Node.js, Express, and MongoDB.

## Features

- **Project Dashboard**: View, create, edit, and delete projects with progress tracking
- **Task Management**: Add tasks to projects, mark them as complete/incomplete
- **Automatic Progress Calculation**: Project progress updates automatically when tasks are completed
- **Task Assignment**: Assign tasks to team members
- **Team Overview**: View team members with task capacity indicators
- **Clean UI**: Built with shadcn/ui components and TailwindCSS
- **Toast Notifications**: User-friendly success/error notifications
- **Confirmation Dialogs**: Custom confirmation dialogs for delete operations

## Tech Stack

### Frontend

- React 18 + TypeScript
- Vite
- TailwindCSS
- shadcn/ui components
- Zustand (state management)
- React Router
- Axios
- react-hot-toast

### Backend

- Node.js + Express
- MongoDB with Mongoose
- CORS enabled

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or cloud instance like MongoDB Atlas)
- npm or yarn

## Environment Variables Setup

### Backend Environment Variables

1. Navigate to the `backend` directory:

```bash
cd backend
```

2. Create a `.env` file in the `backend` directory:

```bash
touch .env
```

3. Add the following environment variables to `backend/.env`:

```env
# MongoDB Connection URI
# For local MongoDB:
MONGODB_URI=mongodb://localhost:27017/project-manager

# For MongoDB Atlas (cloud):
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/project-manager

# Server Port (default: 4000)
PORT=4000

# Optional: Secret key for future authentication
# SECRET=your-secret-key-here
```

**Important Notes:**

- Replace `username` and `password` with your MongoDB Atlas credentials if using cloud MongoDB
- The database name will be automatically set to `project-manager` if not specified in the URI
- Default port is 4000, but you can change it to any available port

### Frontend Environment Variables

1. Navigate to the `frontend` directory:

```bash
cd frontend
```

2. Create a `.env` file in the `frontend` directory:

```bash
touch .env
```

3. Add the following environment variables to `frontend/.env`:

```env
# Backend API URL
# Make sure the port matches your backend PORT
VITE_API_URL=http://localhost:4000/api

# For production, use your deployed backend URL:
# VITE_API_URL=https://your-backend-domain.com/api
```

**Important Notes:**

- The `VITE_` prefix is required for Vite to expose the variable to the frontend
- Make sure the port in `VITE_API_URL` matches the `PORT` in your backend `.env`
- For production builds, update this to your deployed backend URL

## Installation & Setup

### Backend Setup

1. Navigate to the backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create `.env` file with your MongoDB URI and port (see Environment Variables above)

4. Start the backend server:

```bash
# Production mode
npm start

# Development mode with auto-reload
npm run dev
```

The backend will run on `http://localhost:4000` (or your specified PORT)

### Frontend Setup

1. Navigate to the frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Create `.env` file with your API URL (see Environment Variables above)

4. Start the development server:

```bash
npm run dev
```

The frontend will run on `http://localhost:5173` (or another port if 5173 is taken)

5. Build for production:

```bash
npm run build
```

The production build will be in the `dist/` folder.

## Project Structure

```
project/
├── backend/
│   ├── config/
│   │   └── db.js          # MongoDB connection
│   ├── models/
│   │   ├── Project.js     # Project model
│   │   ├── Task.js        # Task model
│   │   └── TeamMember.js  # Team member model
│   ├── routes/
│   │   ├── projects.js    # Project routes
│   │   ├── tasks.js       # Task routes
│   │   └── team.js        # Team routes
│   ├── server.js          # Express server
│   ├── .env               # Environment variables (create this)
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── ui/         # shadcn/ui components
    │   │   ├── Layout.tsx  # Navigation layout
    │   │   └── confirm-dialog.tsx  # Confirmation dialog
    │   ├── pages/
    │   │   ├── Dashboard.tsx      # Project dashboard
    │   │   ├── ProjectDetail.tsx   # Project detail with tasks
    │   │   └── Team.tsx            # Team overview
    │   ├── store/
    │   │   ├── projectStore.ts     # Project state
    │   │   ├── taskStore.ts        # Task state
    │   │   └── teamStore.ts        # Team state
    │   ├── lib/
    │   │   ├── api.ts      # API client
    │   │   └── utils.ts    # Utility functions
    │   └── App.tsx         # Main app component
    ├── .env                # Environment variables (create this)
    └── package.json
```

## API Endpoints

### Projects

- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create a new project
- `PUT /api/projects/:id` - Update a project
- `DELETE /api/projects/:id` - Delete a project

### Tasks

- `GET /api/tasks/projects/:projectId/tasks` - Get all tasks for a project
- `POST /api/tasks/projects/:projectId/tasks` - Create a new task
- `PUT /api/tasks/:taskId` - Update a task
- `DELETE /api/tasks/:taskId` - Delete a task

### Team

- `GET /api/team` - Get all team members with task counts
- `POST /api/team` - Add a new team member

## Core Logic

When a task's completion status changes:

1. Backend recalculates project progress: `(completedTasks / totalTasks) * 100`
2. Updates project status to "Completed" if progress = 100%
3. Returns updated project in response
4. Frontend updates the progress bar instantly (optimistic UI)

When a task is assigned/unassigned:

1. Backend updates the task's `assignedTo` field
2. Updates team member's `assignedTasks` array
3. Team member task count updates automatically

## UI Design

- **Colors**: White background, light gray cards, blue accent
- **Components**: shadcn/ui (Button, Card, Progress, Dialog, Input, Select, ConfirmDialog)
- **Styling**: Rounded corners, subtle shadows, clean layout
- **Notifications**: Toast notifications for all user actions
- **Confirmations**: Custom dialogs for destructive actions

## Troubleshooting

### Backend Issues

**MongoDB Connection Error:**

- Check your `MONGODB_URI` in `backend/.env`
- Ensure MongoDB is running (local) or your Atlas cluster is accessible
- Verify your credentials are correct

**Port Already in Use:**

- Change the `PORT` in `backend/.env` to a different port
- Update `VITE_API_URL` in `frontend/.env` to match

**CORS Errors:**

- Ensure your frontend URL is in the allowed origins in `backend/server.js`
- Check that `VITE_API_URL` matches your backend URL

### Frontend Issues

**API Connection Failed:**

- Verify `VITE_API_URL` in `frontend/.env` matches your backend URL and port
- Ensure backend server is running
- Check browser console for specific error messages

**Build Errors:**

- Run `npm install` again to ensure all dependencies are installed
- Check that all TypeScript types are correct
- Verify environment variables are set correctly

## Development

### Running Both Servers

**Terminal 1 - Backend:**

```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**

```bash
cd frontend
npm run dev
```

## Production Deployment

1. **Backend:**

   - Set `MONGODB_URI` to your production MongoDB
   - Set `PORT` to your production port
   - Deploy to your hosting service (Heroku, Railway, etc.)

2. **Frontend:**
   - Update `VITE_API_URL` to your production backend URL
   - Run `npm run build`
   - Deploy the `dist/` folder to your hosting service (Vercel, Netlify, etc.)

## License

ISC
