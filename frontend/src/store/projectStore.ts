import { create } from 'zustand';
import { projectsAPI } from '@/lib/api';

export interface Project {
  _id: string;
  name: string;
  status: 'Not Started' | 'In Progress' | 'Completed';
  progress: number;
  tasks: string[];
  createdAt?: string;
  updatedAt?: string;
}

interface ProjectStore {
  projects: Project[];
  loading: boolean;
  error: string | null;
  fetchProjects: () => Promise<void>;
  createProject: (name: string) => Promise<void>;
  updateProject: (id: string, data: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
}

export const useProjectStore = create<ProjectStore>((set) => ({
  projects: [],
  loading: false,
  error: null,

  fetchProjects: async () => {
    set({ loading: true, error: null });
    try {
      const response = await projectsAPI.getAll();
      set({ projects: response.data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  createProject: async (name: string) => {
    try {
      const response = await projectsAPI.create({ name });
      set((state) => ({
        projects: [response.data, ...state.projects],
      }));
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  updateProject: async (id: string, data: Partial<Project>) => {
    try {
      const response = await projectsAPI.update(id, data);
      set((state) => ({
        projects: state.projects.map((p) =>
          p._id === id ? response.data : p
        ),
      }));
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  deleteProject: async (id: string) => {
    try {
      await projectsAPI.delete(id);
      set((state) => ({
        projects: state.projects.filter((p) => p._id !== id),
      }));
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },
}));

