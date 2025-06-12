import { Layout } from "antd";
import { Outlet } from "react-router-dom";
import AppHeader from "../components/user/Header";
import AppSidebar from "../components/user/Sidebar";

const { Sider, Content, Header } = Layout;

const User = () => {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header
        style={{
          padding: 0,
          background: "#fff",
          height: 64,
          position: "fixed",
          zIndex: 1,
          width: "100%",
        }}
      >
        <AppHeader />
      </Header>
      <Layout>
        <Sider
          width={240}
          style={{
            overflow: "auto",
            height: "100vh",
            position: "fixed",
            left: 0,
            top: 64,
            bottom: 0,
          }}
        >
          <AppSidebar />
        </Sider>
        <Content
          style={{
            marginLeft: 240, // Match sidebar width
            marginTop: 64, // Match header height
            padding: 24,
            minHeight: "calc(100vh - 64px)", // Adjust for header height
            background: "#f5f5f5",
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default User;
