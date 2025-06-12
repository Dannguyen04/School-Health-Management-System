import { BellOutlined, MenuOutlined, UserOutlined } from "@ant-design/icons";
import { Avatar, Button, Dropdown, Layout, Space } from "antd";
import React from "react";
import { useNavigate } from "react-router-dom";

const { Header: AntHeader } = Layout;

const Header = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Add logout logic here
    navigate("/auth");
  };

  const userMenuItems = [
    {
      key: "profile",
      label: "Profile",
      onClick: () => navigate("/user/profile"),
    },
    {
      key: "logout",
      label: "Logout",
      onClick: handleLogout,
    },
  ];

  return (
    <AntHeader
      style={{
        position: "fixed",
        zIndex: 1000,
        width: "100%",
        display: "flex",
        alignItems: "center",
        padding: "0 24px",
        background: "#fff",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
      }}
    >
      <Button type="text" icon={<MenuOutlined />} style={{ marginRight: 16 }} />
      <div style={{ flex: 1, fontSize: 18, fontWeight: "bold" }}>
        School Health System
      </div>
      <Space size="middle">
        <Button type="text" icon={<BellOutlined />} style={{ fontSize: 16 }} />
        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
          <Avatar style={{ cursor: "pointer" }} icon={<UserOutlined />} />
        </Dropdown>
      </Space>
    </AntHeader>
  );
};

export default Header;
