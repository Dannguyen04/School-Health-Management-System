import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import Dashboard from "./components/admin/Dashboard";
import MedicalEvents from "./components/admin/MedicalEvents";
import MedicalSupplies from "./components/admin/MedicalSupplies";
import Reports from "./components/admin/Reports";
import StudentManagement from "./components/admin/StudentManagement";
import VaccinationManagement from "./components/admin/VaccinationManagement";
import Admin from "./layouts/Admin";
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
          <Route index element={<Dashboard />} />
          <Route path="students" element={<StudentManagement />} />
          <Route path="medical-events" element={<MedicalEvents />} />
          <Route path="vaccinations" element={<VaccinationManagement />} />
          <Route path="reports" element={<Reports />} />
          <Route path="medical-supplies" element={<MedicalSupplies />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
