# Frontend

React + TypeScript + Vite frontend for the Project Manager application.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the `frontend` directory with the following variable:

```env
# Backend API URL
# Make sure the port matches your backend PORT
VITE_API_URL=http://localhost:4000/api

# For production, use your deployed backend URL:
# VITE_API_URL=https://your-backend-domain.com/api
```

### Environment Variables Explained

#### `VITE_API_URL` (Required)
- **Development**: `http://localhost:4000/api`
  - Replace `4000` with your backend PORT if different
  - Must include `/api` at the end
  
- **Production**: `https://your-backend-domain.com/api`
  - Replace with your deployed backend URL
  - Must include `/api` at the end

**Important Notes:**
- The `VITE_` prefix is **required** for Vite to expose the variable
- The variable must be set before running `npm run dev` or `npm run build`
- After changing `.env`, restart the dev server
- In production builds, the variable is embedded at build time

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173` (or another port if 5173 is taken)

4. Build for production:
```bash
npm run build
```

The production build will be in the `dist/` folder.

5. Preview production build:
```bash
npm run preview
```

## Pages

### Dashboard (`/dashboard`)
- View all projects in a card grid
- Each card shows: name, status, progress bar
- Actions: Add, Edit, Delete projects
- Click a project card to navigate to its detail page
- Toast notifications for all actions

### Project Detail (`/project/:id`)
- View all tasks for a project
- Toggle task completion (checkbox)
- Assign/unassign tasks to team members via dropdown
- Add, Edit, Delete tasks
- Progress updates automatically when tasks are completed
- Shows assigned team member name below each task

### Team (`/team`)
- View all team members
- Shows: name, number of assigned tasks, capacity bar
- Color coding:
  - **Green**: ≤3 tasks (Low capacity)
  - **Orange**: 4-6 tasks (Medium capacity)
  - **Red**: >6 tasks (High capacity)
- Add new team members

## State Management

Using Zustand stores:

### `projectStore`
- Manages all projects
- Functions: `fetchProjects`, `createProject`, `updateProject`, `deleteProject`

### `taskStore`
- Manages tasks organized by projectId
- Functions: `fetchTasks`, `createTask`, `updateTask`, `deleteTask`
- Automatically updates project progress when tasks change

### `teamStore`
- Manages team members
- Functions: `fetchMembers`, `createMember`
- Task counts are calculated from actual task assignments

## UI Components

Built with shadcn/ui:
- **Button** - Various variants (default, destructive, outline, ghost)
- **Card** - Container for content
- **Progress** - Progress bars for projects and team capacity
- **Dialog** - Modal dialogs for create/edit forms
- **ConfirmDialog** - Custom confirmation dialogs for delete actions
- **Input** - Text input fields
- **Select** - Dropdown selects for team member assignment
- **Table** - Data tables (available but not currently used)

## Styling

- **TailwindCSS** for layout and styling
- **Color Scheme**:
  - White background
  - Light gray cards (`bg-card`)
  - Blue accent color (`primary`)
  - Green for completed/success
  - Red for errors/destructive actions
- **Design**: Rounded corners, subtle shadows, clean layout

## Features

### Toast Notifications
- Success notifications (green) for successful operations
- Error notifications (red) for failed operations
- Auto-dismiss after 3 seconds
- Positioned at top-right

### Confirmation Dialogs
- Custom confirmation dialogs for delete operations
- Shows warning icon and clear message
- Prevents accidental deletions
- Styled with destructive variant (red)

### Optimistic UI Updates
- UI updates immediately when actions are performed
- Progress bars update instantly
- Task completion toggles immediately
- Backend syncs in the background

## API Integration

The frontend uses Axios for API calls:
- Base URL configured via `VITE_API_URL` environment variable
- Request/response interceptors for error handling
- All API calls are in `src/lib/api.ts`

## TypeScript

- Strict TypeScript configuration
- Type-safe API calls
- Type-safe state management
- Type-safe component props

## Build Configuration

### Development
- Hot Module Replacement (HMR)
- Fast refresh
- Source maps enabled

### Production
- Minified and optimized
- Tree-shaking enabled
- Code splitting
- Environment variables embedded at build time

## Troubleshooting

### API Connection Issues
- Verify `VITE_API_URL` in `.env` matches your backend URL
- Check that backend server is running
- Ensure CORS is configured correctly on backend
- Check browser console for specific errors

### Build Errors
- Run `npm install` to ensure all dependencies are installed
- Check TypeScript errors: `npm run build`
- Verify environment variables are set correctly
- Clear `node_modules` and reinstall if needed

### Environment Variables Not Working
- Ensure variable name starts with `VITE_`
- Restart dev server after changing `.env`
- For production, rebuild after changing `.env`
- Check that `.env` file is in the `frontend` directory

## Development Tips

- Use React DevTools for debugging
- Check browser console for errors
- Use Network tab to debug API calls
- Hot reload works automatically on file changes
- TypeScript errors show in terminal and browser

## Production Deployment

1. Update `VITE_API_URL` in `.env` to production backend URL
2. Run `npm run build`
3. Deploy the `dist/` folder to:
   - **Vercel**: Connect GitHub repo or upload `dist/` folder
   - **Netlify**: Drag and drop `dist/` folder or connect repo
   - **Other**: Upload `dist/` contents to your hosting service

**Important**: The environment variable must be set before building, as it's embedded at build time.
