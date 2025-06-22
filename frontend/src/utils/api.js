import axios from "axios";

const API_BASE_URL = "/api"; // Use relative path for proxy

// Create axios instance with default config
const api = axios.create({
<<<<<<< Updated upstream
<<<<<<< Updated upstream
    baseURL: API_BASE_URL,
=======
    baseURL: "/api",
>>>>>>> Stashed changes
=======
    baseURL: "/api",
>>>>>>> Stashed changes
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
    updateMedicalInventory: (id, data) =>
        api.put(`/nurse/inventory/${id}`, data),
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

// Parent API endpoints
export const parentAPI = {
    // Get children of logged-in parent
    getChildren: () => api.get("/parents/my-children"),
    
<<<<<<< Updated upstream
<<<<<<< Updated upstream
    // Get student details by ID
    getStudentById: (studentId) => api.get(`/parents/students/${studentId}`),
    
    // Health profile operations
    getHealthProfile: (studentId) => api.get(`/parents/health-profile/${studentId}`),
    upsertHealthProfile: (studentId, data) => api.post(`/parents/health-profile/${studentId}`, data),
    
    // Medicine operations
    getStudentMedicines: (studentId) => api.get(`/parents/students/${studentId}/medicines`),
    requestMedication: (studentId, data) => api.post(`/parents/request-medication/${studentId}`, data),
    
    // Get students by parent ID (for non-authenticated access)
    getStudentsByParentId: (parentId) => api.get(`/parents/students?parentId=${parentId}`),
};

// Auth API functions
export const authAPI = {
    login: async (credentials) => {
        const response = await api.post('/auth/login', credentials);
        return response.data;
    },
    verify: async () => {
        const response = await api.get('/auth/verify');
        return response.data;
    }
=======
    // Health profile operations
    getHealthProfile: (studentId) => api.get(`/parents/health-profile/${studentId}`),
    upsertHealthProfile: (studentId, data) => api.post(`/parents/health-profile/${studentId}`, data),
>>>>>>> Stashed changes
=======
    // Health profile operations
    getHealthProfile: (studentId) => api.get(`/parents/health-profile/${studentId}`),
    upsertHealthProfile: (studentId, data) => api.post(`/parents/health-profile/${studentId}`, data),
>>>>>>> Stashed changes
};

export default api;
