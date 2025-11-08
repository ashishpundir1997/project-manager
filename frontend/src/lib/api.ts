import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Projects API
export const projectsAPI = {
  getAll: () => api.get("/projects"),
  create: (data: { name: string }) => api.post("/projects", data),
  update: (
    id: string,
    data: { name?: string; status?: string; progress?: number }
  ) => api.put(`/projects/${id}`, data),
  delete: (id: string) => api.delete(`/projects/${id}`),
};

// Tasks API
export const tasksAPI = {
  getByProject: (projectId: string) =>
    api.get(`/tasks/projects/${projectId}/tasks`),
  create: (projectId: string, data: { name: string; assignedTo?: string }) =>
    api.post(`/tasks/projects/${projectId}/tasks`, data),
  update: (
    taskId: string,
    data: { name?: string; completed?: boolean; assignedTo?: string }
  ) => api.put(`/tasks/${taskId}`, data),
  delete: (taskId: string) => api.delete(`/tasks/${taskId}`),
};

// Team API
export const teamAPI = {
  getAll: () => api.get("/team"),
  create: (data: { name: string }) => api.post("/team", data),
};

export default api;
