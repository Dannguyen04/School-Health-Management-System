import { useEffect, useState } from "react";
import {
    AlertOutlined,
    CalendarOutlined,
    MedicineBoxOutlined,
    TeamOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
} from "@ant-design/icons";
import {
    Alert,
    Card,
    Col,
    Row,
    Statistic,
    Table,
    Button,
    Modal,
    Form,
    Input,
    Select,
    message,
    Spin,
} from "antd";
import React from "react";
import axios from "axios";
import dayjs from "dayjs";
import "dayjs/locale/vi";

dayjs.locale("vi");

const { TextArea } = Input;
const { Option } = Select;

const NurseDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalMedicalEvents: 0,
        upcomingVaccinations: 0,
        pendingTasks: 0,
    });
    const [recentEvents, setRecentEvents] = useState([]);
    const [upcomingVaccinations, setUpcomingVaccinations] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [updateModalVisible, setUpdateModalVisible] = useState(false);
    const [form] = Form.useForm();

    // Fetch dashboard data
    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [statsRes, eventsRes, vaccinationsRes] = await Promise.all([
                axios.get("http://localhost:5000/nurse/dashboard/stats"),
                axios.get(
                    "http://localhost:5000/nurse/dashboard/recent-events"
                ),
                axios.get(
                    "http://localhost:5000/nurse/dashboard/upcoming-vaccinations"
                ),
            ]);

            setStats(statsRes.data.data);
            setRecentEvents(eventsRes.data.data);
            setUpcomingVaccinations(vaccinationsRes.data.data);
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
            message.error("Không thể tải dữ liệu dashboard");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    // Handle event status update
    const handleUpdateEvent = async (values) => {
        try {
            await axios.patch(
                `http://localhost:5000/nurse/medical-events/${selectedEvent.id}/status`,
                values
            );
            message.success("Cập nhật trạng thái thành công");
            setUpdateModalVisible(false);
            fetchDashboardData(); // Refresh data
        } catch (error) {
            console.error("Error updating event:", error);
            message.error("Không thể cập nhật trạng thái");
        }
    };

    // Render severity badge
    const renderSeverityBadge = (severity) => {
        const colors = {
            low: "bg-green-100 text-green-800",
            medium: "bg-yellow-100 text-yellow-800",
            high: "bg-orange-100 text-orange-800",
            critical: "bg-red-100 text-red-800",
        };
        return (
            <span
                className={`px-2 py-1 rounded-full text-xs ${colors[severity]}`}
            >
                {severity.toUpperCase()}
            </span>
        );
    };

    // Render status badge
    const renderStatusBadge = (status) => {
        const colors = {
            PENDING: "bg-yellow-100 text-yellow-800",
            IN_PROGRESS: "bg-blue-100 text-blue-800",
            RESOLVED: "bg-green-100 text-green-800",
            REFERRED: "bg-purple-100 text-purple-800",
        };
        return (
            <span
                className={`px-2 py-1 rounded-full text-xs ${colors[status]}`}
            >
                {status.replace("_", " ")}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-6">
                Tổng quan Y tế Học đường
            </h2>

            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Tổng số học sinh"
                            value={stats.totalStudents}
                            prefix={<TeamOutlined />}
                        />
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Sự cố y tế trong tháng"
                            value={stats.totalMedicalEvents}
                            prefix={<AlertOutlined />}
                        />
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Tiêm chủng sắp tới"
                            value={stats.upcomingVaccinations}
                            prefix={<CalendarOutlined />}
                        />
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Công việc đang chờ"
                            value={stats.pendingTasks}
                            prefix={<MedicineBoxOutlined />}
                        />
                    </Card>
                </Col>
            </Row>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card
                    title="Sự cố y tế gần đây"
                    extra={
                        <Button
                            type="link"
                            onClick={() => fetchDashboardData()}
                        >
                            Làm mới
                        </Button>
                    }
                >
                    <div className="space-y-4">
                        {recentEvents.map((event) => (
                            <div
                                key={event.id}
                                className="p-4 bg-white rounded-lg border hover:shadow-md transition-shadow cursor-pointer"
                                onClick={() => {
                                    setSelectedEvent(event);
                                    setUpdateModalVisible(true);
                                }}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-medium text-gray-900">
                                        {event.title}
                                    </h3>
                                    {renderSeverityBadge(event.severity)}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                    <span>{event.studentName}</span>
                                    <span>•</span>
                                    <span>Lớp {event.studentClass}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-500">
                                        {dayjs(event.occurredAt).format(
                                            "HH:mm DD/MM/YYYY"
                                        )}
                                    </span>
                                    {renderStatusBadge(event.status)}
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card
                    title="Lịch tiêm chủng sắp tới"
                    extra={
                        <Button
                            type="link"
                            onClick={() => fetchDashboardData()}
                        >
                            Làm mới
                        </Button>
                    }
                >
                    <div className="space-y-4">
                        {upcomingVaccinations.map((vaccination) => (
                            <div
                                key={vaccination.id}
                                className="p-4 bg-white rounded-lg border hover:shadow-md transition-shadow"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-medium text-gray-900">
                                        {vaccination.campaignName}
                                    </h3>
                                    <span className="text-sm text-blue-600">
                                        {dayjs(
                                            vaccination.scheduledDate
                                        ).format("DD/MM/YYYY")}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <span>Lớp {vaccination.studentClass}</span>
                                    <span>•</span>
                                    <span>{vaccination.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* Modal cập nhật trạng thái sự cố */}
            <Modal
                title="Cập nhật trạng thái sự cố"
                open={updateModalVisible}
                onCancel={() => setUpdateModalVisible(false)}
                footer={null}
            >
                {selectedEvent && (
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleUpdateEvent}
                        initialValues={{
                            status: selectedEvent.status,
                            treatment: "",
                            outcome: "",
                        }}
                    >
                        <Form.Item
                            name="status"
                            label="Trạng thái"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng chọn trạng thái",
                                },
                            ]}
                        >
                            <Select>
                                <Option value="PENDING">Đang chờ</Option>
                                <Option value="IN_PROGRESS">Đang xử lý</Option>
                                <Option value="RESOLVED">Đã giải quyết</Option>
                                <Option value="REFERRED">Chuyển tuyến</Option>
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="treatment"
                            label="Điều trị"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng nhập thông tin điều trị",
                                },
                            ]}
                        >
                            <TextArea
                                rows={4}
                                placeholder="Nhập thông tin điều trị..."
                            />
                        </Form.Item>

                        <Form.Item
                            name="outcome"
                            label="Kết quả"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng nhập kết quả",
                                },
                            ]}
                        >
                            <TextArea
                                rows={4}
                                placeholder="Nhập kết quả điều trị..."
                            />
                        </Form.Item>

                        <Form.Item>
                            <Button type="primary" htmlType="submit" block>
                                Cập nhật
                            </Button>
                        </Form.Item>
                    </Form>
                )}
            </Modal>
        </div>
    );
};

export default NurseDashboard;
