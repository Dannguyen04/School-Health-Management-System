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
    updateMedicalInventory: (id, data) =>
        api.put(`/nurse/inventory/${id}`, data),
    deleteMedicalInventory: (id) => api.delete(`/nurse/inventory/${id}`),
    getInventoryCategories: () => api.get("/nurse/inventory/categories"),

    // Pending medications
    getPendingMedicines: () => api.get("/medicines/pending"),

    // Medicine statistics
    getMedicineStats: () => api.get("/medicines/statistics"),
};

export default api;
