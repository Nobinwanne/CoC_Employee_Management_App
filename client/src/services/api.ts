import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add response interceptor to unwrap data
api.interceptors.response.use(
  (response) => {
    // If response has success/data structure, unwrap it
    if (response.data && response.data.success !== undefined) {
      return {
        ...response,
        data: response.data.data, // Extract the actual data
      };
    }
    return response;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export const employeeAPI = {
  getAll: () => api.get("/employees"),
  getById: (id: string) => api.get(`/employees/${id}`),
  create: (data: any) => api.post("/employees", data),
  update: (id: string, data: any) => api.put(`/employees/${id}`, data),
  delete: (id: string) => api.delete(`/employees/${id}`),
};

export const departmentAPI = {
  getAll: () => api.get("/departments"),
  getById: (id: string) => api.get(`/departments/${id}`),
  create: (data: any) => api.post("/departments", data),
  update: (id: string, data: any) => api.put(`/departments/${id}`, data),
  delete: (id: string) => api.delete(`/departments/${id}`),
};

export const workUnitAPI = {
  getAll: () => api.get("/workunits"),
  getById: (id: string) => api.get(`/workunits/${id}`),
  create: (data: any) => api.post("/workunits", data),
  update: (id: string, data: any) => api.put(`/workunits/${id}`, data),
  delete: (id: string) => api.delete(`/workunits/${id}`),
};

export default api;
