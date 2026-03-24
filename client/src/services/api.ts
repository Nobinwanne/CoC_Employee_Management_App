import axios from "axios";

// Base API URL - change this if your backend runs on a different port
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error("API Request Error:", error);
    return Promise.reject(error);
  },
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    console.error("API Response Error:", error);

    if (error.code === "ECONNREFUSED" || error.code === "ERR_NETWORK") {
      console.error(
        "❌ Cannot connect to backend. Is the server running on port 5000?",
      );
    }

    return Promise.reject(error);
  },
);

// Employee API
export const employeeAPI = {
  // Get all employees
  getAll: async (params = {}) => {
    const response = await api.get("/employees", { params });
    return response.data;
  },

  // Get single employee
  getById: async (id: any) => {
    const response = await api.get(`/employees/${id}`);
    return response.data;
  },

  // Get employee's direct reports
  getDirectReports: async (id: any) => {
    const response = await api.get(`/employees/${id}/direct-reports`);
    return response.data;
  },

  // Get org chart
  getOrgChart: async () => {
    const response = await api.get("/employees/org/chart");
    return response.data;
  },

  // Create employee
  create: async (employeeData: any) => {
    const response = await api.post("/employees", employeeData);
    return response.data;
  },

  // Update employee
  update: async (id: any, employeeData: any) => {
    const response = await api.put(`/employees/${id}`, employeeData);
    return response.data;
  },

  // Delete employee
  delete: async (id: any, hard = false) => {
    const response = await api.delete(`/employees/${id}`, {
      params: { hard: hard ? "true" : "false" },
    });
    return response.data;
  },
};

// Department API
export const departmentAPI = {
  // Get all departments
  getAll: async () => {
    const response = await api.get("/departments");
    return response.data;
  },

  // Get single department
  getById: async (id: any) => {
    const response = await api.get(`/departments/${id}`);
    return response.data;
  },

  // Create department
  create: async (departmentData: any) => {
    const response = await api.post("/departments", departmentData);
    return response.data;
  },

  // Update department
  update: async (id: any, departmentData: any) => {
    const response = await api.put(`/departments/${id}`, departmentData);
    return response.data;
  },

  // Delete department
  delete: async (id: any) => {
    const response = await api.delete(`/departments/${id}`);
    return response.data;
  },
};

// Work Unit API
export const workUnitAPI = {
  // Get all work units
  getAll: async () => {
    const response = await api.get("/workunits");
    return response.data;
  },

  // Get work units by department
  getByDepartment: async (departmentId: any) => {
    const response = await api.get(`/workunits/department/${departmentId}`);
    return response.data;
  },

  // Get single work unit
  getById: async (id: any) => {
    const response = await api.get(`/workunits/${id}`);
    return response.data;
  },

  // Create work unit
  create: async (workUnitData: any) => {
    const response = await api.post("/workunits", workUnitData);
    return response.data;
  },

  // Update work unit
  update: async (id: any, workUnitData: any) => {
    const response = await api.put(`/workunits/${id}`, workUnitData);
    return response.data;
  },

  // Delete work unit
  delete: async (id: any) => {
    const response = await api.delete(`/workunits/${id}`);
    return response.data;
  },
};

// Health check
export const healthCheck = async () => {
  try {
    const response = await axios.get("http://localhost:5000/health", {
      timeout: 5000,
    });
    return response.data;
  } catch (error) {
    console.error("Health check failed:", error);
    throw error;
  }
};

export default api;
