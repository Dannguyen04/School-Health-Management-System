import { EyeOutlined, MailOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  DatePicker,
  Descriptions,
  Divider,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Row,
  Select,
  Steps,
  Table,
  Tabs,
  Tag,
  Typography,
} from "antd";
import axios from "axios";
import dayjs from "dayjs";
import { ErrorMessage, Formik } from "formik";
import { useEffect, useState } from "react";
import * as Yup from "yup";

const { TextArea } = Input;
const { Option } = Select;
const { Title } = Typography;
const { RangePicker } = DatePicker;

// Yup schema validate
const checkupSchema = Yup.object().shape({
  scheduledDate: Yup.date().required("Vui lòng chọn ngày khám"),
  height: Yup.number().min(50).max(250).required("Chiều cao 50-250cm"),
  weight: Yup.number().min(10).max(200).required("Cân nặng 10-200kg"),
  pulse: Yup.number().min(40).max(200).required("Mạch 40-200"),
  systolicBP: Yup.number().min(60).max(250).required("Tâm thu 60-250"),
  diastolicBP: Yup.number().min(30).max(150).required("Tâm trương 30-150"),
  physicalClassification: Yup.string()
    .oneOf(["EXCELLENT", "GOOD", "AVERAGE", "WEAK"])
    .required("Chọn phân loại"),
  visionRightNoGlasses: Yup.number().required(),
  visionLeftNoGlasses: Yup.number().required(),
  visionRightWithGlasses: Yup.number().required(),
  visionLeftWithGlasses: Yup.number().required(),
  hearingLeftNormal: Yup.number().required(),
  hearingLeftWhisper: Yup.number().required(),
  hearingRightNormal: Yup.number().required(),
  hearingRightWhisper: Yup.number().required(),
  dentalUpperJaw: Yup.string().required("Nhập kết quả răng hàm trên"),
  dentalLowerJaw: Yup.string().required("Nhập kết quả răng hàm dưới"),
  clinicalNotes: Yup.string().required(),
  overallHealth: Yup.string()
    .oneOf(["NORMAL", "NEEDS_ATTENTION", "REQUIRES_TREATMENT"])
    .required("Chọn trạng thái"),
  recommendations: Yup.string(),
  requiresFollowUp: Yup.boolean().required("Chọn"),
  followUpDate: Yup.date().nullable(),
  notes: Yup.string(),
});

