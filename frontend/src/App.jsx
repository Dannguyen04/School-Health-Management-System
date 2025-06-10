import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import AdminDashboard from "./components/admin/Dashboard";
import AdminMedicalEvents from "./components/admin/MedicalEvents";
import MedicalSupplies from "./components/admin/MedicalSupplies";
import AdminReports from "./components/admin/Reports";
import StudentManagement from "./components/admin/StudentManagement";
import VaccinationManagement from "./components/admin/VaccinationManagement";
import UserBlog from "./components/user/Blog";
import UserDashboard from "./components/user/Dashboard";
import UserHealthDocuments from "./components/user/HealthDocuments";
import UserHealthProfile from "./components/user/HealthProfile";
import UserMedicalCheckup from "./components/user/MedicalCheckup";
import UserMedicalEvents from "./components/user/MedicalEvents";
import UserMedicineManagement from "./components/user/MedicineManagement";
import UserReports from "./components/user/Reports";
import UserVaccination from "./components/user/Vaccination";
import Admin from "./layouts/Admin";
import User from "./layouts/User";
import AuthPage from "./pages/AuthPage";
import Homepage from "./pages/Homepage";
import PrivateRoutes from "./utils/PrivateRoutes";
import RoleBaseRoutes from "./utils/RoleBaseRoutes";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route
          path="/admin"
          element={
            <PrivateRoutes>
              <RoleBaseRoutes requiredRole={["admin"]}>
                <Admin />
              </RoleBaseRoutes>
            </PrivateRoutes>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="students" element={<StudentManagement />} />
          <Route path="medical-events" element={<AdminMedicalEvents />} />
          <Route path="vaccinations" element={<VaccinationManagement />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="medical-supplies" element={<MedicalSupplies />} />
        </Route>
        <Route
          path="/user"
          element={
            <PrivateRoutes>
              <RoleBaseRoutes requiredRole={["user"]}>
                <User />
              </RoleBaseRoutes>
            </PrivateRoutes>
          }
        >
          <Route index element={<UserDashboard />} />
          <Route path="health-profile" element={<UserHealthProfile />} />
          <Route path="vaccination" element={<UserVaccination />} />
          <Route path="medical-checkup" element={<UserMedicalCheckup />} />
          <Route path="reports" element={<UserReports />} />
          <Route path="blog" element={<UserBlog />} />
          <Route path="medical-events" element={<UserMedicalEvents />} />
          <Route path="health-documents" element={<UserHealthDocuments />} />
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
