# Backend API

Express + MongoDB backend for the Project Manager application.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the `backend` directory with the following variables:

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

### Environment Variables Explained

#### `MONGODB_URI` (Required)
- **Local MongoDB**: `mongodb://localhost:27017/project-manager`
  - Replace `27017` with your MongoDB port if different
  - The database name `project-manager` will be created automatically
  
- **MongoDB Atlas (Cloud)**:
  - Format: `mongodb+srv://username:password@cluster.mongodb.net/project-manager`
  - Get your connection string from MongoDB Atlas dashboard
  - Replace `username` and `password` with your Atlas credentials
  - Replace `cluster.mongodb.net` with your cluster URL

#### `PORT` (Optional)
- Default: `4000`
- Change to any available port (e.g., `5000`, `3000`)
- Make sure to update `VITE_API_URL` in frontend `.env` to match

#### `SECRET` (Optional)
- Currently not used, but can be added for future authentication features

3. Start the server:
```bash
# Production mode
npm start

# Development mode with auto-reload
npm run dev
```

The server will run on `http://localhost:4000` (or your specified PORT)

## API Endpoints

### Projects
- `GET /api/projects` - List all projects
  - Returns: Array of project objects with tasks populated
  
- `POST /api/projects` - Create a new project
  - Body: `{ "name": "Project Name" }`
  - Returns: Created project object
  
- `PUT /api/projects/:id` - Update a project
  - Body: `{ "name": "New Name", "status": "In Progress", "progress": 50 }`
  - Returns: Updated project object
  
- `DELETE /api/projects/:id` - Delete a project
  - Also deletes all associated tasks
  - Returns: Success message

### Tasks
- `GET /api/tasks/projects/:projectId/tasks` - List all tasks for a project
  - Returns: Array of task objects with assignedTo populated
  
- `POST /api/tasks/projects/:projectId/tasks` - Create a new task
  - Body: `{ "name": "Task Name", "assignedTo": "memberId" }` (assignedTo is optional)
  - Automatically updates project progress
  - Returns: `{ task, project }` (updated project with new progress)
  
- `PUT /api/tasks/:taskId` - Update a task
  - Body: `{ "name": "New Name", "completed": true, "assignedTo": "memberId" }`
  - If `completed` changes, automatically recalculates project progress
  - If `assignedTo` changes, updates team member's assignedTasks array
  - Returns: `{ task, project }` (if progress changed) or `{ task }`
  
- `DELETE /api/tasks/:taskId` - Delete a task
  - Removes task from project and team member's assignedTasks
  - Automatically updates project progress
  - Returns: `{ message, project }` (updated project)

### Team
- `GET /api/team` - List all team members with task counts
  - Returns: Array of member objects with `taskCount` field
  
- `POST /api/team` - Add a new team member
  - Body: `{ "name": "Member Name" }`
  - Returns: Member object with `taskCount: 0`

### Health Check
- `GET /api/health` - Check if server is running
  - Returns: `{ status: "OK", message: "Backend is running", port: 4000 }`

## Models

### Project
```javascript
{
  _id: ObjectId,
  name: String (required),
  status: 'Not Started' | 'In Progress' | 'Completed' (default: 'Not Started'),
  progress: Number (0-100, default: 0),
  tasks: [ObjectId] (references to Task documents),
  createdAt: Date,
  updatedAt: Date
}
```

### Task
```javascript
{
  _id: ObjectId,
  projectId: ObjectId (required, references Project),
  name: String (required),
  completed: Boolean (default: false),
  assignedTo: ObjectId (optional, references TeamMember),
  createdAt: Date,
  updatedAt: Date
}
```

### TeamMember
```javascript
{
  _id: ObjectId,
  name: String (required),
  assignedTasks: [ObjectId] (references to Task documents),
  createdAt: Date,
  updatedAt: Date
}
```

## Automatic Progress Calculation

When a task's `completed` status changes, the backend automatically:
1. Finds all tasks for the project
2. Calculates progress: `(completedTasks / totalTasks) * 100`
3. Updates project status:
   - "Completed" if progress = 100%
   - "In Progress" if progress > 0
   - "Not Started" if progress = 0
4. Returns the updated project in the response

## Task Assignment Synchronization

When a task is assigned/unassigned:
1. If assigned to a new member: Adds task ID to member's `assignedTasks` array
2. If unassigned: Removes task ID from previous member's `assignedTasks` array
3. If reassigned: Removes from old member, adds to new member
4. Team member task counts are calculated dynamically from actual task assignments

## CORS Configuration

The backend is configured to allow requests from:
- `http://localhost:5173` (Vite default)
- `http://localhost:3000` (Alternative React port)
- `http://localhost:5174` (Alternative Vite port)

To add more origins, update `backend/server.js`:
```javascript
app.use(cors({
  origin: ['http://localhost:5173', 'your-production-url'],
  // ...
}));
```

## Error Handling

All endpoints return appropriate HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (missing required fields)
- `404` - Not Found
- `500` - Internal Server Error

Error responses format:
```json
{
  "error": "Error message here"
}
```

## Database Connection

The database connection is handled in `config/db.js`:
- Automatically adds database name if not in URI
- Handles connection errors gracefully
- Logs connection status

## Development Tips

- Use `npm run dev` for development (auto-reload on file changes)
- Check MongoDB connection in console: "MongoDB Connected: ..."
- Test endpoints using Postman or curl
- Check server logs for debugging
