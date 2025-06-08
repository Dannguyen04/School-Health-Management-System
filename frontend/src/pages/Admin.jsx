import { Layout, theme } from "antd";
import { Route, Routes } from "react-router-dom";
import AdminHeader from "../components/admin/AdminHeader";
import Dashboard from "../components/admin/Dashboard";
import MedicalEvents from "../components/admin/MedicalEvents";
import MedicalSupplies from "../components/admin/MedicalSupplies";
import Reports from "../components/admin/Reports";
import SidebarMenu from "../components/admin/SidebarMenu";
import StudentManagement from "../components/admin/StudentManagement";
import VaccinationManagement from "../components/admin/VaccinationManagement";

const { Content, Sider } = Layout;
const SIDEBAR_WIDTH = 250;

const Admin = () => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    <Layout style={{ minHeight: "100vh", background: "#f5f6fa" }}>
      <Sider
        width={SIDEBAR_WIDTH}
        style={{
          height: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 10,
          background: "#001529",
        }}
        breakpoint="lg"
        collapsedWidth="0"
      >
        <SidebarMenu />
      </Sider>
      <Layout style={{ marginLeft: SIDEBAR_WIDTH, background: "#f5f6fa" }}>
        <AdminHeader />
        <Content style={{ margin: "24px 16px", padding: 0 }}>
          <div
            style={{
              padding: 24,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
              minHeight: "calc(100vh - 72px - 48px)", // 72px header, 48px margin
              boxShadow: "0 2px 8px #f0f1f2",
            }}
          >
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/students" element={<StudentManagement />} />
              <Route path="/medical-events" element={<MedicalEvents />} />
              <Route path="/vaccinations" element={<VaccinationManagement />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/medical-supplies" element={<MedicalSupplies />} />
            </Routes>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Admin;
