import {
    AlertOutlined,
    CalendarOutlined,
    MedicineBoxOutlined,
    TeamOutlined,
} from "@ant-design/icons";
import { Alert, Card, Col, Row, Statistic, Table, Spin } from "antd";
import React, { useState, useEffect } from "react";
import { nurseAPI } from "../../utils/api";

const Dashboard = () => {
    const [loading, setLoading] = useState(true);
    const [dashboardStats, setDashboardStats] = useState({
        totalStudents: 0,
        totalMedicalEvents: 0,
        upcomingVaccinations: 0,
        pendingTasks: 0,
        pendingMedications: 0,
        lowStockItems: 0,
    });
    const [medicalInventory, setMedicalInventory] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);

                // Fetch dashboard statistics
                const statsResponse = await nurseAPI.getDashboardStats();
                setDashboardStats(statsResponse.data.data);

                // Fetch medical inventory
                const inventoryResponse = await nurseAPI.getMedicalInventory();
                setMedicalInventory(inventoryResponse.data.data);
            } catch (err) {
                console.error("Error fetching dashboard data:", err);
                setError("Không thể tải dữ liệu dashboard");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // Filter low stock items
    const lowStockItems = medicalInventory.filter(
        (item) => item.quantity <= item.minStock
    );

    const columns = [
        {
            title: "Tên vật tư",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "Tồn kho hiện tại",
            dataIndex: "quantity",
            key: "quantity",
            render: (text, record) => `${text} ${record.unit}`,
        },
        {
            title: "Tồn kho tối thiểu",
            dataIndex: "minStock",
            key: "minStock",
            render: (text, record) => `${text} ${record.unit}`,
        },
    ];

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spin size="large" />
            </div>
        );
    }

    if (error) {
        return (
            <Alert
                message="Lỗi"
                description={error}
                type="error"
                showIcon
                className="mb-4"
            />
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Bảng điều khiển</h1>

            {/* Statistics Cards */}
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Tổng số học sinh"
                            value={dashboardStats.totalStudents}
                            prefix={<TeamOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Sự cố y tế tháng này"
                            value={dashboardStats.totalMedicalEvents}
                            prefix={<AlertOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Tiêm chủng sắp tới"
                            value={dashboardStats.upcomingVaccinations}
                            prefix={<CalendarOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Công việc đang chờ"
                            value={dashboardStats.pendingTasks}
                            prefix={<CalendarOutlined />}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Alerts Section */}
            {lowStockItems.length > 0 && (
                <Alert
                    message="Cảnh báo tồn kho thấp"
                    description={`${lowStockItems.length} vật tư đang ở mức tồn kho thấp`}
                    type="warning"
                    showIcon
                    icon={<AlertOutlined />}
                />
            )}

            {/* Low Stock Items Table */}
            {lowStockItems.length > 0 && (
                <Card title="Vật tư tồn kho thấp" className="mt-4">
                    <Table
                        dataSource={lowStockItems}
                        columns={columns}
                        rowKey="id"
                        pagination={false}
                    />
                </Card>
            )}

            {/* Pending Medications */}
            <Card title="Thuốc đang chờ" className="mt-4">
                <Statistic
                    title="Học sinh cần uống thuốc"
                    value={dashboardStats.pendingMedications}
                    prefix={<MedicineBoxOutlined />}
                />
            </Card>
        </div>
    );
};

export default Dashboard;
