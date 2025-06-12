import { Layout } from "antd";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/admin/Sidebar";
import Headers from "../components/shared/Header";

const { Content } = Layout;

const AdminLayout = () => {
  return (
    <Layout className="min-h-screen">
      <Sidebar />
      <Layout className="flex-1">
        <Headers />
        <Content className="m-6 p-6 bg-white rounded-lg shadow-sm">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
