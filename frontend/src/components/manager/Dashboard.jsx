import {
    AlertOutlined,
    CalendarOutlined,
    CheckCircleOutlined,
    FileTextOutlined,
    PlusOutlined,
    TeamOutlined,
    UserOutlined,
    WarningOutlined,
    MedicineBoxOutlined,
    CloseCircleOutlined,
    ClockCircleOutlined,
} from "@ant-design/icons";
import {
    Button,
    Card,
    Col,
    Row,
    Statistic,
    Table,
    Tag,
    Typography,
    Progress,
} from "antd";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const { Title, Text } = Typography;

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalCampaigns: 0,
        totalConsents: 0,
        pendingConsents: 0,
        agreedConsents: 0,
        declinedConsents: 0,
    });
    const [recentConsents, setRecentConsents] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Mock data
    const dashboardData = {
        totalStudents: 1200,
        vaccinatedStudents: 980,
        healthCheckups: 850,
        incidents: 5,
        gradeStats: [
            {
                grade: "Lớp 1",
                totalStudents: 200,
                vaccinated: 180,
                healthCheckups: 190,
                medications: 15,
            },
            {
                grade: "Lớp 2",
                totalStudents: 220,
                vaccinated: 200,
                healthCheckups: 210,
                medications: 18,
            },
            {
                grade: "Lớp 3",
                totalStudents: 210,
                vaccinated: 190,
                healthCheckups: 200,
                medications: 12,
            },
            {
                grade: "Lớp 4",
                totalStudents: 230,
                vaccinated: 210,
                healthCheckups: 220,
                medications: 20,
            },
            {
                grade: "Lớp 5",
                totalStudents: 240,
                vaccinated: 220,
                healthCheckups: 230,
                medications: 25,
            },
        ],
    };

    const columns = [
        {
            title: "Lớp",
            dataIndex: "grade",
            key: "grade",
        },
        {
            title: "Tổng số học sinh",
            dataIndex: "totalStudents",
            key: "totalStudents",
        },
        {
            title: "Đã tiêm chủng",
            dataIndex: "vaccinated",
            key: "vaccinated",
        },
        {
            title: "Khám sức khỏe",
            dataIndex: "healthCheckups",
            key: "healthCheckups",
        },
        {
            title: "Thuốc",
            dataIndex: "medications",
            key: "medications",
        },
    ];

    const healthStats = [
        { title: "Total Students", value: 1200, icon: <UserOutlined /> },
        { title: "Vaccinated", value: 980, icon: <CheckCircleOutlined /> },
        {
            title: "Health Check Completed",
            value: 850,
            icon: <CheckCircleOutlined />,
        },
        { title: "Pending Alerts", value: 5, icon: <WarningOutlined /> },
    ];

    const recentAlerts = [
        {
            id: 1,
            type: "Vaccination",
            message: "Hepatitis B vaccination due for Class 10A",
            date: "2024-03-20",
        },
        {
            id: 2,
            type: "Health Check",
            message: "Annual health checkup scheduled for Class 8B",
            date: "2024-03-25",
        },
        {
            id: 3,
            type: "Alert",
            message: "Increased cases of flu reported in Class 9C",
            date: "2024-03-18",
        },
    ];

    const upcomingCampaigns = [
        {
            id: 1,
            type: "Vaccination",
            name: "COVID-19 Booster",
            date: "2024-04-01",
            status: "Upcoming",
        },
        {
            id: 2,
            type: "Health Check",
            name: "Annual Physical Exam",
            date: "2024-04-15",
            status: "Upcoming",
        },
    ];

    const alertColumns = [
        { title: "Type", dataIndex: "type", key: "type" },
        { title: "Message", dataIndex: "message", key: "message" },
        { title: "Date", dataIndex: "date", key: "date" },
    ];

    const campaignColumns = [
        { title: "Type", dataIndex: "type", key: "type" },
        { title: "Name", dataIndex: "name", key: "name" },
        { title: "Date", dataIndex: "date", key: "date" },
        { title: "Status", dataIndex: "status", key: "status" },
    ];

    const getAuthToken = () => {
        return localStorage.getItem("token");
    };

    const getHeaders = () => ({
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
    });

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // Fetch vaccination campaigns
            const campaignsResponse = await axios.get(
                "/api/manager/vaccination-campaigns",
                { headers: getHeaders() }
            );

            if (campaignsResponse.data.success) {
                const campaigns = campaignsResponse.data.data;

                // Calculate consent statistics
                let totalConsents = 0;
                let agreedConsents = 0;
                let declinedConsents = 0;
                let recentConsentsData = [];

                for (const campaign of campaigns) {
                    if (campaign.consents) {
                        totalConsents += campaign.consents.length;
                        agreedConsents += campaign.consents.filter(
                            (c) => c.consent === true
                        ).length;
                        declinedConsents += campaign.consents.filter(
                            (c) => c.consent === false
                        ).length;

                        // Add recent consents
                        campaign.consents.forEach((consent) => {
                            recentConsentsData.push({
                                ...consent,
                                campaignName: campaign.name,
                                vaccineName: campaign.vaccine?.name,
                            });
                        });
                    }
                }

                // Sort by submission date
                recentConsentsData.sort(
                    (a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)
                );
                setRecentConsents(recentConsentsData.slice(0, 5)); // Get latest 5

                setStats({
                    totalStudents: 0, // This would need a separate API call
                    totalCampaigns: campaigns.length,
                    totalConsents,
                    pendingConsents: 0, // This would need calculation based on target students
                    agreedConsents,
                    declinedConsents,
                });
            }
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const consentColumns = [
        {
            title: "Chiến dịch",
            dataIndex: "campaignName",
            key: "campaignName",
        },
        {
            title: "Vắc xin",
            dataIndex: "vaccineName",
            key: "vaccineName",
        },
        {
            title: "Học sinh",
            dataIndex: ["student", "user", "fullName"],
            key: "studentName",
        },
        {
            title: "Phụ huynh",
            dataIndex: ["parent", "user", "fullName"],
            key: "parentName",
        },
        {
            title: "Trạng thái",
            dataIndex: "consent",
            key: "consent",
            render: (consent) => (
                <Tag color={consent ? "success" : "error"}>
                    {consent ? "Đã đồng ý" : "Đã từ chối"}
                </Tag>
            ),
        },
        {
            title: "Ngày gửi",
            dataIndex: "submittedAt",
            key: "submittedAt",
            render: (date) => new Date(date).toLocaleDateString("vi-VN"),
        },
    ];

    const getAgreementRate = () => {
        if (stats.totalConsents === 0) return 0;
        return Math.round((stats.agreedConsents / stats.totalConsents) * 100);
    };

    return (
        <div className="space-y-6">
            <Title level={2}>Dashboard Quản lý</Title>

            <Row gutter={16}>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Tổng số học sinh"
                            value={stats.totalStudents}
                            prefix={<UserOutlined />}
                            loading={loading}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Chiến dịch tiêm chủng"
                            value={stats.totalCampaigns}
                            prefix={<MedicineBoxOutlined />}
                            loading={loading}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Phiếu đồng ý đã nhận"
                            value={stats.totalConsents}
                            prefix={<FileTextOutlined />}
                            loading={loading}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Tỷ lệ đồng ý"
                            value={getAgreementRate()}
                            suffix="%"
                            prefix={<CheckCircleOutlined />}
                            loading={loading}
                        />
                    </Card>
                </Col>
            </Row>

            <Card title="Thống kê theo lớp">
                <Table
                    dataSource={dashboardData.gradeStats}
                    columns={columns}
                    rowKey="grade"
                    pagination={false}
                />
            </Card>

            <Row gutter={16}>
                <Col xs={24} lg={12}>
                    <Card title="Tiêm chủng tháng">
                        <div className="h-64 flex items-center justify-center text-gray-500">
                            Biểu đồ tiêm chủng tháng
                        </div>
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card title="Khám sức khỏe tháng">
                        <div className="h-64 flex items-center justify-center text-gray-500">
                            Biểu đồ khám sức khỏe tháng
                        </div>
                    </Card>
                </Col>
            </Row>

            <Row gutter={16}>
                <Col xs={24} lg={12}>
                    <Card title="Thuốc tháng">
                        <div className="h-64 flex items-center justify-center text-gray-500">
                            Biểu đồ thuốc tháng
                        </div>
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card title="Sự cố tháng">
                        <div className="h-64 flex items-center justify-center text-gray-500">
                            Biểu đồ sự cố tháng
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Health Status Overview */}
            <Row gutter={[16, 16]}>
                {healthStats.map((stat, index) => (
                    <Col xs={24} sm={12} md={6} key={index}>
                        <Card>
                            <Statistic
                                title={stat.title}
                                value={stat.value}
                                prefix={stat.icon}
                            />
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Recent Alerts */}
            <Card
                title={
                    <div className="flex items-center">
                        <AlertOutlined className="mr-2" />
                        Recent Health Alerts
                    </div>
                }
            >
                <Table
                    dataSource={recentAlerts}
                    columns={alertColumns}
                    pagination={false}
                    size="small"
                />
            </Card>

            {/* Upcoming Campaigns */}
            <Card
                title={
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <CalendarOutlined className="mr-2" />
                            Upcoming Campaigns
                        </div>
                        <Button type="primary" icon={<PlusOutlined />}>
                            Create New Campaign
                        </Button>
                    </div>
                }
            >
                <Table
                    dataSource={upcomingCampaigns}
                    columns={campaignColumns}
                    pagination={false}
                    size="small"
                />
            </Card>

            {/* Consent Statistics */}
            <Row gutter={16}>
                <Col xs={24} lg={12}>
                    <Card title="Thống kê phiếu đồng ý tiêm chủng">
                        <div className="space-y-4">
                            <div>
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        marginBottom: 8,
                                    }}
                                >
                                    <Text>Đã đồng ý</Text>
                                    <Text strong>{stats.agreedConsents}</Text>
                                </div>
                                <Progress
                                    percent={getAgreementRate()}
                                    strokeColor="#52c41a"
                                    showInfo={false}
                                />
                            </div>
                            <div>
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        marginBottom: 8,
                                    }}
                                >
                                    <Text>Đã từ chối</Text>
                                    <Text strong>{stats.declinedConsents}</Text>
                                </div>
                                <Progress
                                    percent={
                                        stats.totalConsents > 0
                                            ? Math.round(
                                                  (stats.declinedConsents /
                                                      stats.totalConsents) *
                                                      100
                                              )
                                            : 0
                                    }
                                    strokeColor="#ff4d4f"
                                    showInfo={false}
                                />
                            </div>
                        </div>
                        <div style={{ marginTop: 16 }}>
                            <Button
                                type="primary"
                                onClick={() =>
                                    navigate("/manager/vaccination-campaigns")
                                }
                            >
                                Xem chi tiết
                            </Button>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card title="Phiếu đồng ý gần đây">
                        <Table
                            dataSource={recentConsents}
                            columns={consentColumns}
                            rowKey="id"
                            pagination={false}
                            size="small"
                            loading={loading}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Dashboard;
