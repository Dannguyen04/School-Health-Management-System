import {
    CheckCircleOutlined,
    FileTextOutlined,
    MedicineBoxOutlined,
    UserOutlined,
    AlertOutlined,
    CalendarOutlined,
} from "@ant-design/icons";
import { Bar, Line } from "@ant-design/plots";
import { Card, Col, Row, Statistic, Spin, Alert } from "antd";
import { useState, useEffect } from "react";
import { adminAPI } from "../../utils/api";

const AdminDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dashboardData, setDashboardData] = useState({
        userStats: {
            total: 0,
            active: 0,
            nurses: 0,
            parents: 0,
            students: 0,
        },
        formStats: {
            total: 0,
            approved: 0,
            pending: 0,
            rejected: 0,
        },
        medicationStats: {
            total: 0,
            active: 0,
            completed: 0,
        },
        medicalEventStats: {
            total: 0,
            resolved: 0,
            pending: 0,
            inProgress: 0,
        },
        vaccinationCampaignStats: {
            total: 0,
            upcoming: 0,
        },
        userGrowthData: [],
        formStatusData: [],
        medicalEventStatusData: [],
    });

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await adminAPI.getDashboardStats();
            if (response.data.success) {
                setDashboardData(response.data.data);
            } else {
                setError("Không thể tải dữ liệu dashboard");
            }
        } catch (err) {
            console.error("Lỗi khi tải dữ liệu dashboard:", err);
            setError("Có lỗi xảy ra khi tải dữ liệu");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spin size="large" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-6">
                <h1 className="text-2xl font-bold">Bảng điều khiển</h1>
                <Alert
                    message="Lỗi"
                    description={error}
                    type="error"
                    showIcon
                    action={
                        <button
                            onClick={fetchDashboardData}
                            className="text-blue-600 hover:text-blue-800"
                        >
                            Thử lại
                        </button>
                    }
                />
            </div>
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
                            title="Tổng số người dùng"
                            value={dashboardData.userStats.total}
                            prefix={<UserOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Tổng số biểu mẫu"
                            value={dashboardData.formStats.total}
                            prefix={<FileTextOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Biểu mẫu đã duyệt"
                            value={dashboardData.formStats.approved}
                            prefix={<CheckCircleOutlined />}
                            valueStyle={{ color: "#3f8600" }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Thuốc đang sử dụng"
                            value={dashboardData.medicationStats.active}
                            prefix={<MedicineBoxOutlined />}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Additional Statistics Cards */}
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Sự kiện y tế đã giải quyết"
                            value={dashboardData.medicalEventStats.resolved}
                            prefix={<AlertOutlined />}
                            valueStyle={{ color: "#52c41a" }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Sự kiện y tế đang chờ"
                            value={dashboardData.medicalEventStats.pending}
                            prefix={<AlertOutlined />}
                            valueStyle={{ color: "#faad14" }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Chiến dịch tiêm chủng"
                            value={dashboardData.vaccinationCampaignStats.total}
                            prefix={<CalendarOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Chiến dịch sắp tới"
                            value={
                                dashboardData.vaccinationCampaignStats.upcoming
                            }
                            prefix={<CalendarOutlined />}
                            valueStyle={{ color: "#1890ff" }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Charts */}
            <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                    <Card title="Xu hướng tăng trưởng người dùng">
                        <Line
                            data={dashboardData.userGrowthData}
                            xField="date"
                            yField="users"
                            smooth
                            point
                            height={300}
                        />
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card title="Phân bố trạng thái biểu mẫu">
                        <Bar
                            data={dashboardData.formStatusData}
                            xField="status"
                            yField="count"
                            height={300}
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                    <Card title="Phân bố trạng thái sự kiện y tế">
                        <Bar
                            data={dashboardData.medicalEventStatusData}
                            xField="status"
                            yField="count"
                            height={300}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default AdminDashboard;
