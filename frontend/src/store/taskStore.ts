import { create } from 'zustand';
import { tasksAPI } from '@/lib/api';
import { useProjectStore } from './projectStore';

export interface Task {
  _id: string;
  projectId: string;
  name: string;
  completed: boolean;
  assignedTo?: string | { _id: string; name: string };
  createdAt?: string;
  updatedAt?: string;
}

interface TaskStore {
  tasks: Record<string, Task[]>; // projectId -> tasks
  loading: boolean;
  error: string | null;
  fetchTasks: (projectId: string) => Promise<void>;
  createTask: (projectId: string, name: string, assignedTo?: string) => Promise<void>;
  updateTask: (taskId: string, data: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: {},
  loading: false,
  error: null,

  fetchTasks: async (projectId: string) => {
    set({ loading: true, error: null });
    try {
      const response = await tasksAPI.getByProject(projectId);
      set((state) => ({
        tasks: { ...state.tasks, [projectId]: response.data },
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  createTask: async (projectId: string, name: string, assignedTo?: string) => {
    try {
      const response = await tasksAPI.create(projectId, { name, assignedTo });
      const { task, project } = response.data;
      
      // Update tasks
      set((state) => ({
        tasks: {
          ...state.tasks,
          [projectId]: [task, ...(state.tasks[projectId] || [])],
        },
      }));

      // Update project in project store
      useProjectStore.getState().updateProject(projectId, project);
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  updateTask: async (taskId: string, data: Partial<Task>) => {
    try {
      // Convert assignedTo object to string if needed
      const updateData: { name?: string; completed?: boolean; assignedTo?: string } = {
        ...data,
        assignedTo: typeof data.assignedTo === 'object' && data.assignedTo !== null
          ? data.assignedTo._id
          : data.assignedTo,
      };
      const response = await tasksAPI.update(taskId, updateData);
      const { task, project } = response.data;

      // Update task in store
      set((state) => {
        const projectId = task.projectId;
        const updatedTasks = { ...state.tasks };
        if (updatedTasks[projectId]) {
          updatedTasks[projectId] = updatedTasks[projectId].map((t) =>
            t._id === taskId ? task : t
          );
        }
        return { tasks: updatedTasks };
      });

      // Update project if it was returned
      if (project) {
        useProjectStore.getState().updateProject(project._id, project);
      }
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  deleteTask: async (taskId: string) => {
    try {
      const currentTasks = get().tasks;
      let projectId: string | null = null;

      // Find projectId for this task
      for (const [pid, tasks] of Object.entries(currentTasks)) {
        if (tasks.some((t) => t._id === taskId)) {
          projectId = pid;
          break;
        }
      }

      const response = await tasksAPI.delete(taskId);
      const { project } = response.data;

      // Remove task from store
      if (projectId) {
        set((state) => ({
          tasks: {
            ...state.tasks,
            [projectId!]: state.tasks[projectId!]?.filter(
              (t) => t._id !== taskId
            ),
          },
        }));

        // Update project
        if (project) {
          useProjectStore.getState().updateProject(project._id, project);
        }
      }
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },
}));

