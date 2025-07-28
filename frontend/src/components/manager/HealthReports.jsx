import {
  Button,
  Card,
  Col,
  DatePicker,
  Descriptions,
  Divider,
  message,
  Modal,
  Row,
  Select,
  Spin,
  Statistic,
  Table,
  Tabs,
  Tag,
  Typography,
} from "antd";
import axios from "axios";
import dayjs from "dayjs";
import { useEffect, useState } from "react";

const { RangePicker } = DatePicker;

const HealthReports = () => {
  const [loading, setLoading] = useState(false);
  const [overviewData, setOverviewData] = useState(null);
  const [attentionData, setAttentionData] = useState(null);
  const [studentsNeedingAttention, setStudentsNeedingAttention] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [campaignOverview, setCampaignOverview] = useState(null);
  const [campaignAttention, setCampaignAttention] = useState(null);
  const [allStudents, setAllStudents] = useState([]); // all students for campaign
  const [campaignReports, setCampaignReports] = useState([]); // all reports for campaign
  const [reportModal, setReportModal] = useState({
    visible: false,
    report: null,
  });
  const [campaignLoading, setCampaignLoading] = useState(false);

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

  // Load initial data
  useEffect(() => {
    fetchOverview();
    fetchAttentionSummary();
    fetchStudentsNeedingAttention();
  }, []);

  // Fetch campaigns on mount
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("/api/medical-campaigns", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data.success) {
          setCampaigns(response.data.data || []);
        }
      } catch {
        // ignore
      }
    };
    fetchCampaigns();
  }, []);

  // Fetch campaign report data when selectedCampaign changes
  useEffect(() => {
    if (!selectedCampaign) return;
    const fetchAll = async () => {
      setCampaignLoading(true);
      const token = localStorage.getItem("token");
      try {
        // 1. Fetch overview, attention, students needing attention (for cards)
        const [overviewRes, attentionRes] = await Promise.all([
          axios.get(
            `/api/report-medical-check/overview?campaignId=${selectedCampaign}`,
            { headers: { Authorization: `Bearer ${token}` } }
          ),
          axios.get(
            `/api/report-medical-check/attention-summary?campaignId=${selectedCampaign}`,
            { headers: { Authorization: `Bearer ${token}` } }
          ),
        ]);
        setCampaignOverview(overviewRes.data.data || null);
        setCampaignAttention(attentionRes.data.data || null);
        // 2. Fetch campaign detail to get targetGrades
        const campaignDetailRes = await axios.get(
          `/api/medical-campaigns/${selectedCampaign}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const campaignDetail = campaignDetailRes.data.data;
        // 3. Fetch all students (admin API)
        const studentsRes = await axios.get("/api/admin/students-for-nurse", {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Filter students by targetGrades
        const filteredStudents = (studentsRes.data.data || []).filter((s) =>
          (campaignDetail.targetGrades || [])
            .map(String)
            .includes(String(s.grade))
        );
        setAllStudents(filteredStudents);
        // 4. Fetch all reports for this campaign
        const reportsRes = await axios.get(
          `/api/medical-checks/campaign/${selectedCampaign}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCampaignReports(reportsRes.data.data || []);
      } catch {
        setCampaignOverview(null);
        setCampaignAttention(null);
        setAllStudents([]);
        setCampaignReports([]);
      } finally {
        setCampaignLoading(false);
      }
    };
    fetchAll();
  }, [selectedCampaign]);

  // Table columns for students needing attention
  const studentColumns = [
    {
      title: "Mã học sinh",
      dataIndex: ["student", "studentCode"],
      key: "studentCode",
    },
    {
      title: "Họ tên",
      dataIndex: ["student", "fullName"],
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

  // Table columns for all students in campaign
  const campaignStudentColumns = [
    {
      title: "Mã học sinh",
      dataIndex: "studentCode",
      key: "studentCode",
    },
    {
      title: "Họ tên",
      dataIndex: "fullName",
      key: "fullName",
    },
    {
      title: "Lớp",
      dataIndex: "class",
      key: "class",
    },
    {
      title: "Trạng thái khám",
      key: "status",
      render: (_, record) => {
        const report = campaignReports.find((r) => r.student?.id === record.id);
        if (report) {
          return <Tag color="green">Đã khám</Tag>;
        }
        return <Tag color="orange">Chưa khám</Tag>;
      },
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => {
        const report = campaignReports.find((r) => r.student?.id === record.id);
        if (report) {
          return (
            <Button
              type="primary"
              size="small"
              shape="round"
              style={{ fontWeight: 500 }}
              onClick={() => setReportModal({ visible: true, report })}
            >
              Xem báo cáo
            </Button>
          );
        }
        return null;
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
        title: "Cần theo dõi",
        value: attentionData?.needsAttention || 0,
        suffix: "học sinh",
        valueStyle: { color: "#faad14" },
      },
    ];
  };

  // const handleExportPDF = () => {
  //   message.info("Tính năng xuất PDF đang được phát triển");
  // };

  // const handleExportExcel = () => {
  //   message.info("Tính năng xuất Excel đang được phát triển");
  // };

  return (
    <Tabs defaultActiveKey="overview">
      <Tabs.TabPane tab="Tổng quan" key="overview">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Báo cáo sức khỏe</h1>
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
                    suffix={`(${
                      overviewData.bmi.percentages?.underweight || 0
                    }%)`}
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
                    suffix={`(${
                      overviewData.bmi.percentages?.overweight || 0
                    }%)`}
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
              style={{ width: "100%" }}
              scroll={{ x: "100%" }}
              tableLayout="fixed"
            />
          </Card>
        </div>
      </Tabs.TabPane>
      <Tabs.TabPane tab="Theo chiến dịch" key="by-campaign">
        <div style={{ marginBottom: 16 }}>
          <Select
            showSearch
            placeholder="Chọn chiến dịch khám sức khỏe"
            style={{ width: 320 }}
            value={selectedCampaign}
            onChange={setSelectedCampaign}
            optionFilterProp="children"
            filterOption={(input, option) =>
              option.children.toLowerCase().includes(input.toLowerCase())
            }
          >
            {campaigns.map((c) => (
              <Select.Option key={c.id} value={c.id}>
                {c.name} ({new Date(c.scheduledDate).toLocaleDateString()} -{" "}
                {new Date(c.deadline).toLocaleDateString()})
              </Select.Option>
            ))}
          </Select>
        </div>
        {campaignLoading ? (
          <Spin />
        ) : selectedCampaign && campaignOverview ? (
          <div className="space-y-6">
            <Row gutter={16}>
              {/* Statistics Cards for campaign */}
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="Tổng số khám"
                    value={campaignOverview.overview?.totalChecks || 0}
                    suffix="lượt"
                    valueStyle={{}}
                    loading={campaignLoading}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="Đã hoàn thành"
                    value={campaignOverview.overview?.completedChecks || 0}
                    suffix="lượt"
                    valueStyle={{ color: "#3f8600" }}
                    loading={campaignLoading}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="Tỷ lệ tham gia"
                    value={campaignOverview.overview?.participationRate || 0}
                    suffix="%"
                    valueStyle={{ color: "#1890ff" }}
                    loading={campaignLoading}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="Cần theo dõi"
                    value={campaignAttention?.needsAttention || 0}
                    suffix="học sinh"
                    valueStyle={{ color: "#faad14" }}
                    loading={campaignLoading}
                  />
                </Card>
              </Col>
            </Row>
            {/* Health Status Distribution */}
            {campaignOverview && (
              <Card title="Phân bố trạng thái sức khỏe">
                <Row gutter={16}>
                  <Col xs={24} sm={8}>
                    <Statistic
                      title="Bình thường"
                      value={campaignOverview.healthStatus?.normal || 0}
                      suffix={`/ ${campaignOverview.healthStatus?.total || 0}`}
                      valueStyle={{ color: "#3f8600" }}
                    />
                  </Col>
                  <Col xs={24} sm={8}>
                    <Statistic
                      title="Cần chú ý"
                      value={campaignOverview.healthStatus?.needsAttention || 0}
                      suffix={`/ ${campaignOverview.healthStatus?.total || 0}`}
                      valueStyle={{ color: "#faad14" }}
                    />
                  </Col>
                  <Col xs={24} sm={8}>
                    <Statistic
                      title="Cần điều trị"
                      value={
                        campaignOverview.healthStatus?.requiresTreatment || 0
                      }
                      suffix={`/ ${campaignOverview.healthStatus?.total || 0}`}
                      valueStyle={{ color: "#cf1322" }}
                    />
                  </Col>
                </Row>
              </Card>
            )}
            {/* BMI Distribution */}
            {campaignOverview?.bmi && (
              <Card title="Phân bố BMI">
                <Row gutter={16}>
                  <Col xs={24} sm={6}>
                    <Statistic
                      title="Thiếu cân"
                      value={campaignOverview.bmi.underweight || 0}
                      suffix={`(${
                        campaignOverview.bmi.percentages?.underweight || 0
                      }%)`}
                      valueStyle={{ color: "#1890ff" }}
                    />
                  </Col>
                  <Col xs={24} sm={6}>
                    <Statistic
                      title="Bình thường"
                      value={campaignOverview.bmi.normal || 0}
                      suffix={`(${
                        campaignOverview.bmi.percentages?.normal || 0
                      }%)`}
                      valueStyle={{ color: "#3f8600" }}
                    />
                  </Col>
                  <Col xs={24} sm={6}>
                    <Statistic
                      title="Thừa cân"
                      value={campaignOverview.bmi.overweight || 0}
                      suffix={`(${
                        campaignOverview.bmi.percentages?.overweight || 0
                      }%)`}
                      valueStyle={{ color: "#faad14" }}
                    />
                  </Col>
                  <Col xs={24} sm={6}>
                    <Statistic
                      title="Béo phì"
                      value={campaignOverview.bmi.obese || 0}
                      suffix={`(${
                        campaignOverview.bmi.percentages?.obese || 0
                      }%)`}
                      valueStyle={{ color: "#cf1322" }}
                    />
                  </Col>
                </Row>
              </Card>
            )}
            {/* Danh sách học sinh thuộc chiến dịch */}
            <Card
              title="Danh sách học sinh thuộc chiến dịch"
              extra={
                <span className="text-sm text-gray-500">
                  Tổng: {allStudents.length} học sinh
                </span>
              }
            >
              <Table
                dataSource={allStudents}
                columns={campaignStudentColumns}
                rowKey="id"
                loading={campaignLoading}
                pagination={{
                  pageSize: 5,
                  showQuickJumper: true,
                }}
                locale={{
                  emptyText: "Không có học sinh nào trong chiến dịch này",
                }}
              />
            </Card>
            {/* Modal xem chi tiết báo cáo */}
            <Modal
              open={reportModal.visible}
              onCancel={() => setReportModal({ visible: false, report: null })}
              footer={null}
              width={800}
              title="Chi tiết báo cáo khám sức khỏe"
            >
              {reportModal.report && (
                <div>
                  <Typography.Title level={4} style={{ marginBottom: 0 }}>
                    {reportModal.report.student?.user?.fullName || ""}
                  </Typography.Title>
                  <Typography.Text type="secondary">
                    Ngày khám:{" "}
                    {reportModal.report.scheduledDate
                      ? dayjs(reportModal.report.scheduledDate).format(
                          "DD/MM/YYYY"
                        )
                      : ""}
                  </Typography.Text>
                  <Divider orientation="left" style={{ marginTop: 16 }}>
                    Thông tin cơ bản
                  </Divider>
                  <Descriptions column={3} size="small" bordered>
                    <Descriptions.Item label="Chiều cao">
                      {reportModal.report.height} cm
                    </Descriptions.Item>
                    <Descriptions.Item label="Cân nặng">
                      {reportModal.report.weight} kg
                    </Descriptions.Item>
                    <Descriptions.Item label="Mạch">
                      {reportModal.report.pulse}
                    </Descriptions.Item>
                    <Descriptions.Item label="Huyết áp tâm thu">
                      {reportModal.report.systolicBP}
                    </Descriptions.Item>
                    <Descriptions.Item label="Huyết áp tâm trương">
                      {reportModal.report.diastolicBP}
                    </Descriptions.Item>
                    <Descriptions.Item label="Phân loại thể lực">
                      {(() => {
                        const map = {
                          EXCELLENT: "Xuất sắc",
                          GOOD: "Tốt",
                          AVERAGE: "Trung bình",
                          WEAK: "Yếu",
                        };
                        return (
                          map[reportModal.report.physicalClassification] ||
                          reportModal.report.physicalClassification
                        );
                      })()}
                    </Descriptions.Item>
                  </Descriptions>
                  <Divider orientation="left" style={{ marginTop: 16 }}>
                    Thị lực
                  </Divider>
                  <Descriptions column={2} size="small" bordered>
                    <Descriptions.Item label="Phải (không kính)">
                      {reportModal.report.visionRightNoGlasses}
                    </Descriptions.Item>
                    <Descriptions.Item label="Trái (không kính)">
                      {reportModal.report.visionLeftNoGlasses}
                    </Descriptions.Item>
                    <Descriptions.Item label="Phải (có kính)">
                      {reportModal.report.visionRightWithGlasses}
                    </Descriptions.Item>
                    <Descriptions.Item label="Trái (có kính)">
                      {reportModal.report.visionLeftWithGlasses}
                    </Descriptions.Item>
                  </Descriptions>
                  <Divider orientation="left" style={{ marginTop: 16 }}>
                    Thính lực
                  </Divider>
                  <Descriptions column={2} size="small" bordered>
                    <Descriptions.Item label="Trái (bình thường)">
                      {reportModal.report.hearingLeftNormal}
                    </Descriptions.Item>
                    <Descriptions.Item label="Phải (bình thường)">
                      {reportModal.report.hearingRightNormal}
                    </Descriptions.Item>
                    <Descriptions.Item label="Trái (thì thầm)">
                      {reportModal.report.hearingLeftWhisper}
                    </Descriptions.Item>
                    <Descriptions.Item label="Phải (thì thầm)">
                      {reportModal.report.hearingRightWhisper}
                    </Descriptions.Item>
                  </Descriptions>
                  <Divider orientation="left" style={{ marginTop: 16 }}>
                    Răng miệng
                  </Divider>
                  <Descriptions column={2} size="small" bordered>
                    <Descriptions.Item label="Răng hàm trên">
                      {reportModal.report.dentalUpperJaw}
                    </Descriptions.Item>
                    <Descriptions.Item label="Răng hàm dưới">
                      {reportModal.report.dentalLowerJaw}
                    </Descriptions.Item>
                  </Descriptions>
                  <Divider orientation="left" style={{ marginTop: 16 }}>
                    Đánh giá tổng thể
                  </Divider>
                  <Descriptions column={2} size="small" bordered>
                    <Descriptions.Item label="Sức khỏe tổng thể">
                      <Tag
                        color={
                          reportModal.report.overallHealth === "NORMAL"
                            ? "green"
                            : reportModal.report.overallHealth ===
                              "NEEDS_ATTENTION"
                            ? "orange"
                            : "red"
                        }
                      >
                        {(() => {
                          const map = {
                            NORMAL: "Bình thường",
                            NEEDS_ATTENTION: "Cần chú ý",
                            REQUIRES_TREATMENT: "Cần điều trị",
                          };
                          return (
                            map[reportModal.report.overallHealth] ||
                            reportModal.report.overallHealth
                          );
                        })()}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Cần theo dõi">
                      {reportModal.report.requiresFollowUp ? "Có" : "Không"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày theo dõi" span={2}>
                      {reportModal.report.followUpDate
                        ? dayjs(reportModal.report.followUpDate).format(
                            "DD/MM/YYYY"
                          )
                        : ""}
                    </Descriptions.Item>
                    <Descriptions.Item label="Khuyến nghị" span={2}>
                      {reportModal.report.recommendations}
                    </Descriptions.Item>
                  </Descriptions>
                  <Divider orientation="left" style={{ marginTop: 16 }}>
                    Ghi chú
                  </Divider>
                  <Descriptions column={1} size="small" bordered>
                    <Descriptions.Item label="Ghi chú lâm sàng">
                      {reportModal.report.clinicalNotes}
                    </Descriptions.Item>
                    <Descriptions.Item label="Ghi chú thêm">
                      {reportModal.report.notes}
                    </Descriptions.Item>
                  </Descriptions>
                </div>
              )}
            </Modal>
          </div>
        ) : (
          <div>Vui lòng chọn chiến dịch để xem báo cáo</div>
        )}
      </Tabs.TabPane>
    </Tabs>
  );
};

export default HealthReports;
