import { FileExcelOutlined, FilePdfOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Row,
  Space,
  Statistic,
  Table,
  message,
} from "antd";
import axios from "axios";
import { useEffect, useState } from "react";

const { RangePicker } = DatePicker;

const HealthReports = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [overviewData, setOverviewData] = useState(null);
  const [attentionData, setAttentionData] = useState(null);
  const [studentsNeedingAttention, setStudentsNeedingAttention] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);

  // Fetch overview data
  const fetchOverview = async (params = {}) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const queryParams = new URLSearchParams();

      if (params.dateRange && params.dateRange.length === 2) {
        queryParams.append(
          "startDate",
          params.dateRange[0].format("YYYY-MM-DD")
        );
        queryParams.append("endDate", params.dateRange[1].format("YYYY-MM-DD"));
      }
      if (params.grade) queryParams.append("grade", params.grade);
      if (params.class) queryParams.append("class", params.class);
      if (params.reportType) queryParams.append("status", params.reportType);

      const response = await axios.get(
        `/api/report-medical-check/overview?${queryParams.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setOverviewData(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching overview:", error);
      message.error("Lỗi khi tải dữ liệu tổng quan");
    } finally {
      setLoading(false);
    }
  };

  // Fetch attention summary
  const fetchAttentionSummary = async (params = {}) => {
    try {
      const token = localStorage.getItem("token");
      const queryParams = new URLSearchParams();

      if (params.dateRange && params.dateRange.length === 2) {
        queryParams.append(
          "startDate",
          params.dateRange[0].format("YYYY-MM-DD")
        );
        queryParams.append("endDate", params.dateRange[1].format("YYYY-MM-DD"));
      }
      if (params.grade) queryParams.append("grade", params.grade);
      if (params.class) queryParams.append("class", params.class);

      const response = await axios.get(
        `/api/report-medical-check/attention-summary?${queryParams.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setAttentionData(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching attention summary:", error);
      message.error("Lỗi khi tải dữ liệu cần chú ý");
    }
  };

  // Fetch students needing attention
  const fetchStudentsNeedingAttention = async (params = {}) => {
    setStudentsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const queryParams = new URLSearchParams();

      if (params.dateRange && params.dateRange.length === 2) {
        queryParams.append(
          "startDate",
          params.dateRange[0].format("YYYY-MM-DD")
        );
        queryParams.append("endDate", params.dateRange[1].format("YYYY-MM-DD"));
      }
      if (params.grade) queryParams.append("grade", params.grade);
      if (params.class) queryParams.append("class", params.class);
      queryParams.append("page", "1");
      queryParams.append("limit", "50");

      const response = await axios.get(
        `/api/report-medical-check/students-needing-attention?${queryParams.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setStudentsNeedingAttention(response.data.data.students);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      message.error("Lỗi khi tải danh sách học sinh cần chú ý");
    } finally {
      setStudentsLoading(false);
    }
  };

  // Handle search form submission
  const handleSearch = async (values) => {
    await Promise.all([
      fetchOverview(values),
      fetchAttentionSummary(values),
      fetchStudentsNeedingAttention(values),
    ]);
  };

  // Load initial data
  useEffect(() => {
    fetchOverview();
    fetchAttentionSummary();
    fetchStudentsNeedingAttention();
  }, []);

  // Table columns for students needing attention
  const studentColumns = [
    {
      title: "Mã học sinh",
      dataIndex: ["student", "studentCode"],
      key: "studentCode",
    },
    {
      title: "Họ tên",
      dataIndex: ["student", "user", "fullName"],
      key: "fullName",
    },
    {
      title: "Lớp",
      dataIndex: ["student", "class"],
      key: "class",
    },
    {
      title: "Trạng thái sức khỏe",
      dataIndex: "overallHealth",
      key: "overallHealth",
      render: (health) => {
        const statusMap = {
          NORMAL: { text: "Bình thường", color: "green" },
          NEEDS_ATTENTION: { text: "Cần chú ý", color: "orange" },
          REQUIRES_TREATMENT: { text: "Cần điều trị", color: "red" },
        };
        const status = statusMap[health] || {
          text: health,
          color: "default",
        };
        return (
          <span style={{ color: status.color, fontWeight: "bold" }}>
            {status.text}
          </span>
        );
      },
    },
  ];

  // Statistics cards data
  const getStatisticsData = () => {
    if (!overviewData) return [];

    return [
      {
        title: "Tổng số khám",
        value: overviewData.overview?.totalChecks || 0,
        suffix: "lượt",
      },
      {
        title: "Đã hoàn thành",
        value: overviewData.overview?.completedChecks || 0,
        suffix: "lượt",
        valueStyle: { color: "#3f8600" },
      },
      {
        title: "Tỷ lệ tham gia",
        value: overviewData.overview?.participationRate || 0,
        suffix: "%",
        valueStyle: { color: "#1890ff" },
      },
      {
        title: "Cần chú ý",
        value: attentionData?.needsAttention || 0,
        suffix: "học sinh",
        valueStyle: { color: "#faad14" },
      },
    ];
  };

  const handleExportPDF = () => {
    message.info("Tính năng xuất PDF đang được phát triển");
  };

  const handleExportExcel = () => {
    message.info("Tính năng xuất Excel đang được phát triển");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Báo cáo sức khỏe</h1>
        <Space>
          <Button icon={<FilePdfOutlined />} onClick={handleExportPDF}>
            Xuất PDF
          </Button>
          <Button icon={<FileExcelOutlined />} onClick={handleExportExcel}>
            Xuất Excel
          </Button>
        </Space>
      </div>

      {/* Statistics Cards */}
      <Row gutter={16}>
        {getStatisticsData().map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card>
              <Statistic
                title={stat.title}
                value={stat.value}
                suffix={stat.suffix}
                valueStyle={stat.valueStyle}
                loading={loading}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Health Status Distribution */}
      {overviewData && (
        <Card title="Phân bố trạng thái sức khỏe">
          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Statistic
                title="Bình thường"
                value={overviewData.healthStatus?.normal || 0}
                suffix={`/ ${overviewData.healthStatus?.total || 0}`}
                valueStyle={{ color: "#3f8600" }}
              />
            </Col>
            <Col xs={24} sm={8}>
              <Statistic
                title="Cần chú ý"
                value={overviewData.healthStatus?.needsAttention || 0}
                suffix={`/ ${overviewData.healthStatus?.total || 0}`}
                valueStyle={{ color: "#faad14" }}
              />
            </Col>
            <Col xs={24} sm={8}>
              <Statistic
                title="Cần điều trị"
                value={overviewData.healthStatus?.requiresTreatment || 0}
                suffix={`/ ${overviewData.healthStatus?.total || 0}`}
                valueStyle={{ color: "#cf1322" }}
              />
            </Col>
          </Row>
        </Card>
      )}

      {/* BMI Distribution */}
      {overviewData?.bmi && (
        <Card title="Phân bố BMI">
          <Row gutter={16}>
            <Col xs={24} sm={6}>
              <Statistic
                title="Thiếu cân"
                value={overviewData.bmi.underweight || 0}
                suffix={`(${overviewData.bmi.percentages?.underweight || 0}%)`}
                valueStyle={{ color: "#1890ff" }}
              />
            </Col>
            <Col xs={24} sm={6}>
              <Statistic
                title="Bình thường"
                value={overviewData.bmi.normal || 0}
                suffix={`(${overviewData.bmi.percentages?.normal || 0}%)`}
                valueStyle={{ color: "#3f8600" }}
              />
            </Col>
            <Col xs={24} sm={6}>
              <Statistic
                title="Thừa cân"
                value={overviewData.bmi.overweight || 0}
                suffix={`(${overviewData.bmi.percentages?.overweight || 0}%)`}
                valueStyle={{ color: "#faad14" }}
              />
            </Col>
            <Col xs={24} sm={6}>
              <Statistic
                title="Béo phì"
                value={overviewData.bmi.obese || 0}
                suffix={`(${overviewData.bmi.percentages?.obese || 0}%)`}
                valueStyle={{ color: "#cf1322" }}
              />
            </Col>
          </Row>
        </Card>
      )}

      {/* Students Needing Attention */}
      <Card
        title="Học sinh cần chú ý"
        extra={
          <span className="text-sm text-gray-500">
            Tổng: {studentsNeedingAttention.length} học sinh
          </span>
        }
      >
        <Table
          dataSource={studentsNeedingAttention}
          columns={studentColumns}
          rowKey="id"
          loading={studentsLoading}
          pagination={{
            pageSize: 5,
            showQuickJumper: true,
          }}
          locale={{
            emptyText: "Không có học sinh nào cần chú ý",
          }}
        />
      </Card>
    </div>
  );
};

export default HealthReports;
