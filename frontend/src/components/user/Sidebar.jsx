import {
  BarChartOutlined,
  DashboardOutlined,
  ExperimentOutlined,
  FileOutlined,
  FileTextOutlined,
  HeartOutlined,
  MedicineBoxOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Layout, Menu } from "antd";
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const { Sider } = Layout;

const menuItems = [
  { key: "/user", icon: <DashboardOutlined />, label: "Dashboard" },
  {
    key: "/user/health-profile",
    icon: <UserOutlined />,
    label: "Hồ sơ sức khỏe",
  },
  {
    key: "/user/vaccination",
    icon: <ExperimentOutlined />,
    label: "Tiêm chủng",
  },
  {
    key: "/user/medical-checkup",
    icon: <MedicineBoxOutlined />,
    label: "Kiểm tra y tế",
  },
  { key: "/user/reports", icon: <BarChartOutlined />, label: "Báo cáo" },
  { key: "/user/blog", icon: <FileTextOutlined />, label: "Blog" },
  {
    key: "/user/health-documents",
    icon: <FileOutlined />,
    label: "Tài liệu sức khỏe",
  },
  {
    key: "/user/medical-events",
    icon: <HeartOutlined />,
    label: "Sự kiện y tế",
  },
  {
    key: "/user/medicine-management",
    icon: <MedicineBoxOutlined />,
    label: "Quản lý Thuốc",
  },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Sider
      width={240}
      style={{
        position: "fixed",
        height: "100vh",
        left: 0,
        top: 64, // Adjust this value based on your header height
        overflow: "auto",
      }}
    >
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={({ key }) => navigate(key)}
        style={{ height: "100%" }}
      />
    </Sider>
  );
};

export default Sidebar;
