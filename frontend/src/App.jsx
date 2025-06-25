import {
    Navigate,
    Route,
    BrowserRouter as Router,
    Routes,
} from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import AdminDashboard from "./components/admin/Dashboard";
import ParentManagement from "./components/admin/ParentManagement";
import StudentManagement from "./components/admin/StudentManagement";
import UserManagement from "./components/admin/UserManagement";
import AlertsAndEvents from "./components/manager/AlertsAndEvents";
import ManagerDashboard from "./components/manager/Dashboard";
import HealthCheckupCampaigns from "./components/manager/HealthCheckupCampaigns";
import HealthReports from "./components/manager/HealthReports";
import StudentList from "./components/manager/StudentList";
import VaccinationCampaigns from "./components/manager/VaccinationCampaigns";
import VaccineManagement from "./components/manager/VaccineManagement";
import ConfirmedMedicines from "./components/nurse/ConfirmedMedicines";
import Dashboard from "./components/nurse/Dashboard";
import HealthCheckups from "./components/nurse/HealthCheckups";
import MedicalEventReport from "./components/nurse/MedicalEventReport";
import MedicalInventory from "./components/nurse/MedicalInventory";
import StudentHealthProfile from "./components/nurse/StudentHealthProfile";
import StudentTreatment from "./components/nurse/StudentTreatment";
import Vaccination from "./components/nurse/Vaccination";
import About from "./components/parent/About";
import Doctors from "./components/parent/Doctors";
import Services from "./components/parent/Services";
import ScrollToTop from "./components/ScrollToTop";
import UserProfile from "./components/shared/UserProfile";
import Blog from "./components/user/Blog";
import VaccineConsentForm from "./components/user/ConsentForms";
import HealthCheckupResults from "./components/user/HealthCheckupResults";
import HealthProfile from "./components/user/HealthProfile";
import MedicineInfo from "./components/user/MedicineInfo";
import Notifications from "./components/user/Notifications";
import VaccinationSchedule from "./components/user/VaccinationSchedule";
import AdminLayout from "./layouts/Admin";
import ManagerLayout from "./layouts/Manager";
import NurseLayout from "./layouts/Nurse";
import User from "./layouts/User";
import AuthPage from "./pages/AuthPage";
import Homepage from "./pages/Homepage";
import PrivateRoutes from "./utils/PrivateRoutes";
import RoleBaseRoutes from "./utils/RoleBaseRoutes";

const App = () => {
    return (
        <Router>
            <ScrollToTop />
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
                    <Route
                        path="student-health-profile"
                        element={<StudentHealthProfile />}
                    />
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
                    <Route
                        path="medical-event"
                        element={<MedicalEventReport />}
                    />
                    <Route path="profile" element={<UserProfile />} />
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
                    <Route path="parents" element={<ParentManagement />} />
                    <Route path="profile" element={<UserProfile />} />
                </Route>

                {/* Manager Routes */}
                <Route
                    path="/manager"
                    element={
                        <PrivateRoutes>
                            <RoleBaseRoutes requiredRole={["MANAGER"]}>
                                <ManagerLayout />
                            </RoleBaseRoutes>
                        </PrivateRoutes>
                    }
                >
                    <Route index element={<ManagerDashboard />} />
                    <Route path="students" element={<StudentList />} />
                    <Route path="health-reports" element={<HealthReports />} />
                    <Route
                        path="vaccination-campaigns"
                        element={<VaccinationCampaigns />}
                    />
                    <Route path="vaccination" element={<VaccineManagement />} />
                    <Route
                        path="health-checkup-campaigns"
                        element={<HealthCheckupCampaigns />}
                    />
                    <Route path="alerts-events" element={<AlertsAndEvents />} />
                    <Route path="profile" element={<UserProfile />} />
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
                    <Route index element={<Navigate to="home" />} />
                    <Route path="home" element={<Homepage />} />
                    <Route path="about" element={<About />} />
                    <Route path="services" element={<Services />} />
                    <Route path="doctors" element={<Doctors />} />
                    <Route path="blog" element={<Blog />} />
                    <Route path="health-profile" element={<HealthProfile />} />
                    <Route path="medicine-info" element={<MedicineInfo />} />
                    <Route
                        path="consent-forms"
                        element={<VaccineConsentForm />}
                    />
                    <Route
                        path="health-checkup-results"
                        element={<HealthCheckupResults />}
                    />
                    <Route
                        path="vaccination-schedule"
                        element={<VaccinationSchedule />}
                    />
                    <Route path="notifications" element={<Notifications />} />
                    <Route path="profile" element={<UserProfile />} />
                </Route>
            </Routes>
        </Router>
    );
};

export default App;
