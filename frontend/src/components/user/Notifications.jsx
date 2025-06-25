import { Card, Tabs, Typography, Space, Button, message } from "antd";
import {
    ReloadOutlined,
    CheckOutlined,
    DeleteOutlined,
} from "@ant-design/icons";
import React, { useState } from "react";
import NotificationDisplay from "../shared/NotificationDisplay";
import { useAuth } from "../../context/authContext";

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
            children: (
                <NotificationDisplay userId={user?.id} type="medical_event" />
            ),
        },
        {
            key: "vaccination",
            label: "Tiêm chủng",
            children: (
                <NotificationDisplay userId={user?.id} type="vaccination" />
            ),
        },
        {
            key: "medical_check",
            label: "Kiểm tra y tế",
            children: (
                <NotificationDisplay userId={user?.id} type="medical_check" />
            ),
        },
        {
            key: "medication",
            label: "Thuốc",
            children: (
                <NotificationDisplay userId={user?.id} type="medication" />
            ),
        },
        {
            key: "archived",
            label: "Đã lưu trữ",
            children: (
                <NotificationDisplay userId={user?.id} status="ARCHIVED" />
            ),
        },
    ];

    return (
        <div className="p-6">
            <Card>
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
    );
};

export default Notifications;
