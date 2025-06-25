import { ReloadOutlined } from "@ant-design/icons";
import { Button, Card, Space, Tabs, Typography } from "antd";
import { useState } from "react";
import { useAuth } from "../../context/authContext";
import NotificationDisplay from "../shared/NotificationDisplay";

const { Title } = Typography;

const Notifications = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("all");

  const handleRefresh = () => {
    // Trigger refresh by changing key
    window.location.reload();
  };

  const tabItems = [
    {
      key: "all",
      label: "Tất cả thông báo",
      children: <NotificationDisplay userId={user?.id} />,
    },
    {
      key: "medical_event",
      label: "Sự kiện y tế",
      children: <NotificationDisplay userId={user?.id} type="medical_event" />,
    },
    {
      key: "vaccination",
      label: "Tiêm chủng",
      children: <NotificationDisplay userId={user?.id} type="vaccination" />,
    },
    {
      key: "medical_check",
      label: "Kiểm tra y tế",
      children: <NotificationDisplay userId={user?.id} type="medical_check" />,
    },
    {
      key: "medication",
      label: "Thuốc",
      children: <NotificationDisplay userId={user?.id} type="medication" />,
    },
    {
      key: "archived",
      label: "Đã lưu trữ",
      children: <NotificationDisplay userId={user?.id} status="ARCHIVED" />,
    },
  ];

  return (
    <div className="min-h-screen flex justify-center items-center bg-[#f6fcfa]">
      <div className="w-full max-w-5xl mx-auto px-4">
        <Card
          className="w-full rounded-3xl shadow-lg border-0 mt-12"
          style={{
            background: "#fff",
            borderRadius: "1.5rem",
            boxShadow: "0px 3px 16px rgba(0,0,0,0.10)",
            padding: "2rem",
            marginTop: "3rem",
            maxWidth: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 24,
            }}
          >
            <Title level={3}>Thông báo</Title>
            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={handleRefresh}
                title="Làm mới"
              >
                Làm mới
              </Button>
            </Space>
          </div>

          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
            size="large"
          />
        </Card>
      </div>
    </div>
  );
};

export default Notifications;