const HealthCheckups = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState([]);
  const [checkupModal, setCheckupModal] = useState(false);
  const [checkupStudent, setCheckupStudent] = useState(null);
  const [checkupForm] = Form.useForm();
  const [detailReport, setDetailReport] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editInitialValues, setEditInitialValues] = useState(null);
  const [activeTab, setActiveTab] = useState("campaigns");
  const [consultModalVisible, setConsultModalVisible] = useState(false);
  const [consultReport, setConsultReport] = useState(null);
  const [consultRange, setConsultRange] = useState([]);
  const [consultLoading, setConsultLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const stepTitles = [
    "Thông tin cơ bản",
    "Thị lực",
    "Thính lực",
    "Răng miệng",
    "Đánh giá tổng thể",
    "Xem lại thông tin",
  ];

  const stepSchemas = [
    Yup.object({
      scheduledDate: checkupSchema.fields.scheduledDate,
      height: checkupSchema.fields.height,
      weight: checkupSchema.fields.weight,
      pulse: checkupSchema.fields.pulse,
      systolicBP: checkupSchema.fields.systolicBP,
      diastolicBP: checkupSchema.fields.diastolicBP,
    }),
    Yup.object({
      visionRightNoGlasses: checkupSchema.fields.visionRightNoGlasses,
      visionLeftNoGlasses: checkupSchema.fields.visionLeftNoGlasses,
      visionRightWithGlasses: checkupSchema.fields.visionRightWithGlasses,
      visionLeftWithGlasses: checkupSchema.fields.visionLeftWithGlasses,
    }),
    Yup.object({
      hearingLeftNormal: checkupSchema.fields.hearingLeftNormal,
      hearingLeftWhisper: checkupSchema.fields.hearingLeftWhisper,
      hearingRightNormal: checkupSchema.fields.hearingRightNormal,
      hearingRightWhisper: checkupSchema.fields.hearingRightWhisper,
    }),
    Yup.object({
      dentalUpperJaw: checkupSchema.fields.dentalUpperJaw,
      dentalLowerJaw: checkupSchema.fields.dentalLowerJaw,
    }),
    Yup.object({
      physicalClassification: checkupSchema.fields.physicalClassification,
      overallHealth: checkupSchema.fields.overallHealth,
      requiresFollowUp: checkupSchema.fields.requiresFollowUp,
      followUpDate: checkupSchema.fields.followUpDate,
      recommendations: checkupSchema.fields.recommendations,
      clinicalNotes: checkupSchema.fields.clinicalNotes,
      notes: checkupSchema.fields.notes,
    }),
    checkupSchema,
  ];

  // Fetch danh sách campaign khi vào trang
  useEffect(() => {
    const fetchCampaigns = async () => {
      setLoading(true);
      try {
        const res = await axios.get("/api/medical-campaigns", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setCampaigns(res.data.data || []);
      } catch {
        setCampaigns([]);
      }
      setLoading(false);
    };
    fetchCampaigns();
  }, []);

  // Khi chọn campaign, fetch chi tiết campaign và danh sách học sinh phù hợp
  const handleSelectCampaign = async (campaign) => {
    setLoading(true);
    try {
      // Lấy chi tiết campaign
      const resCampaign = await axios.get(
        `/api/medical-campaigns/${campaign.id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const campaignDetail = resCampaign.data.data;
      setSelectedCampaign(campaignDetail);

      // Lấy danh sách học sinh
      const resStudents = await axios.get("/api/admin/students-for-nurse", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      // Lọc theo targetGrades từ campaign chi tiết (ép kiểu về string để tránh lỗi)
      const filtered = (resStudents.data.data || []).filter((s) =>
        (campaignDetail.targetGrades || [])
          .map(String)
          .includes(String(s.grade))
      );
      setStudents(filtered);

      // Lấy danh sách báo cáo khám sức khỏe của campaign này
      const resReports = await axios.get(
        `/api/medical-checks/campaign/${campaignDetail.id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setReports(resReports.data.data || []);
      setActiveTab("students");
    } catch {
      setStudents([]);
      setReports([]);
    }
    setLoading(false);
  };

  // Khi bấm Khám sức khỏe
  const handleCreateCheckup = (student) => {
    setCheckupStudent(student);
    setCheckupModal(true);
    checkupForm.resetFields();
  };

  // Khi bấm xem chi tiết báo cáo
  const handleViewDetail = (report) => {
    setDetailReport(report);
    setDetailModalVisible(true);
  };

  // Khi bấm chỉnh sửa báo cáo
  const handleEditReport = (report) => {
    setEditInitialValues({
      scheduledDate: report.scheduledDate ? dayjs(report.scheduledDate) : null,
      height: report.height,
      weight: report.weight,
      pulse: report.pulse,
      systolicBP: report.systolicBP,
      diastolicBP: report.diastolicBP,
      physicalClassification: report.physicalClassification,
      visionRightNoGlasses: report.visionRightNoGlasses,
      visionLeftNoGlasses: report.visionLeftNoGlasses,
      visionRightWithGlasses: report.visionRightWithGlasses,
      visionLeftWithGlasses: report.visionLeftWithGlasses,
      hearingLeftNormal: report.hearingLeftNormal,
      hearingLeftWhisper: report.hearingLeftWhisper,
      hearingRightNormal: report.hearingRightNormal,
      hearingRightWhisper: report.hearingRightWhisper,
      dentalUpperJaw: report.dentalUpperJaw,
      dentalLowerJaw: report.dentalLowerJaw,
      clinicalNotes: report.clinicalNotes,
      overallHealth: report.overallHealth,
      recommendations: report.recommendations,
      requiresFollowUp: report.requiresFollowUp,
      followUpDate: report.followUpDate ? dayjs(report.followUpDate) : null,
      notes: report.notes,
    });
    setDetailModalVisible(false);
    setEditModalVisible(true);
  };

  // Hàm mở modal gửi kết quả & đặt lịch tư vấn
  const handleOpenConsultModal = (report) => {
    setConsultReport(report);
    setConsultRange([]);
    setConsultModalVisible(true);
  };

  // Hàm gửi kết quả & lịch tư vấn (mock API)
  const handleSendConsult = async () => {
    if (!consultRange.length) {
      message.error("Vui lòng chọn khoảng thời gian tư vấn");
      return;
    }

    const [start, end] = consultRange;
    const now = dayjs();

    // Validate thời gian không được trong quá khứ
    if (start.isBefore(now)) {
      message.error("Thời gian bắt đầu không được trong quá khứ");
      return;
    }

    if (end.isBefore(now)) {
      message.error("Thời gian kết thúc không được trong quá khứ");
      return;
    }

    // Validate thời gian kết thúc phải sau thời gian bắt đầu
    if (end.isBefore(start) || end.isSame(start)) {
      message.error("Thời gian kết thúc phải sau thời gian bắt đầu");
      return;
    }

    setConsultLoading(true);
    try {
      await axios.post(
        `/api/report-medical-check/${consultReport.id}/schedule-consultation`,
        {
          consultationStart: start,
          consultationEnd: end,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      message.success("Đã đặt lịch tư vấn và gửi thông báo cho phụ huynh!");
      setConsultModalVisible(false);
      setConsultReport(null);
      setConsultRange([]);
      // Refetch lại danh sách báo cáo nếu cần
      if (selectedCampaign) {
        const resReports = await axios.get(
          `/api/medical-checks/campaign/${selectedCampaign.id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setReports(resReports.data.data || []);
      }
    } catch (err) {
      message.error(
        err.response?.data?.error ||
          "Đặt lịch tư vấn thất bại, vui lòng thử lại"
      );
    }
    setConsultLoading(false);
  };

  // Table columns chỉ cho students
  const studentColumns = [
    { title: "Mã học sinh", dataIndex: "studentCode", key: "studentCode" },
    { title: "Tên học sinh", dataIndex: "fullName", key: "fullName" },
    { title: "Lớp", dataIndex: "class", key: "class" },
    { title: "Khối", dataIndex: "grade", key: "grade" },
    {
      title: "Trạng thái",
      key: "status",
      render: (_, record) => {
        const report = reports.find((r) => r.studentId === record.id);
        if (report) {
          return (
            <Tag color={report.status === "COMPLETED" ? "green" : "orange"}>
              {report.status === "COMPLETED" ? "Hoàn thành" : "Chưa hoàn thành"}
            </Tag>
          );
        }
        return <Tag color="orange">Chưa hoàn thành</Tag>;
      },
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => {
        const report = reports.find((r) => r.studentId === record.id);
        if (report) {
          return (
            <Button
              type="default"
              icon={<EyeOutlined />}
              shape="round"
              size="small"
              style={{
                color: "#1677ff",
                borderColor: "#1677ff",
                fontWeight: 500,
              }}
              onClick={() => handleViewDetail(report)}
            >
              Chi tiết
            </Button>
          );
        }
        return (
          <Button type="primary" onClick={() => handleCreateCheckup(record)}>
            Khám sức khỏe
          </Button>
        );
      },
    },
  ];

  // Table columns cho campaign
  const campaignColumns = [
    { title: "Tên chiến dịch", dataIndex: "name", key: "name" },
    { title: "Mô tả", dataIndex: "description", key: "description" },
    {
      title: "Ngày bắt đầu",
      dataIndex: "scheduledDate",
      key: "scheduledDate",
      render: (date) => date && new Date(date).toLocaleDateString(),
    },
    {
      title: "Ngày kết thúc",
      dataIndex: "deadline",
      key: "deadline",
      render: (date) => date && new Date(date).toLocaleDateString(),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "ACTIVE" ? "green" : "default"}>
          {status === "ACTIVE" ? "Đang diễn ra" : "Đã kết thúc"}
        </Tag>
      ),
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <Button type="primary" onClick={() => handleSelectCampaign(record)}>
          Chọn chiến dịch
        </Button>
      ),
    },
  ];

  const reportColumns = [
    {
      title: "Mã học sinh",
      dataIndex: ["student", "studentCode"],
      key: "studentCode",
    },
    {
      title: "Tên học sinh",
      dataIndex: ["student", "user", "fullName"],
      key: "fullName",
    },
    {
      title: "Lớp",
      dataIndex: ["student", "class"],
      key: "class",
    },
    {
      title: "Khối",
      dataIndex: ["student", "grade"],
      key: "grade",
    },
    {
      title: "Ngày khám",
      dataIndex: "scheduledDate",
      key: "scheduledDate",
      render: (date) => (date ? dayjs(date).format("DD/MM/YYYY") : "-"),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "COMPLETED" ? "green" : "orange"}>
          {status === "COMPLETED" ? "Hoàn thành" : "Đã lên lịch"}
        </Tag>
      ),
    },
    {
      title: "Sức khỏe tổng thể",
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
        return <Tag color={status.color}>{status.text}</Tag>;
      },
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => {
        const isNeedConsult =
          record.overallHealth === "NEEDS_ATTENTION" ||
          record.overallHealth === "REQUIRES_TREATMENT";
        return (
          <>
            <Button
              type="default"
              icon={<EyeOutlined />}
              shape="round"
              size="small"
              style={{
                color: "#1677ff",
                borderColor: "#1677ff",
                fontWeight: 500,
                marginRight: 8,
              }}
              onClick={() => handleViewDetail(record)}
            >
              Chi tiết
            </Button>
            {isNeedConsult && (
              <Button
                type="primary"
                icon={<MailOutlined />}
                shape="round"
                size="small"
                onClick={() => handleOpenConsultModal(record)}
              >
                Đặt lịch tư vấn
              </Button>
            )}
          </>
        );
      },
    },
  ];

  const items = [
    {
      key: "campaigns",
      label: "Chiến dịch khám sức khỏe",
      children: (
        <Card title="Chọn chiến dịch kiểm tra sức khỏe">
          <Table
            dataSource={campaigns}
            columns={campaignColumns}
            rowKey="id"
            loading={loading}
            pagination={false}
          />
        </Card>
      ),
    },
    {
      key: "students",
      label: "Danh sách học sinh",
      children: selectedCampaign ? (
        <Card title="Danh sách học sinh phù hợp">
          <Table
            dataSource={students}
            columns={studentColumns}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 5 }}
          />
        </Card>
      ) : (
        <Card>
          <div className="text-center text-gray-500">
            Vui lòng chọn chiến dịch trước
          </div>
        </Card>
      ),
    },
    {
      key: "reports",
      label: "Báo cáo khám sức khỏe",
      children: selectedCampaign ? (
        <Card title="Danh sách báo cáo khám sức khỏe">
          {/* Alert thống kê học sinh cần chú ý, cần điều trị */}
          {(() => {
            const needsAttention = reports.filter(
              (r) => r.overallHealth === "NEEDS_ATTENTION"
            ).length;
            const requiresTreatment = reports.filter(
              (r) => r.overallHealth === "REQUIRES_TREATMENT"
            ).length;
            if (needsAttention + requiresTreatment === 0) return null;
            return (
              <div style={{ marginBottom: 16 }}>
                <Row gutter={16}>
                  {needsAttention > 0 && (
                    <Col>
                      <div
                        style={{
                          background: "#fffbe6",
                          border: "1px solid #ffe58f",
                          borderRadius: 4,
                          padding: "8px 16px",
                          color: "#faad14",
                          fontWeight: 500,
                          marginRight: 8,
                        }}
                      >
                        {needsAttention} học sinh{" "}
                        <span style={{ color: "#faad14" }}>cần chú ý</span>
                      </div>
                    </Col>
                  )}
                  {requiresTreatment > 0 && (
                    <Col>
                      <div
                        style={{
                          background: "#fff1f0",
                          border: "1px solid #ffa39e",
                          borderRadius: 4,
                          padding: "8px 16px",
                          color: "#cf1322",
                          fontWeight: 500,
                        }}
                      >
                        {requiresTreatment} học sinh{" "}
                        <span style={{ color: "#cf1322" }}>cần điều trị</span>
                      </div>
                    </Col>
                  )}
                </Row>
              </div>
            );
          })()}
          <Table
            dataSource={reports}
            columns={reportColumns}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 5 }}
          />
        </Card>
      ) : (
        <Card>
          <div className="text-center text-gray-500">
            Vui lòng chọn chiến dịch trước
          </div>
        </Card>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Typography.Title level={2}>
          Khám sức khỏe theo chiến dịch
        </Typography.Title>
      </div>
      {selectedCampaign && (
        <Card
          title={`Chiến dịch: ${selectedCampaign.name}`}
          extra={
            <Button onClick={() => setSelectedCampaign(null)}>Đóng</Button>
          }
        >
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Mô tả">
              {selectedCampaign.description || "Không có"}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày bắt đầu">
              {selectedCampaign.scheduledDate &&
                new Date(selectedCampaign.scheduledDate).toLocaleDateString()}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày kết thúc">
              {selectedCampaign.deadline &&
                new Date(selectedCampaign.deadline).toLocaleDateString()}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag
                color={
                  selectedCampaign.status === "ACTIVE" ? "green" : "default"
                }
              >
                {selectedCampaign.status === "ACTIVE"
                  ? "Đang diễn ra"
                  : "Đã kết thúc"}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Khối áp dụng">
              {(selectedCampaign.targetGrades || []).join(", ")}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      )}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={items}
        size="large"
      />
      {/* Các Modal giữ nguyên */}
      {/* Modal nhập báo cáo khám sức khỏe */}
      <Modal
        title={`Khám sức khỏe: ${checkupStudent?.fullName || ""}`}
        open={checkupModal}
        onCancel={() => {
          setCheckupModal(false);
          setCheckupStudent(null);
        }}
        footer={null}
        width={1100}
      >
        <Formik
          initialValues={{
            scheduledDate: null,
            height: undefined,
            weight: undefined,
            pulse: undefined,
            systolicBP: undefined,
            diastolicBP: undefined,
            physicalClassification: undefined,
            visionRightNoGlasses: undefined,
            visionLeftNoGlasses: undefined,
            visionRightWithGlasses: undefined,
            visionLeftWithGlasses: undefined,
            hearingLeftNormal: undefined,
            hearingLeftWhisper: undefined,
            hearingRightNormal: undefined,
            hearingRightWhisper: undefined,
            dentalUpperJaw: "",
            dentalLowerJaw: "",
            clinicalNotes: "",
            overallHealth: undefined,
            recommendations: "",
            requiresFollowUp: false,
            followUpDate: null,
            notes: "",
          }}
          validationSchema={stepSchemas[currentStep]}
          validateOnChange={false}
          validateOnBlur={false}
          onSubmit={async (
            values,
            { setSubmitting, resetForm, setFieldError }
          ) => {
            if (currentStep < 5) {
              // Nếu đang ở bước 0 và có lỗi ngày khám, không cho tiếp tục
              if (currentStep === 0 && values.scheduledDate) {
                // Kiểm tra lỗi đã được setFieldError chưa
                const scheduledDateError =
                  await checkupSchema.fields.scheduledDate
                    .validate(values.scheduledDate)
                    .catch((e) => e.message);
                if (scheduledDateError) {
                  setFieldError("scheduledDate", scheduledDateError);
                  message.error(scheduledDateError);
                  setSubmitting(false);
                  return;
                }
              }
              setCurrentStep(5);
              setSubmitting(false);
              return;
            }
            // Submit cuối cùng
            if (!selectedCampaign || !checkupStudent) return;
            try {
              await axios.post(
                "/api/medical-checks/create",
                {
                  ...values,
                  studentId: checkupStudent.id,
                  campaignId: selectedCampaign.id,
                },
                {
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                  },
                }
              );
              message.success("Tạo báo cáo khám sức khỏe thành công");
              setCheckupModal(false);
              setCheckupStudent(null);
              setCurrentStep(0);
              // Refetch lại danh sách báo cáo
              const resReports = await axios.get(
                `/api/medical-checks/campaign/${selectedCampaign.id}`,
                {
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                  },
                }
              );
              setReports(resReports.data.data || []);
              resetForm();
            } catch (err) {
              const backendMsg = err.response?.data?.error;
              if (
                backendMsg &&
                backendMsg.includes(
                  "Ngày khám phải nằm trong thời gian của chiến dịch"
                )
              ) {
                setFieldError("scheduledDate", backendMsg);
                message.error(backendMsg);
              } else {
                message.error(backendMsg || "Tạo báo cáo thất bại");
              }
            }
            setSubmitting(false);
          }}
        >
          {({
            values,
            setFieldValue,
            isSubmitting,
            handleSubmit,
            validateForm,
            setFieldError,
          }) => (
            <form onSubmit={handleSubmit}>
              <Steps
                current={currentStep}
                size="small"
                style={{ marginBottom: 24 }}
              >
                {stepTitles.map((title, idx) => (
                  <Steps.Step key={idx} title={title} />
                ))}
              </Steps>
              {/* Bước 1: Thông tin cơ bản */}
              {currentStep === 0 && (
                <>
                  <Divider orientation="left">Thông tin cơ bản</Divider>
                  <Form.Item
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 18 }}
                    label="Ngày khám"
                    required
                  >
                    <DatePicker
                      style={{ width: "100%" }}
                      value={values.scheduledDate}
                      onChange={(date) => setFieldValue("scheduledDate", date)}
                    />
                    <ErrorMessage
                      name="scheduledDate"
                      component="div"
                      className="text-red-500 text-xs"
                    />
                  </Form.Item>
                  <Form.Item
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 18 }}
                    label="Chiều cao (cm)"
                    required
                  >
                    <InputNumber
                      min={50}
                      max={250}
                      style={{ width: "100%" }}
                      value={values.height}
                      onChange={(v) => setFieldValue("height", v)}
                    />
                    <ErrorMessage
                      name="height"
                      component="div"
                      className="text-red-500 text-xs"
                    />
                  </Form.Item>
                  <Form.Item
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 18 }}
                    label="Cân nặng (kg)"
                    required
                  >
                    <InputNumber
                      min={10}
                      max={200}
                      style={{ width: "100%" }}
                      value={values.weight}
                      onChange={(v) => setFieldValue("weight", v)}
                    />
                    <ErrorMessage
                      name="weight"
                      component="div"
                      className="text-red-500 text-xs"
                    />
                  </Form.Item>
                  <Form.Item
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 18 }}
                    label="Mạch"
                    required
                  >
                    <InputNumber
                      min={40}
                      max={200}
                      style={{ width: "100%" }}
                      value={values.pulse}
                      onChange={(v) => setFieldValue("pulse", v)}
                    />
                    <ErrorMessage
                      name="pulse"
                      component="div"
                      className="text-red-500 text-xs"
                    />
                  </Form.Item>
                  <Form.Item
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 18 }}
                    label="Huyết áp tâm thu"
                    required
                  >
                    <InputNumber
                      min={60}
                      max={250}
                      style={{ width: "100%" }}
                      value={values.systolicBP}
                      onChange={(v) => setFieldValue("systolicBP", v)}
                    />
                    <ErrorMessage
                      name="systolicBP"
                      component="div"
                      className="text-red-500 text-xs"
                    />
                  </Form.Item>
                  <Form.Item
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 18 }}
                    label="Huyết áp tâm trương"
                    required
                  >
                    <InputNumber
                      min={30}
                      max={150}
                      style={{ width: "100%" }}
                      value={values.diastolicBP}
                      onChange={(v) => setFieldValue("diastolicBP", v)}
                    />
                    <ErrorMessage
                      name="diastolicBP"
                      component="div"
                      className="text-red-500 text-xs"
                    />
                  </Form.Item>
                </>
              )}
              {/* Bước 2: Thị lực */}
              {currentStep === 1 && (
                <>
                  <Divider orientation="left">Thị lực</Divider>
                  <Form.Item
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 18 }}
                    label="Phải (không kính)"
                    required
                  >
                    <InputNumber
                      min={0}
                      max={10}
                      step={0.1}
                      style={{ width: "100%" }}
                      value={values.visionRightNoGlasses}
                      onChange={(v) => setFieldValue("visionRightNoGlasses", v)}
                    />
                    <ErrorMessage
                      name="visionRightNoGlasses"
                      component="div"
                      className="text-red-500 text-xs"
                    />
                  </Form.Item>
                  <Form.Item
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 18 }}
                    label="Trái (không kính)"
                    required
                  >
                    <InputNumber
                      min={0}
                      max={10}
                      step={0.1}
                      style={{ width: "100%" }}
                      value={values.visionLeftNoGlasses}
                      onChange={(v) => setFieldValue("visionLeftNoGlasses", v)}
                    />
                    <ErrorMessage
                      name="visionLeftNoGlasses"
                      component="div"
                      className="text-red-500 text-xs"
                    />
                  </Form.Item>
                  <Form.Item
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 18 }}
                    label="Phải (có kính)"
                    required
                  >
                    <InputNumber
                      min={0}
                      max={10}
                      step={0.1}
                      style={{ width: "100%" }}
                      value={values.visionRightWithGlasses}
                      onChange={(v) =>
                        setFieldValue("visionRightWithGlasses", v)
                      }
                    />
                    <ErrorMessage
                      name="visionRightWithGlasses"
                      component="div"
                      className="text-red-500 text-xs"
                    />
                  </Form.Item>
                  <Form.Item
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 18 }}
                    label="Trái (có kính)"
                    required
                  >
                    <InputNumber
                      min={0}
                      max={10}
                      step={0.1}
                      style={{ width: "100%" }}
                      value={values.visionLeftWithGlasses}
                      onChange={(v) =>
                        setFieldValue("visionLeftWithGlasses", v)
                      }
                    />
                    <ErrorMessage
                      name="visionLeftWithGlasses"
                      component="div"
                      className="text-red-500 text-xs"
                    />
                  </Form.Item>
                </>
              )}
              {/* Bước 3: Thính lực */}
              {currentStep === 2 && (
                <>
                  <Divider orientation="left">Thính lực</Divider>
                  <Form.Item
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 18 }}
                    label="Trái (bình thường)"
                    required
                  >
                    <InputNumber
                      min={0}
                      max={10}
                      step={0.1}
                      style={{ width: "100%" }}
                      value={values.hearingLeftNormal}
                      onChange={(v) => setFieldValue("hearingLeftNormal", v)}
                    />
                    <ErrorMessage
                      name="hearingLeftNormal"
                      component="div"
                      className="text-red-500 text-xs"
                    />
                  </Form.Item>
                  <Form.Item
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 18 }}
                    label="Trái (thì thầm)"
                    required
                  >
                    <InputNumber
                      min={0}
                      max={10}
                      step={0.1}
                      style={{ width: "100%" }}
                      value={values.hearingLeftWhisper}
                      onChange={(v) => setFieldValue("hearingLeftWhisper", v)}
                    />
                    <ErrorMessage
                      name="hearingLeftWhisper"
                      component="div"
                      className="text-red-500 text-xs"
                    />
                  </Form.Item>
                  <Form.Item
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 18 }}
                    label="Phải (bình thường)"
                    required
                  >
                    <InputNumber
                      min={0}
                      max={10}
                      step={0.1}
                      style={{ width: "100%" }}
                      value={values.hearingRightNormal}
                      onChange={(v) => setFieldValue("hearingRightNormal", v)}
                    />
                    <ErrorMessage
                      name="hearingRightNormal"
                      component="div"
                      className="text-red-500 text-xs"
                    />
                  </Form.Item>
                  <Form.Item
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 18 }}
                    label="Phải (thì thầm)"
                    required
                  >
                    <InputNumber
                      min={0}
                      max={10}
                      step={0.1}
                      style={{ width: "100%" }}
                      value={values.hearingRightWhisper}
                      onChange={(v) => setFieldValue("hearingRightWhisper", v)}
                    />
                    <ErrorMessage
                      name="hearingRightWhisper"
                      component="div"
                      className="text-red-500 text-xs"
                    />
                  </Form.Item>
                </>
              )}
              {/* Bước 4: Răng miệng */}
              {currentStep === 3 && (
                <>
                  <Divider orientation="left">Răng miệng</Divider>
                  <Form.Item
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 18 }}
                    label="Răng hàm trên"
                    required
                  >
                    <Input
                      value={values.dentalUpperJaw}
                      onChange={(e) =>
                        setFieldValue("dentalUpperJaw", e.target.value)
                      }
                    />
                    <ErrorMessage
                      name="dentalUpperJaw"
                      component="div"
                      className="text-red-500 text-xs"
                    />
                  </Form.Item>
                  <Form.Item
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 18 }}
                    label="Răng hàm dưới"
                    required
                  >
                    <Input
                      value={values.dentalLowerJaw}
                      onChange={(e) =>
                        setFieldValue("dentalLowerJaw", e.target.value)
                      }
                    />
                    <ErrorMessage
                      name="dentalLowerJaw"
                      component="div"
                      className="text-red-500 text-xs"
                    />
                  </Form.Item>
                </>
              )}
              {/* Bước 5: Đánh giá tổng thể */}
              {currentStep === 4 && (
                <>
                  <Divider orientation="left">Đánh giá tổng thể</Divider>
                  <Form.Item
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 18 }}
                    label="Phân loại thể lực"
                    required
                  >
                    <Select
                      value={values.physicalClassification}
                      onChange={(v) =>
                        setFieldValue("physicalClassification", v)
                      }
                    >
                      <Option value="EXCELLENT">Xuất sắc</Option>
                      <Option value="GOOD">Tốt</Option>
                      <Option value="AVERAGE">Trung bình</Option>
                      <Option value="WEAK">Yếu</Option>
                    </Select>
                    <ErrorMessage
                      name="physicalClassification"
                      component="div"
                      className="text-red-500 text-xs"
                    />
                  </Form.Item>
                  <Form.Item
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 18 }}
                    label="Sức khỏe tổng thể"
                    required
                  >
                    <Select
                      value={values.overallHealth}
                      onChange={(v) => setFieldValue("overallHealth", v)}
                    >
                      <Option value="NORMAL">Bình thường</Option>
                      <Option value="NEEDS_ATTENTION">Cần chú ý</Option>
                      <Option value="REQUIRES_TREATMENT">Cần điều trị</Option>
                    </Select>
                    <ErrorMessage
                      name="overallHealth"
                      component="div"
                      className="text-red-500 text-xs"
                    />
                  </Form.Item>
                  <Form.Item
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 18 }}
                    label="Cần theo dõi"
                    required
                  >
                    <Select
                      value={values.requiresFollowUp}
                      onChange={(v) => setFieldValue("requiresFollowUp", v)}
                    >
                      <Option value={false}>Không</Option>
                      <Option value={true}>Có</Option>
                    </Select>
                    <ErrorMessage
                      name="requiresFollowUp"
                      component="div"
                      className="text-red-500 text-xs"
                    />
                  </Form.Item>
                  <Form.Item
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 18 }}
                    label="Ngày theo dõi"
                  >
                    <DatePicker
                      style={{ width: "100%" }}
                      value={values.followUpDate}
                      onChange={(date) => setFieldValue("followUpDate", date)}
                    />
                    <ErrorMessage
                      name="followUpDate"
                      component="div"
                      className="text-red-500 text-xs"
                    />
                  </Form.Item>
                  <Form.Item
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 18 }}
                    label="Khuyến nghị"
                  >
                    <Input.TextArea
                      rows={2}
                      value={values.recommendations}
                      onChange={(e) =>
                        setFieldValue("recommendations", e.target.value)
                      }
                    />
                    <ErrorMessage
                      name="recommendations"
                      component="div"
                      className="text-red-500 text-xs"
                    />
                  </Form.Item>
                  <Form.Item
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 18 }}
                    label="Ghi chú lâm sàng"
                    required
                  >
                    <Input.TextArea
                      rows={2}
                      value={values.clinicalNotes}
                      onChange={(e) =>
                        setFieldValue("clinicalNotes", e.target.value)
                      }
                    />
                    <ErrorMessage
                      name="clinicalNotes"
                      component="div"
                      className="text-red-500 text-xs"
                    />
                  </Form.Item>
                  <Form.Item
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 18 }}
                    label="Ghi chú thêm"
                  >
                    <Input.TextArea
                      rows={2}
                      value={values.notes}
                      onChange={(e) => setFieldValue("notes", e.target.value)}
                    />
                  </Form.Item>
                </>
              )}
              {/* Bước 6: Xem lại thông tin */}
              {currentStep === 5 && (
                <>
                  <Divider orientation="left">Xem lại thông tin</Divider>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 16,
                    }}
                  >
                    {/* Thông tin cơ bản */}
                    <Card
                      title="Thông tin cơ bản"
                      extra={
                        <Button onClick={() => setCurrentStep(0)}>
                          Chỉnh sửa
                        </Button>
                      }
                      size="small"
                    >
                      <Descriptions column={2} size="small" bordered>
                        <Descriptions.Item label="Ngày khám">
                          {values.scheduledDate
                            ? dayjs(values.scheduledDate).format("DD/MM/YYYY")
                            : ""}
                        </Descriptions.Item>
                        <Descriptions.Item label="Chiều cao">
                          {values.height} cm
                        </Descriptions.Item>
                        <Descriptions.Item label="Cân nặng">
                          {values.weight} kg
                        </Descriptions.Item>
                        <Descriptions.Item label="Mạch">
                          {values.pulse}
                        </Descriptions.Item>
                        <Descriptions.Item label="Huyết áp tâm thu">
                          {values.systolicBP}
                        </Descriptions.Item>
                        <Descriptions.Item label="Huyết áp tâm trương">
                          {values.diastolicBP}
                        </Descriptions.Item>
                      </Descriptions>
                    </Card>
                    {/* Thị lực */}
                    <Card
                      title="Thị lực"
                      extra={
                        <Button onClick={() => setCurrentStep(1)}>
                          Chỉnh sửa
                        </Button>
                      }
                      size="small"
                    >
                      <Descriptions column={2} size="small" bordered>
                        <Descriptions.Item label="Phải (không kính)">
                          {values.visionRightNoGlasses}
                        </Descriptions.Item>
                        <Descriptions.Item label="Trái (không kính)">
                          {values.visionLeftNoGlasses}
                        </Descriptions.Item>
                        <Descriptions.Item label="Phải (có kính)">
                          {values.visionRightWithGlasses}
                        </Descriptions.Item>
                        <Descriptions.Item label="Trái (có kính)">
                          {values.visionLeftWithGlasses}
                        </Descriptions.Item>
                      </Descriptions>
                    </Card>
                    {/* Thính lực */}
                    <Card
                      title="Thính lực"
                      extra={
                        <Button onClick={() => setCurrentStep(2)}>
                          Chỉnh sửa
                        </Button>
                      }
                      size="small"
                    >
                      <Descriptions column={2} size="small" bordered>
                        <Descriptions.Item label="Trái (bình thường)">
                          {values.hearingLeftNormal}
                        </Descriptions.Item>
                        <Descriptions.Item label="Trái (thì thầm)">
                          {values.hearingLeftWhisper}
                        </Descriptions.Item>
                        <Descriptions.Item label="Phải (bình thường)">
                          {values.hearingRightNormal}
                        </Descriptions.Item>
                        <Descriptions.Item label="Phải (thì thầm)">
                          {values.hearingRightWhisper}
                        </Descriptions.Item>
                      </Descriptions>
                    </Card>
                    {/* Răng miệng */}
                    <Card
                      title="Răng miệng"
                      extra={
                        <Button onClick={() => setCurrentStep(3)}>
                          Chỉnh sửa
                        </Button>
                      }
                      size="small"
                    >
                      <Descriptions column={2} size="small" bordered>
                        <Descriptions.Item label="Răng hàm trên">
                          {values.dentalUpperJaw}
                        </Descriptions.Item>
                        <Descriptions.Item label="Răng hàm dưới">
                          {values.dentalLowerJaw}
                        </Descriptions.Item>
                      </Descriptions>
                    </Card>
                    {/* Đánh giá tổng thể */}
                    <Card
                      title="Đánh giá tổng thể"
                      extra={
                        <Button onClick={() => setCurrentStep(4)}>
                          Chỉnh sửa
                        </Button>
                      }
                      size="small"
                    >
                      <Descriptions column={2} size="small" bordered>
                        <Descriptions.Item label="Phân loại thể lực">
                          {(() => {
                            const map = {
                              EXCELLENT: "Xuất sắc",
                              GOOD: "Tốt",
                              AVERAGE: "Trung bình",
                              WEAK: "Yếu",
                            };
                            return (
                              map[values.physicalClassification] ||
                              values.physicalClassification
                            );
                          })()}
                        </Descriptions.Item>
                        <Descriptions.Item label="Sức khỏe tổng thể">
                          {(() => {
                            const map = {
                              NORMAL: "Bình thường",
                              NEEDS_ATTENTION: "Cần chú ý",
                              REQUIRES_TREATMENT: "Cần điều trị",
                            };
                            return (
                              map[values.overallHealth] || values.overallHealth
                            );
                          })()}
                        </Descriptions.Item>
                        <Descriptions.Item label="Cần theo dõi">
                          {values.requiresFollowUp ? "Có" : "Không"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Ngày theo dõi">
                          {values.followUpDate
                            ? dayjs(values.followUpDate).format("DD/MM/YYYY")
                            : ""}
                        </Descriptions.Item>
                        <Descriptions.Item label="Khuyến nghị">
                          {values.recommendations}
                        </Descriptions.Item>
                        <Descriptions.Item label="Ghi chú lâm sàng">
                          {values.clinicalNotes}
                        </Descriptions.Item>
                        <Descriptions.Item label="Ghi chú thêm">
                          {values.notes}
                        </Descriptions.Item>
                      </Descriptions>
                    </Card>
                  </div>
                </>
              )}
              <div className="flex justify-end mt-4">
                {currentStep > 0 && (
                  <Button
                    onClick={() => setCurrentStep(currentStep - 1)}
                    style={{ marginRight: 8 }}
                    disabled={isSubmitting}
                  >
                    Quay lại
                  </Button>
                )}
                {currentStep < 5 && (
                  <Button
                    type="primary"
                    onClick={async () => {
                      // Validate logic cho từng step
                      if (currentStep === 0) {
                        // Validate ngày khám trong khoảng campaign
                        if (
                          values.scheduledDate &&
                          (values.scheduledDate.isBefore(
                            dayjs(selectedCampaign.scheduledDate),
                            "day"
                          ) ||
                            values.scheduledDate.isAfter(
                              dayjs(selectedCampaign.deadline),
                              "day"
                            ))
                        ) {
                          setFieldError(
                            "scheduledDate",
                            "Ngày khám phải nằm trong thời gian của chiến dịch"
                          );
                          message.error(
                            "Ngày khám phải nằm trong thời gian của chiến dịch"
                          );
                          return;
                        }
                      }
                      // Validate step 4: Nếu cần theo dõi thì phải nhập ngày theo dõi
                      if (currentStep === 4) {
                        if (
                          values.requiresFollowUp === true &&
                          !values.followUpDate
                        ) {
                          setFieldError(
                            "followUpDate",
                            "Vui lòng nhập ngày theo dõi khi chọn cần theo dõi"
                          );
                          message.error(
                            "Vui lòng nhập ngày theo dõi khi chọn cần theo dõi"
                          );
                          return;
                        }
                        // Validate ngày theo dõi phải sau ngày khám
                        if (
                          values.requiresFollowUp === true &&
                          values.followUpDate &&
                          values.scheduledDate &&
                          !values.followUpDate.isAfter(
                            values.scheduledDate,
                            "day"
                          )
                        ) {
                          setFieldError(
                            "followUpDate",
                            "Ngày theo dõi phải sau ngày khám"
                          );
                          message.error("Ngày theo dõi phải sau ngày khám");
                          return;
                        }
                      }
                      // Validate bằng Yup như cũ
                      const stepErrs = await validateForm();
                      if (Object.keys(stepErrs).length === 0) {
                        setCurrentStep(currentStep + 1); // Sửa: chuyển sang bước tiếp theo
                      } else {
                        message.error(
                          "Vui lòng kiểm tra lại các trường bắt buộc!"
                        );
                      }
                    }}
                    loading={isSubmitting}
                  >
                    Tiếp
                  </Button>
                )}
                {currentStep === 5 && (
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={isSubmitting}
                  >
                    Xác nhận & Lưu
                  </Button>
                )}
              </div>
            </form>
          )}
        </Formik>
      </Modal>
      {/* Modal xem chi tiết báo cáo khám sức khỏe */}
      <Modal
        title="Chi tiết báo cáo khám sức khỏe"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={
          detailReport ? (
            <Button
              type="primary"
              onClick={() => handleEditReport(detailReport)}
            >
              Chỉnh sửa
            </Button>
          ) : null
        }
        width={800}
      >
        {detailReport && (
          <div>
            <Typography.Title level={4} style={{ marginBottom: 0 }}>
              {detailReport.student?.user?.fullName ||
                detailReport.student?.fullName ||
                ""}
            </Typography.Title>
            <Typography.Text type="secondary">
              Ngày khám:{" "}
              {detailReport.scheduledDate
                ? dayjs(detailReport.scheduledDate).format("DD/MM/YYYY")
                : ""}
            </Typography.Text>
            <Divider orientation="left">Thông tin cơ bản</Divider>
            <Descriptions column={2} size="small" bordered>
              <Descriptions.Item label="Chiều cao">
                {detailReport.height} cm
              </Descriptions.Item>
              <Descriptions.Item label="Cân nặng">
                {detailReport.weight} kg
              </Descriptions.Item>
              <Descriptions.Item label="Mạch">
                {detailReport.pulse}
              </Descriptions.Item>
              <Descriptions.Item label="Huyết áp tâm thu">
                {detailReport.systolicBP}
              </Descriptions.Item>
              <Descriptions.Item label="Huyết áp tâm trương">
                {detailReport.diastolicBP}
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
                    map[detailReport.physicalClassification] ||
                    detailReport.physicalClassification
                  );
                })()}
              </Descriptions.Item>
            </Descriptions>
            <Divider orientation="left">Thị lực</Divider>
            <Descriptions column={2} size="small" bordered>
              <Descriptions.Item label="Phải (không kính)">
                {detailReport.visionRightNoGlasses}
              </Descriptions.Item>
              <Descriptions.Item label="Trái (không kính)">
                {detailReport.visionLeftNoGlasses}
              </Descriptions.Item>
              <Descriptions.Item label="Phải (có kính)">
                {detailReport.visionRightWithGlasses}
              </Descriptions.Item>
              <Descriptions.Item label="Trái (có kính)">
                {detailReport.visionLeftWithGlasses}
              </Descriptions.Item>
            </Descriptions>
            <Divider orientation="left">Thính lực</Divider>
            <Descriptions column={2} size="small" bordered>
              <Descriptions.Item label="Trái (bình thường)">
                {detailReport.hearingLeftNormal}
              </Descriptions.Item>
              <Descriptions.Item label="Trái (thì thầm)">
                {detailReport.hearingLeftWhisper}
              </Descriptions.Item>
              <Descriptions.Item label="Phải (bình thường)">
                {detailReport.hearingRightNormal}
              </Descriptions.Item>
              <Descriptions.Item label="Phải (thì thầm)">
                {detailReport.hearingRightWhisper}
              </Descriptions.Item>
            </Descriptions>
            <Divider orientation="left">Răng miệng</Divider>
            <Descriptions column={2} size="small" bordered>
              <Descriptions.Item label="Răng hàm trên">
                {detailReport.dentalUpperJaw}
              </Descriptions.Item>
              <Descriptions.Item label="Răng hàm dưới">
                {detailReport.dentalLowerJaw}
              </Descriptions.Item>
            </Descriptions>
            <Divider orientation="left">Đánh giá tổng thể</Divider>
            <Descriptions column={2} size="small" bordered>
              <Descriptions.Item label="Sức khỏe tổng thể">
                <Tag
                  color={
                    detailReport.overallHealth === "NORMAL"
                      ? "green"
                      : detailReport.overallHealth === "NEEDS_ATTENTION"
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
                      map[detailReport.overallHealth] ||
                      detailReport.overallHealth
                    );
                  })()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Cần theo dõi">
                {detailReport.requiresFollowUp ? "Có" : "Không"}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày theo dõi">
                {detailReport.followUpDate
                  ? dayjs(detailReport.followUpDate).format("DD/MM/YYYY")
                  : ""}
              </Descriptions.Item>
              <Descriptions.Item label="Khuyến nghị">
                <Typography.Text strong>
                  {detailReport.recommendations}
                </Typography.Text>
              </Descriptions.Item>
              <Descriptions.Item label="Ghi chú lâm sàng" span={2}>
                {detailReport.clinicalNotes}
              </Descriptions.Item>
              <Descriptions.Item label="Ghi chú thêm" span={2}>
                {detailReport.notes}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>
      {/* Modal cập nhật báo cáo khám sức khỏe */}
      <Modal
        title="Cập nhật báo cáo khám sức khỏe"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
        width={800}
      >
        {editInitialValues && (
          <Formik
            initialValues={editInitialValues}
            validationSchema={checkupSchema}
            enableReinitialize
            onSubmit={async (values, { setSubmitting, resetForm }) => {
              try {
                await axios.put(
                  `/api/medical-checks/${detailReport.id}`,
                  values,
                  {
                    headers: {
                      Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                  }
                );
                message.success("Cập nhật báo cáo thành công");
                setEditModalVisible(false);
                // Refetch lại danh sách báo cáo
                const resReports = await axios.get(
                  `/api/medical-checks/campaign/${selectedCampaign.id}`,
                  {
                    headers: {
                      Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                  }
                );
                setReports(resReports.data.data || []);
                resetForm();
              } catch (err) {
                message.error(
                  err.response?.data?.error || "Cập nhật báo cáo thất bại"
                );
              }
              setSubmitting(false);
            }}
          >
            {({ values, setFieldValue, isSubmitting, handleSubmit }) => (
              <form onSubmit={handleSubmit}>
                <Divider orientation="left">Thông tin cơ bản</Divider>
                <Form.Item
                  labelCol={{ span: 6 }}
                  wrapperCol={{ span: 18 }}
                  label="Ngày khám"
                  required
                >
                  <DatePicker
                    style={{ width: "100%" }}
                    value={values.scheduledDate}
                    onChange={(date) => setFieldValue("scheduledDate", date)}
                    disabled={true}
                  />
                  <ErrorMessage
                    name="scheduledDate"
                    component="div"
                    className="text-red-500 text-xs"
                  />
                </Form.Item>
                <Form.Item
                  labelCol={{ span: 6 }}
                  wrapperCol={{ span: 18 }}
                  label="Chiều cao (cm)"
                  required
                >
                  <InputNumber
                    min={50}
                    max={250}
                    style={{ width: "100%" }}
                    value={values.height}
                    onChange={(v) => setFieldValue("height", v)}
                    disabled={true}
                  />
                  <ErrorMessage
                    name="height"
                    component="div"
                    className="text-red-500 text-xs"
                  />
                </Form.Item>
                <Form.Item
                  labelCol={{ span: 6 }}
                  wrapperCol={{ span: 18 }}
                  label="Cân nặng (kg)"
                  required
                >
                  <InputNumber
                    min={10}
                    max={200}
                    style={{ width: "100%" }}
                    value={values.weight}
                    onChange={(v) => setFieldValue("weight", v)}
                    disabled={true}
                  />
                  <ErrorMessage
                    name="weight"
                    component="div"
                    className="text-red-500 text-xs"
                  />
                </Form.Item>
                <Form.Item
                  labelCol={{ span: 6 }}
                  wrapperCol={{ span: 18 }}
                  label="Mạch"
                  required
                >
                  <InputNumber
                    min={40}
                    max={200}
                    style={{ width: "100%" }}
                    value={values.pulse}
                    onChange={(v) => setFieldValue("pulse", v)}
                    disabled={true}
                  />
                  <ErrorMessage
                    name="pulse"
                    component="div"
                    className="text-red-500 text-xs"
                  />
                </Form.Item>
                <Form.Item
                  labelCol={{ span: 6 }}
                  wrapperCol={{ span: 18 }}
                  label="Huyết áp tâm thu"
                  required
                >
                  <InputNumber
                    min={60}
                    max={250}
                    style={{ width: "100%" }}
                    value={values.systolicBP}
                    onChange={(v) => setFieldValue("systolicBP", v)}
                    disabled={true}
                  />
                  <ErrorMessage
                    name="systolicBP"
                    component="div"
                    className="text-red-500 text-xs"
                  />
                </Form.Item>
                <Form.Item
                  labelCol={{ span: 6 }}
                  wrapperCol={{ span: 18 }}
                  label="Huyết áp tâm trương"
                  required
                >
                  <InputNumber
                    min={30}
                    max={150}
                    style={{ width: "100%" }}
                    value={values.diastolicBP}
                    onChange={(v) => setFieldValue("diastolicBP", v)}
                    disabled={true}
                  />
                  <ErrorMessage
                    name="diastolicBP"
                    component="div"
                    className="text-red-500 text-xs"
                  />
                </Form.Item>
                <Divider orientation="left">Thị lực</Divider>
                <Form.Item
                  labelCol={{ span: 6 }}
                  wrapperCol={{ span: 18 }}
                  label="Phải (không kính)"
                  required
                >
                  <InputNumber
                    min={0}
                    max={10}
                    step={0.1}
                    style={{ width: "100%" }}
                    value={values.visionRightNoGlasses}
                    onChange={(v) => setFieldValue("visionRightNoGlasses", v)}
                    disabled={true}
                  />
                  <ErrorMessage
                    name="visionRightNoGlasses"
                    component="div"
                    className="text-red-500 text-xs"
                  />
                </Form.Item>
                <Form.Item
                  labelCol={{ span: 6 }}
                  wrapperCol={{ span: 18 }}
                  label="Trái (không kính)"
                  required
                >
                  <InputNumber
                    min={0}
                    max={10}
                    step={0.1}
                    style={{ width: "100%" }}
                    value={values.visionLeftNoGlasses}
                    onChange={(v) => setFieldValue("visionLeftNoGlasses", v)}
                    disabled={true}
                  />
                  <ErrorMessage
                    name="visionLeftNoGlasses"
                    component="div"
                    className="text-red-500 text-xs"
                  />
                </Form.Item>
                <Form.Item
                  labelCol={{ span: 6 }}
                  wrapperCol={{ span: 18 }}
                  label="Phải (có kính)"
                  required
                >
                  <InputNumber
                    min={0}
                    max={10}
                    step={0.1}
                    style={{ width: "100%" }}
                    value={values.visionRightWithGlasses}
                    onChange={(v) => setFieldValue("visionRightWithGlasses", v)}
                    disabled={true}
                  />
                  <ErrorMessage
                    name="visionRightWithGlasses"
                    component="div"
                    className="text-red-500 text-xs"
                  />
                </Form.Item>
                <Form.Item
                  labelCol={{ span: 6 }}
                  wrapperCol={{ span: 18 }}
                  label="Trái (có kính)"
                  required
                >
                  <InputNumber
                    min={0}
                    max={10}
                    step={0.1}
                    style={{ width: "100%" }}
                    value={values.visionLeftWithGlasses}
                    onChange={(v) => setFieldValue("visionLeftWithGlasses", v)}
                    disabled={true}
                  />
                  <ErrorMessage
                    name="visionLeftWithGlasses"
                    component="div"
                    className="text-red-500 text-xs"
                  />
                </Form.Item>
                <Divider orientation="left">Thính lực</Divider>
                <Form.Item
                  labelCol={{ span: 6 }}
                  wrapperCol={{ span: 18 }}
                  label="Trái (bình thường)"
                  required
                >
                  <InputNumber
                    min={0}
                    max={10}
                    step={0.1}
                    style={{ width: "100%" }}
                    value={values.hearingLeftNormal}
                    onChange={(v) => setFieldValue("hearingLeftNormal", v)}
                    disabled={true}
                  />
                  <ErrorMessage
                    name="hearingLeftNormal"
                    component="div"
                    className="text-red-500 text-xs"
                  />
                </Form.Item>
                <Form.Item
                  labelCol={{ span: 6 }}
                  wrapperCol={{ span: 18 }}
                  label="Trái (thì thầm)"
                  required
                >
                  <InputNumber
                    min={0}
                    max={10}
                    step={0.1}
                    style={{ width: "100%" }}
                    value={values.hearingLeftWhisper}
                    onChange={(v) => setFieldValue("hearingLeftWhisper", v)}
                    disabled={true}
                  />
                  <ErrorMessage
                    name="hearingLeftWhisper"
                    component="div"
                    className="text-red-500 text-xs"
                  />
                </Form.Item>
                <Form.Item
                  labelCol={{ span: 6 }}
                  wrapperCol={{ span: 18 }}
                  label="Phải (bình thường)"
                  required
                >
                  <InputNumber
                    min={0}
                    max={10}
                    step={0.1}
                    style={{ width: "100%" }}
                    value={values.hearingRightNormal}
                    onChange={(v) => setFieldValue("hearingRightNormal", v)}
                    disabled={true}
                  />
                  <ErrorMessage
                    name="hearingRightNormal"
                    component="div"
                    className="text-red-500 text-xs"
                  />
                </Form.Item>
                <Form.Item
                  labelCol={{ span: 6 }}
                  wrapperCol={{ span: 18 }}
                  label="Phải (thì thầm)"
                  required
                >
                  <InputNumber
                    min={0}
                    max={10}
                    step={0.1}
                    style={{ width: "100%" }}
                    value={values.hearingRightWhisper}
                    onChange={(v) => setFieldValue("hearingRightWhisper", v)}
                    disabled={true}
                  />
                  <ErrorMessage
                    name="hearingRightWhisper"
                    component="div"
                    className="text-red-500 text-xs"
                  />
                </Form.Item>
                <Divider orientation="left">Răng miệng</Divider>
                <Form.Item
                  labelCol={{ span: 6 }}
                  wrapperCol={{ span: 18 }}
                  label="Răng hàm trên"
                  required
                >
                  <Input
                    value={values.dentalUpperJaw}
                    onChange={(e) =>
                      setFieldValue("dentalUpperJaw", e.target.value)
                    }
                    disabled={true}
                  />
                  <ErrorMessage
                    name="dentalUpperJaw"
                    component="div"
                    className="text-red-500 text-xs"
                  />
                </Form.Item>
                <Form.Item
                  labelCol={{ span: 6 }}
                  wrapperCol={{ span: 18 }}
                  label="Răng hàm dưới"
                  required
                >
                  <Input
                    value={values.dentalLowerJaw}
                    onChange={(e) =>
                      setFieldValue("dentalLowerJaw", e.target.value)
                    }
                    disabled={true}
                  />
                  <ErrorMessage
                    name="dentalLowerJaw"
                    component="div"
                    className="text-red-500 text-xs"
                  />
                </Form.Item>
                <Divider orientation="left">Đánh giá tổng thể</Divider>
                <Form.Item
                  labelCol={{ span: 6 }}
                  wrapperCol={{ span: 18 }}
                  label="Phân loại thể lực"
                  required
                >
                  <Select
                    value={values.physicalClassification}
                    onChange={(v) => setFieldValue("physicalClassification", v)}
                    disabled={true}
                  >
                    <Option value="EXCELLENT">Xuất sắc</Option>
                    <Option value="GOOD">Tốt</Option>
                    <Option value="AVERAGE">Trung bình</Option>
                    <Option value="WEAK">Yếu</Option>
                  </Select>
                  <ErrorMessage
                    name="physicalClassification"
                    component="div"
                    className="text-red-500 text-xs"
                  />
                </Form.Item>
                <Form.Item
                  labelCol={{ span: 6 }}
                  wrapperCol={{ span: 18 }}
                  label="Sức khỏe tổng thể"
                  required
                >
                  <Select
                    value={values.overallHealth}
                    onChange={(v) => setFieldValue("overallHealth", v)}
                  >
                    <Option value="NORMAL">Bình thường</Option>
                    <Option value="NEEDS_ATTENTION">Cần chú ý</Option>
                    <Option value="REQUIRES_TREATMENT">Cần điều trị</Option>
                  </Select>
                  <ErrorMessage
                    name="overallHealth"
                    component="div"
                    className="text-red-500 text-xs"
                  />
                </Form.Item>
                <Form.Item
                  labelCol={{ span: 6 }}
                  wrapperCol={{ span: 18 }}
                  label="Cần theo dõi"
                  required
                >
                  <Select
                    value={values.requiresFollowUp}
                    onChange={(v) => setFieldValue("requiresFollowUp", v)}
                  >
                    <Option value={false}>Không</Option>
                    <Option value={true}>Có</Option>
                  </Select>
                  <ErrorMessage
                    name="requiresFollowUp"
                    component="div"
                    className="text-red-500 text-xs"
                  />
                </Form.Item>
                <Form.Item
                  labelCol={{ span: 6 }}
                  wrapperCol={{ span: 18 }}
                  label="Ngày theo dõi"
                >
                  <DatePicker
                    style={{ width: "100%" }}
                    value={values.followUpDate}
                    onChange={(date) => setFieldValue("followUpDate", date)}
                  />
                  <ErrorMessage
                    name="followUpDate"
                    component="div"
                    className="text-red-500 text-xs"
                  />
                </Form.Item>
                <Form.Item
                  labelCol={{ span: 6 }}
                  wrapperCol={{ span: 18 }}
                  label="Khuyến nghị"
                >
                  <Input.TextArea
                    rows={2}
                    value={values.recommendations}
                    onChange={(e) =>
                      setFieldValue("recommendations", e.target.value)
                    }
                  />
                  <ErrorMessage
                    name="recommendations"
                    component="div"
                    className="text-red-500 text-xs"
                  />
                </Form.Item>
                <Form.Item
                  labelCol={{ span: 6 }}
                  wrapperCol={{ span: 18 }}
                  label="Ghi chú lâm sàng"
                  required
                >
                  <Input.TextArea
                    rows={2}
                    value={values.clinicalNotes}
                    onChange={(e) =>
                      setFieldValue("clinicalNotes", e.target.value)
                    }
                  />
                  <ErrorMessage
                    name="clinicalNotes"
                    component="div"
                    className="text-red-500 text-xs"
                  />
                </Form.Item>
                <Form.Item
                  labelCol={{ span: 6 }}
                  wrapperCol={{ span: 18 }}
                  label="Ghi chú thêm"
                >
                  <Input.TextArea
                    rows={2}
                    value={values.notes}
                    onChange={(e) => setFieldValue("notes", e.target.value)}
                  />
                </Form.Item>
                <div className="flex justify-end">
                  <Button
                    onClick={() => {
                      setEditModalVisible(false);
                    }}
                    style={{ marginRight: 8 }}
                  >
                    Hủy
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={isSubmitting}
                  >
                    Lưu báo cáo
                  </Button>
                </div>
              </form>
            )}
          </Formik>
        )}
      </Modal>
      {/* Modal gửi kết quả & đặt lịch tư vấn */}
      <Modal
        title={`Đặt lịch tư vấn: ${
          consultReport?.student?.user?.fullName || ""
        }`}
        open={consultModalVisible}
        onCancel={() => setConsultModalVisible(false)}
        onOk={handleSendConsult}
        okText="Đặt lịch"
        confirmLoading={consultLoading}
      >
        {consultReport && (
          <Card
            type="inner"
            title="Kết quả khám sức khỏe"
            style={{ marginBottom: 16 }}
          >
            <div>
              <b>Chiều cao:</b>{" "}
              {consultReport.height ? consultReport.height + " cm" : "-"}
            </div>
            <div>
              <b>Cân nặng:</b>{" "}
              {consultReport.weight ? consultReport.weight + " kg" : "-"}
            </div>
            <div>
              <b>Huyết áp:</b>{" "}
              {consultReport.systolicBP && consultReport.diastolicBP
                ? `${consultReport.systolicBP}/${consultReport.diastolicBP} mmHg`
                : "-"}
            </div>
            <div>
              <b>Sức khỏe tổng thể:</b>{" "}
              {consultReport.overallHealth === "NORMAL"
                ? "Bình thường"
                : consultReport.overallHealth === "NEEDS_ATTENTION"
                ? "Cần chú ý"
                : consultReport.overallHealth === "REQUIRES_TREATMENT"
                ? "Cần điều trị"
                : consultReport.overallHealth}
            </div>
            {consultReport.notes && (
              <div>
                <b>Ghi chú:</b> {consultReport.notes}
              </div>
            )}
          </Card>
        )}
        <Form layout="vertical">
          <Form.Item label="Khoảng thời gian tư vấn" required>
            <RangePicker
              style={{ width: "100%" }}
              value={consultRange}
              onChange={setConsultRange}
              showTime
              format="DD/MM/YYYY HH:mm"
              placeholder={["Từ ngày/giờ", "Đến ngày/giờ"]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default HealthCheckups;
