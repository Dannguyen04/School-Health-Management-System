import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import ConsentForms from "./components/admin/ConsentForms";
import AdminDashboard from "./components/admin/Dashboard";
import MedicationInfo from "./components/admin/MedicationInfo";
import StudentManagement from "./components/admin/StudentManagement";
import UserManagement from "./components/admin/UserManagement";
import Campaigns from "./components/nurse/Campaigns";
import ConfirmedMedicines from "./components/nurse/ConfirmedMedicines";
import Dashboard from "./components/nurse/Dashboard";
import HealthCheckups from "./components/nurse/HealthCheckups";
import MedicalInventory from "./components/nurse/MedicalInventory";
import Reports from "./components/nurse/Reports";
import StudentTreatment from "./components/nurse/StudentTreatment";
import Vaccination from "./components/nurse/Vaccination";
import UserBlog from "./components/user/Blog";
import UserDashboard from "./components/user/Dashboard";
import UserHealthDocuments from "./components/user/HealthDocuments";
import UserHealthProfile from "./components/user/HealthProfile";
import UserMedicalCheckup from "./components/user/MedicalCheckup";
import UserMedicalEvents from "./components/user/MedicalEvents";
import UserMedicineManagement from "./components/user/MedicineManagement";
import UserReports from "./components/user/Reports";
import UserVaccination from "./components/user/Vaccination";
import { default as AdminLayout } from "./layouts/Admin";
import NurseLayout from "./layouts/Nurse";
import User from "./layouts/User";
import AuthPage from "./pages/AuthPage";
import Homepage from "./pages/Homepage";
import PrivateRoutes from "./utils/PrivateRoutes";
import RoleBaseRoutes from "./utils/RoleBaseRoutes";

// Import Nurse components

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Homepage />} />
                <Route path="/auth" element={<AuthPage />} />

                {/* Nurse Routes */}
                <Route
                    path="/nurse"
                    element={
                        <PrivateRoutes>
                            <RoleBaseRoutes requiredRole={["SCHOOL_NURSE"]}>
                                <NurseLayout />
                            </RoleBaseRoutes>
                        </PrivateRoutes>
                    }
                >
                    <Route index element={<Dashboard />} />
                    <Route path="campaigns" element={<Campaigns />} />
                    <Route
                        path="medical-inventory"
                        element={<MedicalInventory />}
                    />
                    <Route
                        path="student-treatment"
                        element={<StudentTreatment />}
                    />
                    <Route path="vaccination" element={<Vaccination />} />
                    <Route
                        path="health-checkups"
                        element={<HealthCheckups />}
                    />
                    <Route
                        path="confirmed-medicines"
                        element={<ConfirmedMedicines />}
                    />
                    <Route path="reports" element={<Reports />} />
                </Route>

                {/* Admin Routes */}
                <Route
                    path="/admin"
                    element={
                        <PrivateRoutes>
                            <RoleBaseRoutes requiredRole={["ADMIN"]}>
                                <AdminLayout />
                            </RoleBaseRoutes>
                        </PrivateRoutes>
                    }
                >
                    <Route index element={<AdminDashboard />} />
                    <Route path="users" element={<UserManagement />} />
                    <Route path="students" element={<StudentManagement />} />
                    <Route path="consent-forms" element={<ConsentForms />} />
                    <Route
                        path="medication-info"
                        element={<MedicationInfo />}
                    />
                </Route>

                {/* User Routes */}
                <Route
                    path="/user"
                    element={
                        <PrivateRoutes>
                            <RoleBaseRoutes requiredRole={["PARENT"]}>
                                <User />
                            </RoleBaseRoutes>
                        </PrivateRoutes>
                    }
                >
                    <Route index element={<UserDashboard />} />
                    <Route
                        path="health-profile"
                        element={<UserHealthProfile />}
                    />
                    <Route path="vaccination" element={<UserVaccination />} />
                    <Route
                        path="medical-checkup"
                        element={<UserMedicalCheckup />}
                    />
                    <Route path="reports" element={<UserReports />} />
                    <Route path="blog" element={<UserBlog />} />
                    <Route
                        path="medical-events"
                        element={<UserMedicalEvents />}
                    />
                    <Route
                        path="health-documents"
                        element={<UserHealthDocuments />}
                    />
                    <Route
                        path="medicine-management"
                        element={<UserMedicineManagement />}
                    />
                </Route>
            </Routes>
        </Router>
    );
};

export default App;
