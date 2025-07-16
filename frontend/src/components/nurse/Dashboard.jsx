import {
  CalendarOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  MedicineBoxOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Button,
  Card,
  Col,
  List,
  Progress,
  Row,
  Spin,
  Statistic,
  Table,
  Tag,
  Typography,
} from "antd";
import axios from "axios";
import { useEffect, useState } from "react";
import { nurseAPI } from "../../utils/api";
import "./Dashboard.css";
import NurseDashboardChart, { ApprovedMedicinesChart } from "./NurseDashboardChart";

const { Title, Text } = Typography;

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
  const [parentMedicines, setParentMedicines] = useState([]);
  const [recentEvents, setRecentEvents] = useState([]);
  const [students, setStudents] = useState([]);
  const [error, setError] = useState(null);

  const [vaccinationCampaigns, setVaccinationCampaigns] = useState([]);
  const [healthCheckupCampaigns, setHealthCheckupCampaigns] = useState([]);
  const [vaccinationStats, setVaccinationStats] = useState({
    totalCampaigns: 0,
    totalStudents: 0,
    completed: 0,
  });
  const [checkupStats, setCheckupStats] = useState({
    totalCampaigns: 0,
    totalStudents: 0,
    completed: 0,
  });

  const [healthCheckupProgress, setHealthCheckupProgress] = useState({});

  const [approvedMedicines, setApprovedMedicines] = useState([]);

  const fetchDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
      } else {
        setLoading(true);
      }
      setError(null);

      const statsResponse = await nurseAPI.getDashboardStats();
      console.log("Dashboard stats response:", statsResponse);

      if (statsResponse.data.success) {
        setDashboardStats(statsResponse.data.data);
      } else {
        throw new Error(statsResponse.data.error || "Lỗi khi tải thống kê");
      }

      try {
        const eventsResponse = await nurseAPI.getRecentMedicalEvents();
        if (eventsResponse.data.success) {
          setRecentEvents(eventsResponse.data.data || []);
        }
      } catch (err) {
        console.warn("Không thể tải sự kiện y tế gần đây:", err);
      }

      try {
        const medicinesResponse = await nurseAPI.getPendingMedicines();
        if (medicinesResponse.data.success) {
          setParentMedicines(medicinesResponse.data.data || []);
        }
      } catch (err) {
        console.warn("Không thể tải danh sách thuốc phụ huynh gửi đến:", err);
      }

      try {
        const studentsResponse = await nurseAPI.getStudentsForNurse();
        if (studentsResponse.data.success) {
          setStudents(studentsResponse.data.data || []);
        }
      } catch (err) {
        console.warn("Không thể tải danh sách học sinh:", err);
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(
        err.response?.data?.error ||
          err.message ||
          "Không thể tải dữ liệu dashboard"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchApprovedMedicines = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/nurse/approved-medications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setApprovedMedicines(response.data.data || []);
      } else {
        setApprovedMedicines([]);
      }
    } catch {
      setApprovedMedicines([]);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchApprovedMedicines();
  }, []);

  useEffect(() => {
    axios
      .get("/api/nurse/vaccination-campaigns", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => {
        if (res.data.success) {
          setVaccinationCampaigns(res.data.data || []);
          setVaccinationStats({
            totalCampaigns: res.data.data.length,
            totalStudents: res.data.data.reduce(
              (sum, c) => sum + (c.totalStudents || 0),
              0
            ),
            completed: res.data.data.reduce(
              (sum, c) => sum + (c.completed || 0),
              0
            ),
          });
        }
      });
  }, []);
  useEffect(() => {
    axios
      .get("/api/medical-campaigns", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then(async (res) => {
        const campaigns = res.data.data || [];
        setHealthCheckupCampaigns(campaigns);
        const progressObj = {};
        for (const campaign of campaigns) {
          let total = 0;
          try {
            const studentsRes = await axios.get(
              "/api/admin/students-for-nurse",
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              }
            );
            const filtered = (studentsRes.data.data || []).filter((s) =>
              (campaign.targetGrades || [])
                .map(String)
                .includes(String(s.grade))
            );
            total = filtered.length;
          } catch {
            total = 0;
          }
          let completed = 0;
          try {
            const reportsRes = await axios.get(
              `/api/medical-checks/campaign/${campaign.id}`,
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              }
            );
            completed = (reportsRes.data.data || []).filter(
              (r) => r.status === "COMPLETED"
            ).length;
          } catch {
            completed = 0;
          }
          progressObj[campaign.id] = { total, completed };
        }
        setHealthCheckupProgress(progressObj);
        setCheckupStats({
          totalCampaigns: campaigns.length,
          totalStudents: Object.values(progressObj).reduce(
            (sum, p) => sum + (p.total || 0),
            0
          ),
          completed: Object.values(progressObj).reduce(
            (sum, p) => sum + (p.completed || 0),
            0
          ),
        });
      });
  }, []);

  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  const realStats = {
    totalStudents: students.length || dashboardStats.totalStudents,
    totalMedicalEvents:
      recentEvents.length || dashboardStats.totalMedicalEvents,
    upcomingVaccinations: dashboardStats.upcomingVaccinations,
    pendingTasks: dashboardStats.pendingTasks,
    pendingMedications:
      parentMedicines.length || dashboardStats.pendingMedications,
    lowStockItems: 0,
  };

  const eventsByMonth = Array.from({ length: 12 }, (_, i) => {
    const month = (i + 1).toString();
    const count = (recentEvents || []).filter((ev) => {
      if (!ev.occurredAt) return false;
      const date = new Date(ev.occurredAt);
      return date.getMonth() + 1 === i + 1;
    }).length;
    return { thang: month, suco: count };
  });

  const approvedMedicinesByMonth = Array.from({ length: 12 }, (_, i) => {
    const month = (i + 1).toString();
    const count = (approvedMedicines || []).filter((med) => {
      if (med.status !== "APPROVED" || !med.updatedAt) return false;
      const date = new Date(med.updatedAt);
      return date.getMonth() + 1 === i + 1;
    }).length;
    return { thang: month, approved: count };
  });

  const timelineEvents = [
    ...recentEvents.map((ev) => ({
      date: ev.occurredAt,
      type: "medical",
      title: `Sự cố y tế: ${ev.title}`,
      description: ev.description,
    })),
    ...parentMedicines.map((med) => ({
      date: med.createdAt,
      type: "medicine",
      title: `Đơn thuốc: ${med.medicationName} cho ${med.studentName}`,
      description: `Liều lượng: ${med.dosage} ${med.unit || ""}`,
    })),
  ].sort((a, b) => new Date(a.date) - new Date(b.date));

  function formatDate(date) {
    return date ? new Date(date).toLocaleDateString("vi-VN") : "";
  }

  const statusMap = {
    PENDING_APPROVAL: "Chờ duyệt",
    APPROVED: "Đã duyệt",
    REJECTED: "Từ chối",
    ACTIVE: "Đang sử dụng",
    EXPIRED: "Hết hạn",
  };

  const severityMap = {
    low: "Thấp",
    medium: "Trung bình",
    high: "Cao",
    critical: "Nguy kịch",
  };

  const eventStatusMap = {
    PENDING: "Chờ xử lý",
    IN_PROGRESS: "Đang xử lý",
    RESOLVED: "Đã giải quyết",
    REFERRED: "Chuyển viện",
  };

  const unresolvedEvents = recentEvents.filter(
    (ev) => ev.status !== "RESOLVED"
  );
  const pendingMedicines = parentMedicines.filter(
    (med) => med.status === "PENDING_APPROVAL"
  );

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
        action={
          <Button
            type="link"
            onClick={handleRefresh}
            icon={<ReloadOutlined />}
            className="text-red-600 hover:text-red-800"
          >
            Thử lại
          </Button>
        }
      />
    );
  }

  return (
    <div className="dashboard-container">
      <Row gutter={[12, 12]} className="mb-4">
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card blue" bordered={false}>
            <Statistic
              title={
                <span>
                  <ExclamationCircleOutlined className="text-red-500" /> Sự cố y
                  tế tháng này
                </span>
              }
              value={dashboardStats.totalMedicalEvents}
              valueStyle={{
                color: "#ff4d4f",
                fontSize: "24px",
                fontWeight: 700,
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card green" bordered={false}>
            <Statistic
              title={
                <span>
                  <MedicineBoxOutlined className="text-green-500" /> Đơn thuốc
                  phụ huynh gửi
                </span>
              }
              value={parentMedicines.length}
              valueStyle={{
                color: "#52c41a",
                fontSize: "24px",
                fontWeight: 700,
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card orange" bordered={false}>
            <Statistic
              title={
                <span>
                  <CalendarOutlined className="text-blue-500" /> Chiến dịch tiêm
                  chủng
                </span>
              }
              value={vaccinationStats.totalCampaigns}
              valueStyle={{
                color: "#1677ff",
                fontSize: "24px",
                fontWeight: 700,
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card purple" bordered={false}>
            <Statistic
              title={
                <span>
                  <CheckCircleOutlined className="text-purple-500" /> Chiến dịch
                  khám sức khỏe
                </span>
              }
              value={checkupStats.totalCampaigns}
              valueStyle={{
                color: "#722ed1",
                fontSize: "24px",
                fontWeight: 700,
              }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} className="mb-8">
        <Col xs={24} md={12}>
          <Card className="shadow-lg rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <span className="text-xl font-bold flex items-center gap-2">
                <ExclamationCircleOutlined className="text-red-500" /> Biểu đồ sự cố y tế
              </span>
            </div>
            <NurseDashboardChart data={eventsByMonth} color="#36ae9a" icon={<ExclamationCircleOutlined className="text-red-500" />} chartType="event" />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card className="shadow-lg rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <span className="text-xl font-bold flex items-center gap-2">
                <MedicineBoxOutlined className="text-[#fa8c16]" /> Biểu đồ thuốc đã duyệt
              </span>
            </div>
            <ApprovedMedicinesChart data={approvedMedicinesByMonth} />
          </Card>
        </Col>
      </Row>
      <Row gutter={[12, 12]} className="mb-4">
        <Col xs={24} md={12}>
          <Card
            className="shadow-lg rounded-2xl p-6 min-h-[350px]"
            title={
              <span>
                <ExclamationCircleOutlined className="text-red-500" /> Sự cố y
                tế gần đây
              </span>
            }
          >
            <Table
              dataSource={recentEvents.slice(0, 3)}
              rowKey={(record) => record.id}
              columns={[
                {
                  title: "Học sinh",
                  dataIndex: "studentName",
                  key: "studentName",
                  render: (text) => <span>{text}</span>,
                },
                {
                  title: "Tiêu đề",
                  dataIndex: "title",
                  key: "title",
                  render: (text) => (
                    <span className="font-semibold">{text}</span>
                  ),
                },
                {
                  title: "Ngày xảy ra",
                  dataIndex: "occurredAt",
                  key: "occurredAt",
                  render: (v) =>
                    v ? new Date(v).toLocaleDateString("vi-VN") : "",
                },
                {
                  title: "Trạng thái",
                  dataIndex: "status",
                  key: "status",
                  render: (v) => eventStatusMap[v] || v,
                },
              ]}
              pagination={false}
              locale={{ emptyText: "Không có sự cố y tế nào" }}
              size="small"
            />
            {recentEvents.length > 3 && (
              <div className="flex justify-end mt-2">
                <Button
                  type="link"
                  onClick={() =>
                    (window.location.href = "/nurse/medical-event")
                  }
                >
                  Xem tất cả
                </Button>
              </div>
            )}
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card
            className="shadow-lg rounded-2xl p-6 min-h-[350px]"
            title={
              <span>
                <MedicineBoxOutlined className="text-green-500" /> Đơn thuốc phụ
                huynh gửi đến
              </span>
            }
          >
            <Table
              dataSource={parentMedicines.slice(0, 3)}
              rowKey={(record) => record.id}
              columns={[
                {
                  title: "Học sinh",
                  dataIndex: "studentName",
                  key: "studentName",
                },
                {
                  title: "Tên thuốc",
                  dataIndex: "medicationName",
                  key: "medicationName",
                },
                {
                  title: "Ngày gửi",
                  dataIndex: "createdAt",
                  key: "createdAt",
                  render: (v) =>
                    v ? new Date(v).toLocaleDateString("vi-VN") : "",
                },
                {
                  title: "Trạng thái",
                  dataIndex: "status",
                  key: "status",
                  render: (v) => statusMap[v] || v,
                },
              ]}
              pagination={false}
              locale={{ emptyText: "Không có đơn thuốc nào" }}
              size="small"
            />
            {parentMedicines.length > 3 && (
              <div className="flex justify-end mt-2">
                <Button
                  type="link"
                  onClick={() =>
                    (window.location.href = "/nurse/confirmed-medicines")
                  }
                >
                  Xem tất cả
                </Button>
              </div>
            )}
          </Card>
        </Col>
      </Row>
      <Row gutter={[12, 12]} className="mb-4">
        <Col xs={24} md={12}>
          <Card
            className="shadow-lg rounded-2xl p-4 min-h-[450px]"
            title={
              <span>
                <MedicineBoxOutlined className="text-green-500" /> Tiến độ tiêm
                chủng
              </span>
            }
          >
            <List
              dataSource={vaccinationCampaigns.slice(0, 3)}
              renderItem={(item) => (
                <List.Item className="hover:bg-gray-50 transition-colors duration-200 rounded-lg px-2 py-1">
                  <div style={{ width: "100%" }}>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-base">
                        {item.name}
                      </span>
                      <Tag
                        color={
                          item.status === "ACTIVE"
                            ? "green"
                            : item.status === "FINISHED"
                            ? "blue"
                            : "red"
                        }
                      >
                        {item.status === "ACTIVE"
                          ? "Đang diễn ra"
                          : item.status === "FINISHED"
                          ? "Đã kết thúc"
                          : "Đã huỷ"}
                      </Tag>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-500">
                        <CalendarOutlined /> {formatDate(item.scheduledDate)} -{" "}
                        {formatDate(item.deadline)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {item.vaccinatedStudents || 0} /{" "}
                        {item.consentedStudents || 0} học sinh đã tiêm
                      </span>
                    </div>
                    <Progress
                      percent={
                        item.consentedStudents
                          ? Math.round(
                              (item.vaccinatedStudents /
                                item.consentedStudents) *
                                100
                            )
                          : 0
                      }
                      size="small"
                      status="active"
                      showInfo={false}
                      style={{
                        marginTop: 4,
                        width: "100%",
                      }}
                    />
                  </div>
                </List.Item>
              )}
              locale={{
                emptyText: "Không có chiến dịch tiêm chủng",
              }}
            />
            {vaccinationCampaigns.length > 3 && (
              <div className="flex justify-end mt-2">
                <Button
                  type="link"
                  onClick={() =>
                    (window.location.href = "/nurse/vaccination-campaigns")
                  }
                >
                  Xem tất cả
                </Button>
              </div>
            )}
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card
            className="shadow-lg rounded-2xl p-4 min-h-[450px]"
            title={
              <span>
                <CheckCircleOutlined className="text-blue-500" /> Tiến độ khám
                sức khỏe
              </span>
            }
          >
            <List
              dataSource={healthCheckupCampaigns.slice(0, 3)}
              renderItem={(item) => {
                const progress = healthCheckupProgress[item.id] || {
                  total: 0,
                  completed: 0,
                };
                return (
                  <List.Item className="hover:bg-gray-50 transition-colors duration-200 rounded-lg px-2 py-1">
                    <div style={{ width: "100%" }}>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-base">
                          {item.name}
                        </span>
                        <Tag
                          color={
                            item.status === "ACTIVE"
                              ? "green"
                              : item.status === "FINISHED"
                              ? "blue"
                              : "red"
                          }
                        >
                          {item.status === "ACTIVE"
                            ? "Đang diễn ra"
                            : item.status === "FINISHED"
                            ? "Đã kết thúc"
                            : "Đã huỷ"}
                        </Tag>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-gray-500">
                          <CalendarOutlined /> {formatDate(item.scheduledDate)}{" "}
                          - {formatDate(item.deadline)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {progress.completed} / {progress.total} học sinh đã
                          khám
                        </span>
                      </div>
                      <Progress
                        percent={
                          progress.total
                            ? Math.round(
                                (progress.completed / progress.total) * 100
                              )
                            : 0
                        }
                        size="small"
                        status="active"
                        showInfo={false}
                        style={{
                          marginTop: 4,
                          width: "100%",
                        }}
                      />
                    </div>
                  </List.Item>
                );
              }}
              locale={{
                emptyText: "Không có chiến dịch khám sức khỏe",
              }}
            />
            {healthCheckupCampaigns.length > 3 && (
              <div className="flex justify-end mt-2">
                <Button
                  type="link"
                  onClick={() =>
                    (window.location.href = "/nurse/health-checkups")
                  }
                >
                  Xem tất cả
                </Button>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
