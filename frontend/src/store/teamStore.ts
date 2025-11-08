import { create } from 'zustand';
import { teamAPI } from '@/lib/api';

export interface TeamMember {
  _id: string;
  name: string;
  assignedTasks: string[];
  taskCount: number;
}

interface TeamStore {
  members: TeamMember[];
  loading: boolean;
  error: string | null;
  fetchMembers: () => Promise<void>;
  createMember: (name: string) => Promise<void>;
}

export const useTeamStore = create<TeamStore>((set) => ({
  members: [],
  loading: false,
  error: null,

  fetchMembers: async () => {
    set({ loading: true, error: null });
    try {
      const response = await teamAPI.getAll();
      set({ members: response.data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  createMember: async (name: string) => {
    try {
      const response = await teamAPI.create({ name });
      const newMember = {
        ...response.data,
        taskCount: response.data.taskCount ?? 0, // Ensure taskCount is always a number
      };
      set((state) => ({
        members: [...state.members, newMember],
      }));
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },
}));

