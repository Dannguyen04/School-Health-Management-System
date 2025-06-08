import { Layout, theme } from "antd";
import { Outlet } from "react-router-dom";
import AdminHeader from "../components/admin/AdminHeader";
import SidebarMenu from "../components/admin/SidebarMenu";

const { Content, Sider } = Layout;

const Admin = () => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    <Layout style={{ minHeight: "100vh", height: "100vh" }}>
      <Sider
        breakpoint="lg"
        collapsedWidth="0"
        style={{
          height: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <SidebarMenu />
      </Sider>
      <Layout style={{ marginLeft: 200, height: "100%" }}>
        <AdminHeader />
        <Content
          style={{ margin: "24px 16px", padding: "0 24px", height: "100%" }}
        >
          <div
            style={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              padding: 24,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
              flex: 1,
            }}
          >
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Admin;
