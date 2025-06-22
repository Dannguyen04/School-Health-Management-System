import axios from "axios";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: "http://localhost:5000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Nurse API endpoints
export const nurseAPI = {
  // Dashboard statistics
  getDashboardStats: () => api.get("/nurse/dashboard/stats"),

  // Recent medical events
  getRecentMedicalEvents: () => api.get("/nurse/dashboard/recent-events"),

  // Upcoming vaccinations
  getUpcomingVaccinations: () =>
    api.get("/nurse/dashboard/upcoming-vaccinations"),

  // Medical inventory
  getMedicalInventory: (params) => api.get("/nurse/inventory", { params }),
  createMedicalInventory: (data) => api.post("/nurse/inventory", data),
  updateMedicalInventory: (id, data) => api.put(`/nurse/inventory/${id}`, data),
  deleteMedicalInventory: (id) => api.delete(`/nurse/inventory/${id}`),
  getInventoryCategories: () => api.get("/nurse/inventory/categories"),

  // Pending medications
  getPendingMedicines: () => api.get("/medicines/pending"),

  // Medicine statistics
  getMedicineStats: () => api.get("/medicines/statistics"),

  // Medical events
  getAllMedicalEvents: () => api.get("/nurse/medical-events"),
  createMedicalEvent: (data) => api.post("/nurse/medical-events", data),
  getMedicalEventById: (id) => api.get(`/nurse/medical-events/${id}`),
  updateMedicalEvent: (id, data) =>
    api.put(`/nurse/medical-events/${id}`, data),
  deleteMedicalEvent: (id) => api.delete(`/nurse/medical-events/${id}`),
  updateMedicalEventStatus: (id, data) =>
    api.patch(`/nurse/medical-events/${id}/status`, data),

  // Students for nurse
  getStudentsForNurse: () => api.get("/admin/students-for-nurse"),
};

// User API endpoints
export const userAPI = {
  // Get current user profile
  getProfile: () => api.get("/auth/profile"),

  // Update current user profile
  updateProfile: (data) => api.put("/auth/profile", data),
};

// Admin API endpoints
export const adminAPI = {
  // Dashboard statistics
  getDashboardStats: () => api.get("/admin/dashboard/stats"),
};

export default api;
