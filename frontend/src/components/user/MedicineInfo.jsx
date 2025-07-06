import {
  EyeOutlined,
  MedicineBoxOutlined,
  PlusOutlined,
  UploadOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  Checkbox,
  DatePicker,
  Empty,
  Form,
  Image,
  Input,
  message,
  Modal,
  Progress,
  Radio,
  Select,
  Space,
  Spin,
  Steps,
  Tabs,
  Tag,
  Tooltip,
  Typography,
  Upload,
} from "antd";
import axios from "axios";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import * as Yup from "yup";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Search } = Input;
const { Dragger } = Upload;
const { Step } = Steps;

const validationSchema = Yup.object().shape({
  studentId: Yup.string().required("Vui lòng chọn học sinh"),
  medicationName: Yup.string().required("Vui lòng nhập tên thuốc"),
  dosage: Yup.string().required("Vui lòng nhập liều lượng"),
  frequency: Yup.string().required("Vui lòng nhập tần suất sử dụng"),
  instructions: Yup.string().required("Vui lòng nhập hướng dẫn sử dụng"),
  startDate: Yup.date().required("Vui lòng chọn ngày bắt đầu"),
  endDate: Yup.date().required("Vui lòng chọn ngày kết thúc"),
  description: Yup.string(),
  unit: Yup.string(),
  stockQuantity: Yup.number()
    .typeError("Vui lòng nhập số lượng")
    .min(1, "Số lượng phải lớn hơn 0")
    .required("Vui lòng nhập số lượng"),
});

const statusColor = {
  PENDING_APPROVAL: "orange",
  APPROVED: "green",
  REJECTED: "red",
};

const statusLabel = {
  PENDING_APPROVAL: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  REJECTED: "Từ chối",
};

const MedicineInfo = () => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [children, setChildren] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentMedicines, setStudentMedicines] = useState([]);
  const [loadingMedicines, setLoadingMedicines] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [activeTab, setActiveTab] = useState("all");
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageError, setImageError] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const [multiStepData, setMultiStepData] = useState({
    studentId: selectedStudent,
    studentName: "",
    className: "",
    medicationName: "",
    medicationType: "",
    allergy: "",
    dosage: "",
    unit: "",
    frequency: "",
    customTimes: [],
    startDate: null,
    endDate: null,
    description: "",
    instructions: "",
    usageNote: "",
    importantNotes: [],
    emergencyContact: "",
    medicineImage: null,
    prescriptionImage: null,
    agreeConfirm: false,
    agreeTerms: false,
    stockQuantity: 1,
  });
  const [successModal, setSuccessModal] = useState(false);

  useEffect(() => {
    fetchChildren();
  }, []);

  useEffect(() => {
    if (selectedStudent) {
      fetchStudentMedicines(selectedStudent);
    }
  }, [selectedStudent]);

  const fetchChildren = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/parents/my-children", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        console.log(response.data.data);
        setChildren(response.data.data);
        if (response.data.data.length > 0) {
          setSelectedStudent(response.data.data[0].studentId);
        }
      }
    } catch (error) {
      console.error("Error fetching children:", error);
      message.error("Không thể lấy danh sách học sinh");
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentMedicines = async (studentId) => {
    setLoadingMedicines(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `/api/parents/students/${studentId}/medicines`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.data.success) {
        setStudentMedicines(response.data.data || []);
      } else {
        setStudentMedicines([]);
      }
    } catch {
      setStudentMedicines([]);
    } finally {
      setLoadingMedicines(false);
    }
  };

  const handleStudentChange = (studentId) => {
    setSelectedStudent(studentId);
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("medicationName", values.medicationName);
      formData.append("dosage", values.dosage);
      formData.append("frequency", values.frequency);
      formData.append("instructions", values.instructions);
      formData.append(
        "startDate",
        values.startDate ? values.startDate.toISOString() : ""
      );
      formData.append(
        "endDate",
        values.endDate ? values.endDate.toISOString() : ""
      );
      formData.append("description", values.description || "");
      formData.append("unit", values.unit || "");
      formData.append("stockQuantity", values.stockQuantity);
      if (selectedImageFile) {
        formData.append("medicineImage", selectedImageFile);
      }
      const response = await axios.post(
        `/api/parents/request-medication/${values.studentId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        message.success("Gửi thông tin thuốc thành công");
        resetForm();
        setIsEditModalVisible(false);
        setShowSuccess(true);
        fetchStudentMedicines(selectedStudent);
        setSelectedImageFile(null);
        setImagePreview(null);
      } else {
        message.error(response.data.error || "Có lỗi xảy ra khi gửi thông tin");
      }
    } catch (error) {
      console.error("Error submitting medication:", error);
      message.error(
        error.response?.data?.error || "Có lỗi xảy ra khi gửi thông tin"
      );
    } finally {
      setSubmitting(false);
      setLoading(false);
    }
  };

  // Helper functions for enhanced features
  const frequencyLabel = {
    once: "1 lần/ngày",
    twice: "2 lần/ngày",
    three: "3 lần/ngày",
    four: "4 lần/ngày",
  };

  // Helper: map frequency to number of times
  const frequencyToTimes = {
    once: 1,
    twice: 2,
    three: 3,
    "6h": 4,
  };

  // Calculate statistics
  const getStatistics = () => {
    const total = studentMedicines.length;
    const approved = studentMedicines.filter(
      (m) => m.status === "APPROVED"
    ).length;
    const pending = studentMedicines.filter(
      (m) => m.status === "PENDING_APPROVAL"
    ).length;
    const rejected = studentMedicines.filter(
      (m) => m.status === "REJECTED"
    ).length;

    // Check for expiring medicines (within 7 days)
    const today = dayjs();
    const expiring = studentMedicines.filter((m) => {
      if (!m.endDate) return false;
      const endDate = dayjs(m.endDate);
      return endDate.diff(today, "day") <= 7 && endDate.diff(today, "day") >= 0;
    }).length;

    return { total, approved, pending, rejected, expiring };
  };

  // Filter medicines based on search and status
  const getFilteredMedicines = () => {
    let filtered = studentMedicines;

    // Filter by search text
    if (searchText) {
      filtered = filtered.filter(
        (medicine) =>
          medicine.medication?.name
            ?.toLowerCase()
            .includes(searchText.toLowerCase()) ||
          medicine.dosage?.toLowerCase().includes(searchText.toLowerCase()) ||
          medicine.instructions
            ?.toLowerCase()
            .includes(searchText.toLowerCase())
      );
    }

    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter(
        (medicine) => medicine.status === filterStatus
      );
    }

    // Filter by tab
    if (activeTab === "active") {
      filtered = filtered.filter((medicine) => medicine.status === "APPROVED");
    } else if (activeTab === "pending") {
      filtered = filtered.filter(
        (medicine) => medicine.status === "PENDING_APPROVAL"
      );
    } else if (activeTab === "expiring") {
      const today = dayjs();
      filtered = filtered.filter((medicine) => {
        if (!medicine.endDate) return false;
        const endDate = dayjs(medicine.endDate);
        return (
          endDate.diff(today, "day") <= 7 && endDate.diff(today, "day") >= 0
        );
      });
    }

    return filtered;
  };

  const filteredMedicines = getFilteredMedicines();
  const stats = getStatistics();

  // Hiện modal chi tiết khi phụ huynh bấm vào thuốc
  const handleMedicineClick = (medicine) => {
    setSelectedMedicine(medicine);
    setDetailModalOpen(true);
  };

  // Xử lý chọn ảnh
  const beforeUpload = (file) => {
    const isImage = file.type.startsWith("image/");
    const isLt10M = file.size / 1024 / 1024 < 10;
    if (!isImage) {
      setImageError("Chỉ hỗ trợ file ảnh (JPG, PNG, GIF, WebP)");
      return Upload.LIST_IGNORE;
    }
    if (!isLt10M) {
      setImageError("Ảnh phải nhỏ hơn 10MB!");
      return Upload.LIST_IGNORE;
    }
    setImageError("");
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
    setSelectedImageFile(file);
    return false; // Ngăn upload tự động
  };
  const handleRemoveImage = () => {
    setSelectedImageFile(null);
    setImagePreview(null);
    setImageError("");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-[#f6fcfa] pt-20">
        <div className="w-full max-w-6xl mx-auto px-4">
          <div style={{ padding: "24px", textAlign: "center" }}>
            <Spin size="large" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f6fcfa] to-[#e8f5f2] pt-20">
      <div className="w-full max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-[#d5f2ec] text-[#36ae9a] px-4 py-2 rounded-full text-sm font-medium mb-4">
            <MedicineBoxOutlined className="text-[#36ae9a]" />
            <span>Quản lý thuốc học sinh</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Thông tin thuốc
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Theo dõi và quản lý thông tin thuốc của học sinh một cách an toàn và
            hiệu quả
          </p>
        </div>

        {/* Student Selection */}
        <Card className="rounded-2xl shadow-lg border-0 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
            <div>
              <Title level={4} className="mb-2">
                Chọn học sinh
              </Title>
              <Text type="secondary">
                Chọn học sinh để xem và quản lý thông tin thuốc
              </Text>
            </div>
            <div className="flex items-center gap-4">
              {children && children.length > 0 ? (
                <Select
                  style={{ width: 250 }}
                  value={selectedStudent}
                  onChange={handleStudentChange}
                  placeholder="Chọn học sinh"
                  size="large"
                >
                  {children.map((child) => (
                    <Select.Option
                      key={child.studentId}
                      value={child.studentId}
                    >
                      <div className="flex items-center gap-2">
                        <UserOutlined />
                        <span>{child.fullName}</span>
                      </div>
                    </Select.Option>
                  ))}
                </Select>
              ) : (
                <Text type="secondary">Không có học sinh nào</Text>
              )}
            </div>
          </div>
        </Card>

        {showSuccess && (
          <Alert
            message="Thông tin thuốc đã được gửi thành công!"
            type="success"
            showIcon
            className="mb-6"
          />
        )}

        {selectedStudent && (
          <>
            {/* Separator */}
            <div className="my-8">
              <div className="flex items-center">
                <div className="flex-1 h-px bg-gray-200"></div>
                <div className="px-4">
                  <div className="inline-flex items-center gap-2 bg-white text-gray-500 px-3 py-1 rounded-full text-sm border border-gray-200">
                    <MedicineBoxOutlined className="text-[#36ae9a]" />
                    <span>Danh sách thuốc</span>
                  </div>
                </div>
                <div className="flex-1 h-px bg-gray-200"></div>
              </div>
            </div>

            {/* Tabs and Medicine List Section (merged) */}
            <Card className="rounded-2xl shadow-lg border-0">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <Title level={4} className="mb-0">
                    Danh sách thuốc
                  </Title>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setIsEditModalVisible(true)}
                    className="bg-[#36ae9a] hover:bg-[#2a8a7a] border-[#36ae9a]"
                  >
                    Gửi thuốc cho học sinh
                  </Button>
                </div>
                <Tabs
                  activeKey={activeTab}
                  onChange={setActiveTab}
                  items={[
                    {
                      key: "all",
                      label: (
                        <span>
                          Tất cả
                          <Badge count={stats.total} className="ml-2" />
                        </span>
                      ),
                    },
                    {
                      key: "active",
                      label: (
                        <span>
                          Đang dùng
                          <Badge count={stats.approved} className="ml-2" />
                        </span>
                      ),
                    },
                    {
                      key: "pending",
                      label: (
                        <span>
                          Chờ duyệt
                          <Badge count={stats.pending} className="ml-2" />
                        </span>
                      ),
                    },
                    {
                      key: "expiring",
                      label: (
                        <span>
                          Sắp hết hạn
                          <Badge count={stats.expiring} className="ml-2" />
                        </span>
                      ),
                    },
                  ]}
                />

                {filteredMedicines.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                    {filteredMedicines.map((medicine) => {
                      const isExpiring =
                        medicine.endDate &&
                        dayjs(medicine.endDate).diff(dayjs(), "day") <= 7;
                      const isExpired =
                        medicine.endDate &&
                        dayjs(medicine.endDate).diff(dayjs(), "day") < 0;

                      return (
                        <Card
                          key={medicine.id}
                          className="rounded-2xl shadow-lg border-0 hover:shadow-xl transition-shadow duration-300 cursor-pointer"
                          actions={[
                            <Tooltip title="Xem chi tiết">
                              <EyeOutlined
                                key="view"
                                className="text-blue-500"
                              />
                            </Tooltip>,
                            // Phụ huynh chỉ có thể xem thông tin thuốc, không thể sửa hoặc xóa. Nếu cần thay đổi, hãy liên hệ với nhà trường hoặc gửi yêu cầu mới.
                          ]}
                          onClick={() => handleMedicineClick(medicine)}
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <Title level={5} className="mb-2 text-gray-800">
                                {medicine.medication?.name || "Không có tên"}
                              </Title>
                              <Tag
                                color={statusColor[medicine.status]}
                                className="mb-2"
                              >
                                {statusLabel[medicine.status]}
                              </Tag>
                              {isExpiring && !isExpired && (
                                <Tag color="warning" className="mb-2">
                                  ⚠️ Sắp hết hạn
                                </Tag>
                              )}
                              {isExpired && (
                                <Tag color="error" className="mb-2">
                                  ❌ Đã hết hạn
                                </Tag>
                              )}
                            </div>
                            <Avatar
                              size={48}
                              icon={<MedicineBoxOutlined />}
                              className="bg-[#36ae9a] text-white"
                            />
                          </div>

                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <Text type="secondary">Liều lượng:</Text>
                              <Text strong>{medicine.dosage}</Text>
                            </div>

                            <div className="flex justify-between items-center">
                              <Text type="secondary">Tần suất:</Text>
                              <Text strong>
                                {frequencyLabel[medicine.frequency] ||
                                  medicine.frequency}
                              </Text>
                            </div>

                            {medicine.startDate && medicine.endDate && (
                              <div className="flex justify-between items-center">
                                <Text type="secondary">Thời gian:</Text>
                                <Text strong>
                                  {dayjs(medicine.startDate).format(
                                    "DD/MM/YYYY"
                                  )}{" "}
                                  -{" "}
                                  {dayjs(medicine.endDate).format("DD/MM/YYYY")}
                                </Text>
                              </div>
                            )}

                            {medicine.instructions && (
                              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                <Text type="secondary" className="text-sm">
                                  {medicine.instructions.length > 100
                                    ? `${medicine.instructions.substring(
                                        0,
                                        100
                                      )}...`
                                    : medicine.instructions}
                                </Text>
                              </div>
                            )}
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={
                      <span>
                        {searchText ||
                        filterStatus !== "all" ||
                        activeTab !== "all"
                          ? "Không tìm thấy thuốc phù hợp"
                          : "Chưa có thông tin thuốc nào"}
                      </span>
                    }
                  >
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => setIsEditModalVisible(true)}
                      className="bg-[#36ae9a] hover:bg-[#2a8a7a] border-[#36ae9a]"
                    >
                      Gửi thuốc cho học sinh
                    </Button>
                  </Empty>
                )}
              </div>
            </Card>
          </>
        )}

        {!selectedStudent && (
          <Card className="rounded-2xl shadow-lg border-0">
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">👨‍🎓</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                Vui lòng chọn học sinh
              </h3>
              <p className="text-gray-500">
                Chọn học sinh từ danh sách để xem thông tin thuốc
              </p>
            </div>
          </Card>
        )}

        <Modal
          title={null}
          open={isEditModalVisible}
          onCancel={() => setIsEditModalVisible(false)}
          footer={null}
          width={500}
          centered
        >
          {/* STEP 0: Welcome */}
          {currentStep === 0 && (
            <div style={{ textAlign: "center", padding: 24 }}>
              <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
                💊 GỬI THUỐC CHO HỌC SINH
              </div>
              <div style={{ margin: "24px 0" }}>
                {/* Placeholder illustration */}
                <div
                  style={{
                    background: "#f6fcfa",
                    borderRadius: 16,
                    padding: 24,
                    margin: "0 auto",
                    width: 220,
                  }}
                >
                  <div style={{ fontSize: 48 }}>👩‍👦‍👦💊</div>
                  <div style={{ fontWeight: 500, marginTop: 8 }}>
                    THÔNG TIN THUỐC
                  </div>
                </div>
              </div>
              <div style={{ color: "#555", marginBottom: 8 }}>
                Giúp con bạn uống thuốc đúng cách và an toàn tại trường
              </div>
              <div style={{ color: "#888", fontSize: 15, marginBottom: 16 }}>
                ⏱️ Chỉ mất 3-5 phút
                <br />
                📋 4 bước đơn giản
                <br />
              </div>
              <Button
                type="primary"
                size="large"
                style={{ width: 220, fontWeight: 600 }}
                onClick={() => setCurrentStep(1)}
              >
                BẮT ĐẦU NGAY
              </Button>
            </div>
          )}
          {/* STEP 1: Thông tin cơ bản */}
          {currentStep === 1 && (
            <div style={{ padding: 24 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <Button
                  type="link"
                  onClick={() => setCurrentStep(0)}
                  style={{ padding: 0, marginRight: 8 }}
                >
                  &larr;
                </Button>
                <b>Thông tin cơ bản</b>
                <Tooltip title="Nhập thông tin thuốc">
                  <span style={{ marginLeft: 8, color: "#888" }}>?</span>
                </Tooltip>
                <div style={{ flex: 1 }} />
                <span style={{ color: "#36ae9a", fontWeight: 500 }}>
                  {currentStep}/4
                </span>
              </div>
              <Progress
                percent={25}
                showInfo={false}
                strokeColor="#36ae9a"
                style={{ marginBottom: 16 }}
              />
              {/* Hiển thị thông tin học sinh đã chọn */}
              {children && selectedStudent && (
                <div
                  style={{
                    background: "#f6fcfa",
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 16,
                    fontWeight: 500,
                    color: "#36ae9a",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <UserOutlined style={{ marginRight: 8 }} />
                  {(() => {
                    const student = children.find(
                      (c) => c.studentId === selectedStudent
                    );
                    return student
                      ? `Gửi thuốc cho: ${student.fullName} - Lớp ${
                          student.className || student.class || "?"
                        }`
                      : "Chưa chọn học sinh";
                  })()}
                </div>
              )}
              <Form layout="vertical">
                <Form.Item label="Tên thuốc *">
                  <Input
                    value={multiStepData.medicationName}
                    onChange={(e) =>
                      setMultiStepData((d) => ({
                        ...d,
                        medicationName: e.target.value,
                      }))
                    }
                    placeholder="Gợi ý: Paracetamol, Amoxicillin..."
                  />
                </Form.Item>
                <Form.Item label="Loại thuốc *">
                  <Select
                    value={multiStepData.medicationType}
                    onChange={(v) =>
                      setMultiStepData((d) => ({ ...d, medicationType: v }))
                    }
                    placeholder="Chọn loại"
                  >
                    <Select.Option value="giam-dau">
                      Giảm đau, hạ sốt
                    </Select.Option>
                    <Select.Option value="khang-sinh">Kháng sinh</Select.Option>
                    <Select.Option value="ho-hap">Hô hấp</Select.Option>
                    <Select.Option value="tieu-hoa">Tiêu hóa</Select.Option>
                    <Select.Option value="khac">Khác</Select.Option>
                  </Select>
                </Form.Item>
                <Form.Item label="Trẻ có dị ứng thuốc nào?">
                  <Select
                    value={multiStepData.allergy}
                    onChange={(v) =>
                      setMultiStepData((d) => ({ ...d, allergy: v }))
                    }
                    placeholder="Chọn dị ứng"
                  >
                    <Select.Option value="none">Không</Select.Option>
                    <Select.Option value="penicillin">Penicillin</Select.Option>
                    <Select.Option value="paracetamol">
                      Paracetamol
                    </Select.Option>
                    <Select.Option value="khac">Khác</Select.Option>
                  </Select>
                </Form.Item>
                <Button
                  type="primary"
                  block
                  onClick={() => setCurrentStep(2)}
                  disabled={
                    !(
                      multiStepData.medicationName &&
                      multiStepData.medicationType
                    )
                  }
                >
                  Tiếp theo →
                </Button>
              </Form>
            </div>
          )}
          {/* STEP 2: Liều lượng & Thời gian */}
          {currentStep === 2 && (
            <div style={{ padding: 24 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <Button
                  type="link"
                  onClick={() => setCurrentStep(1)}
                  style={{ padding: 0, marginRight: 8 }}
                >
                  &larr;
                </Button>
                <b>Liều lượng & Thời gian</b>
                <Tooltip title="Nhập liều lượng, tần suất, thời gian">
                  <span style={{ marginLeft: 8, color: "#888" }}>?</span>
                </Tooltip>
                <div style={{ flex: 1 }} />
                <span style={{ color: "#36ae9a", fontWeight: 500 }}>
                  {currentStep}/4
                </span>
              </div>
              <Progress
                percent={50}
                showInfo={false}
                strokeColor="#36ae9a"
                style={{ marginBottom: 16 }}
              />
              <Form layout="vertical">
                {/* Liều lượng & Đơn vị trên 1 dòng */}
                <Form.Item label="Liều lượng *">
                  <Space>
                    <Input
                      type="number"
                      min={1}
                      step={1}
                      value={multiStepData.dosage}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^\d.]/g, "");
                        setMultiStepData((d) => ({ ...d, dosage: val }));
                      }}
                      placeholder="Nhập liều lượng (vd: 250)"
                      style={{ width: 120 }}
                    />
                    <Select
                      value={multiStepData.unit}
                      onChange={(v) =>
                        setMultiStepData((d) => ({ ...d, unit: v }))
                      }
                      placeholder="Đơn vị"
                      style={{ width: 100 }}
                    >
                      <Select.Option value="mg">mg</Select.Option>
                      <Select.Option value="ml">ml</Select.Option>
                      <Select.Option value="vien">viên</Select.Option>
                      <Select.Option value="khac">Khác</Select.Option>
                    </Select>
                  </Space>
                </Form.Item>
                {/* Tần suất sử dụng */}
                <Form.Item label="Tần suất sử dụng *">
                  <Radio.Group
                    value={multiStepData.frequency}
                    onChange={(e) => {
                      const freq = e.target.value;
                      let newTimes = multiStepData.customTimes || [];
                      if (freq !== "custom" && freq !== "as-needed") {
                        const n = frequencyToTimes[freq] || 1;
                        newTimes = Array(n)
                          .fill("")
                          .map((_, i) => newTimes[i] || "");
                      } else if (freq === "as-needed") {
                        newTimes = [];
                      }
                      setMultiStepData((d) => ({
                        ...d,
                        frequency: freq,
                        customTimes: newTimes,
                      }));
                    }}
                  >
                    <Space direction="vertical">
                      <Radio value="once">Ngày 1 lần</Radio>
                      <Radio value="twice">Ngày 2 lần</Radio>
                      <Radio value="three">Ngày 3 lần</Radio>
                      <Radio value="6h">Mỗi 6 tiếng 1 lần</Radio>
                      <Radio value="as-needed">Khi cần thiết</Radio>
                      <Radio value="custom">Tùy chỉnh...</Radio>
                    </Space>
                  </Radio.Group>
                </Form.Item>
                {/* Giờ uống cụ thể: bắt buộc với mọi tần suất trừ 'Khi cần thiết' */}
                {multiStepData.frequency !== "as-needed" && (
                  <Form.Item
                    label="Giờ uống cụ thể *"
                    required
                    validateStatus={
                      (multiStepData.customTimes || []).some((t) => !t)
                        ? "error"
                        : undefined
                    }
                    help={
                      (multiStepData.customTimes || []).some((t) => !t)
                        ? "Vui lòng nhập đủ giờ uống cho từng lần"
                        : undefined
                    }
                  >
                    <Space direction="vertical" style={{ width: "100%" }}>
                      {(multiStepData.customTimes || []).map((time, idx) => (
                        <Space key={idx}>
                          <Input
                            type="time"
                            value={time}
                            onChange={(e) => {
                              const newTimes = [...multiStepData.customTimes];
                              newTimes[idx] = e.target.value;
                              setMultiStepData((d) => ({
                                ...d,
                                customTimes: newTimes,
                              }));
                            }}
                            style={{ width: 120 }}
                          />
                          {multiStepData.frequency === "custom" && (
                            <Button
                              size="small"
                              danger
                              onClick={() => {
                                const newTimes = [...multiStepData.customTimes];
                                newTimes.splice(idx, 1);
                                setMultiStepData((d) => ({
                                  ...d,
                                  customTimes: newTimes,
                                }));
                              }}
                            >
                              Xóa
                            </Button>
                          )}
                        </Space>
                      ))}
                      {multiStepData.frequency === "custom" && (
                        <Button
                          type="dashed"
                          icon={<PlusOutlined />}
                          onClick={() =>
                            setMultiStepData((d) => ({
                              ...d,
                              customTimes: [...(d.customTimes || []), ""],
                            }))
                          }
                          style={{ width: 120 }}
                        >
                          Thêm lần uống
                        </Button>
                      )}
                    </Space>
                  </Form.Item>
                )}
                {/* Thời gian sử dụng */}
                <Form.Item label="Thời gian sử dụng *">
                  <DatePicker.RangePicker
                    value={
                      multiStepData.startDate && multiStepData.endDate
                        ? [multiStepData.startDate, multiStepData.endDate]
                        : []
                    }
                    onChange={(dates) => {
                      setMultiStepData((d) => ({
                        ...d,
                        startDate: dates && dates[0] ? dates[0] : null,
                        endDate: dates && dates[1] ? dates[1] : null,
                      }));
                    }}
                    style={{ width: "100%" }}
                    format="DD/MM/YYYY"
                  />
                  {multiStepData.startDate && multiStepData.endDate && (
                    <div style={{ marginTop: 8, color: "#888" }}>
                      (
                      {multiStepData.endDate.diff(
                        multiStepData.startDate,
                        "day"
                      ) + 1}{" "}
                      ngày)
                    </div>
                  )}
                </Form.Item>
                <Button
                  type="primary"
                  block
                  onClick={() => setCurrentStep(3)}
                  disabled={
                    !(
                      multiStepData.dosage &&
                      multiStepData.unit &&
                      multiStepData.frequency &&
                      multiStepData.startDate &&
                      multiStepData.endDate &&
                      (multiStepData.frequency === "as-needed" ||
                        ((multiStepData.customTimes || []).length > 0 &&
                          (multiStepData.customTimes || []).every((t) => !!t)))
                    )
                  }
                >
                  Tiếp theo →
                </Button>
              </Form>
            </div>
          )}
          {/* STEP 3: Hướng dẫn sử dụng */}
          {currentStep === 3 && (
            <div style={{ padding: 24 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <Button
                  type="link"
                  onClick={() => setCurrentStep(2)}
                  style={{ padding: 0, marginRight: 8 }}
                >
                  &larr;
                </Button>
                <b>Hướng dẫn sử dụng</b>
                <Tooltip title="Cách dùng, lưu ý, liên hệ">
                  <span style={{ marginLeft: 8, color: "#888" }}>?</span>
                </Tooltip>
                <div style={{ flex: 1 }} />
                <span style={{ color: "#36ae9a", fontWeight: 500 }}>
                  {currentStep}/4
                </span>
              </div>
              <Progress
                percent={75}
                showInfo={false}
                strokeColor="#36ae9a"
                style={{ marginBottom: 16 }}
              />
              <Form layout="vertical">
                <Form.Item label="Cách sử dụng *">
                  <Select
                    value={multiStepData.usageNote}
                    onChange={(v) =>
                      setMultiStepData((d) => ({ ...d, usageNote: v }))
                    }
                    placeholder="Chọn cách dùng"
                  >
                    <Select.Option value="before-meal">
                      Uống trước ăn
                    </Select.Option>
                    <Select.Option value="after-meal">
                      Uống sau ăn
                    </Select.Option>
                    <Select.Option value="with-food">
                      Uống cùng thức ăn
                    </Select.Option>
                    <Select.Option value="empty-stomach">
                      Uống lúc đói
                    </Select.Option>
                    <Select.Option value="other">Khác</Select.Option>
                  </Select>
                </Form.Item>
                {/* Nếu chọn Khác, hiển thị ô nhập chi tiết */}
                {multiStepData.usageNote === "other" && (
                  <Form.Item
                    label="Nhập cách sử dụng cụ thể *"
                    required
                    validateStatus={
                      multiStepData.usageNoteDetail ? undefined : "error"
                    }
                    help={
                      multiStepData.usageNoteDetail
                        ? undefined
                        : "Vui lòng nhập cách sử dụng cụ thể"
                    }
                  >
                    <Input
                      value={multiStepData.usageNoteDetail || ""}
                      onChange={(e) =>
                        setMultiStepData((d) => ({
                          ...d,
                          usageNoteDetail: e.target.value,
                        }))
                      }
                      placeholder="Nhập cách sử dụng cụ thể"
                    />
                  </Form.Item>
                )}
                <Form.Item label="Hướng dẫn chi tiết">
                  <TextArea
                    value={multiStepData.instructions}
                    onChange={(e) =>
                      setMultiStepData((d) => ({
                        ...d,
                        instructions: e.target.value,
                      }))
                    }
                    placeholder="Nhập hướng dẫn chi tiết (tối đa 500 ký tự)"
                    maxLength={500}
                    rows={3}
                  />
                </Form.Item>
                <Form.Item label="Lưu ý quan trọng">
                  <Checkbox.Group
                    options={[
                      {
                        label: "Dừng uống nếu nôn mửa",
                        value: "stop-if-vomit",
                      },
                      { label: "Báo cô nếu sốt cao", value: "notify-fever" },
                      { label: "Không uống quá liều", value: "no-overdose" },
                      { label: "Khác", value: "other" },
                    ]}
                    value={multiStepData.importantNotes}
                    onChange={(list) =>
                      setMultiStepData((d) => ({ ...d, importantNotes: list }))
                    }
                  />
                </Form.Item>
                {/* Nếu tick Khác, hiển thị ô nhập chi tiết */}
                {multiStepData.importantNotes &&
                  multiStepData.importantNotes.includes("other") && (
                    <Form.Item
                      label="Nhập lưu ý quan trọng khác *"
                      required
                      validateStatus={
                        multiStepData.importantNotesDetail ? undefined : "error"
                      }
                      help={
                        multiStepData.importantNotesDetail
                          ? undefined
                          : "Vui lòng nhập lưu ý quan trọng khác"
                      }
                    >
                      <Input
                        value={multiStepData.importantNotesDetail || ""}
                        onChange={(e) =>
                          setMultiStepData((d) => ({
                            ...d,
                            importantNotesDetail: e.target.value,
                          }))
                        }
                        placeholder="Nhập lưu ý quan trọng khác"
                      />
                    </Form.Item>
                  )}
                <Form.Item label="SĐT phụ huynh *">
                  <Input
                    value={multiStepData.emergencyContact}
                    onChange={(e) =>
                      setMultiStepData((d) => ({
                        ...d,
                        emergencyContact: e.target.value,
                      }))
                    }
                    placeholder="Nhập số điện thoại liên hệ khẩn cấp"
                  />
                </Form.Item>
                <Button
                  type="primary"
                  block
                  onClick={() => setCurrentStep(4)}
                  disabled={
                    !(
                      multiStepData.usageNote &&
                      multiStepData.emergencyContact &&
                      (multiStepData.usageNote !== "other" ||
                        !!multiStepData.usageNoteDetail) &&
                      (!multiStepData.importantNotes ||
                        !multiStepData.importantNotes.includes("other") ||
                        !!multiStepData.importantNotesDetail)
                    )
                  }
                >
                  Tiếp theo →
                </Button>
              </Form>
            </div>
          )}
          {/* STEP 4: Ảnh & Xác nhận */}
          {currentStep === 4 && (
            <div style={{ padding: 24 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <Button
                  type="link"
                  onClick={() => setCurrentStep(3)}
                  style={{ padding: 0, marginRight: 8 }}
                >
                  &larr;
                </Button>
                <b>Upload ảnh & Xác nhận</b>
                <Tooltip title="Upload ảnh thuốc, xác nhận">
                  <span style={{ marginLeft: 8, color: "#888" }}>?</span>
                </Tooltip>
                <div style={{ flex: 1 }} />
                <span style={{ color: "#36ae9a", fontWeight: 500 }}>
                  {currentStep}/4
                </span>
              </div>
              <Progress
                percent={100}
                showInfo={false}
                strokeColor="#36ae9a"
                style={{ marginBottom: 16 }}
              />
              <Form layout="vertical">
                <Form.Item label="Ảnh thuốc (nếu có)">
                  <Dragger
                    name="medicineImage"
                    multiple={false}
                    maxCount={1}
                    accept="image/*"
                    beforeUpload={(file) => {
                      setMultiStepData((d) => ({ ...d, medicineImage: file }));
                      return false;
                    }}
                    showUploadList={false}
                    style={{ padding: 8 }}
                  >
                    <p className="ant-upload-drag-icon">
                      <UploadOutlined />
                    </p>
                    <p className="ant-upload-text">
                      Kéo và thả ảnh vào đây hoặc nhấp để chọn ảnh
                    </p>
                    <p className="ant-upload-hint">
                      Hỗ trợ: JPG, PNG, GIF, WebP - Kích thước tối đa 10MB
                    </p>
                  </Dragger>
                  {multiStepData.medicineImage && (
                    <div className="mt-4">
                      <Image
                        src={URL.createObjectURL(multiStepData.medicineImage)}
                        alt="Preview"
                        style={{
                          maxWidth: 180,
                          maxHeight: 180,
                          borderRadius: 8,
                        }}
                      />
                      <Button
                        size="small"
                        danger
                        onClick={() =>
                          setMultiStepData((d) => ({
                            ...d,
                            medicineImage: null,
                          }))
                        }
                        style={{ marginTop: 8 }}
                      >
                        Xóa ảnh
                      </Button>
                    </div>
                  )}
                </Form.Item>
                <Form.Item label="Ảnh đơn thuốc (nếu có)">
                  <Dragger
                    name="prescriptionImage"
                    multiple={false}
                    maxCount={1}
                    accept="image/*"
                    beforeUpload={(file) => {
                      setMultiStepData((d) => ({
                        ...d,
                        prescriptionImage: file,
                      }));
                      return false;
                    }}
                    showUploadList={false}
                    style={{ padding: 8 }}
                  >
                    <p className="ant-upload-drag-icon">
                      <UploadOutlined />
                    </p>
                    <p className="ant-upload-text">
                      Kéo và thả ảnh vào đây hoặc nhấp để chọn ảnh
                    </p>
                    <p className="ant-upload-hint">Không bắt buộc</p>
                  </Dragger>
                  {multiStepData.prescriptionImage && (
                    <div className="mt-4">
                      <Image
                        src={URL.createObjectURL(
                          multiStepData.prescriptionImage
                        )}
                        alt="Preview"
                        style={{
                          maxWidth: 180,
                          maxHeight: 180,
                          borderRadius: 8,
                        }}
                      />
                      <Button
                        size="small"
                        danger
                        onClick={() =>
                          setMultiStepData((d) => ({
                            ...d,
                            prescriptionImage: null,
                          }))
                        }
                        style={{ marginTop: 8 }}
                      >
                        Xóa ảnh
                      </Button>
                    </div>
                  )}
                </Form.Item>
                <Form.Item>
                  <Checkbox
                    checked={multiStepData.agreeConfirm}
                    onChange={(e) =>
                      setMultiStepData((d) => ({
                        ...d,
                        agreeConfirm: e.target.checked,
                      }))
                    }
                  >
                    Tôi xác nhận tất cả thông tin là chính xác
                  </Checkbox>
                </Form.Item>
                <Form.Item>
                  <Checkbox
                    checked={multiStepData.agreeTerms}
                    onChange={(e) =>
                      setMultiStepData((d) => ({
                        ...d,
                        agreeTerms: e.target.checked,
                      }))
                    }
                  >
                    Tôi đồng ý với điều khoản sử dụng
                  </Checkbox>
                </Form.Item>
                <Button
                  type="primary"
                  block
                  onClick={() => setCurrentStep(5)}
                  disabled={
                    !(multiStepData.agreeConfirm && multiStepData.agreeTerms)
                  }
                >
                  Xác nhận & Gửi thông tin
                </Button>
              </Form>
            </div>
          )}
          {/* STEP 5: Thành công */}
          {currentStep === 5 && (
            <div style={{ textAlign: "center", padding: 32 }}>
              <div style={{ fontSize: 32, marginBottom: 16 }}>
                🎉 THÀNH CÔNG!
              </div>
              <div
                style={{
                  background: "#f6fcfa",
                  borderRadius: 16,
                  padding: 24,
                  margin: "0 auto",
                  width: 220,
                  marginBottom: 16,
                }}
              >
                <div style={{ fontSize: 32 }}>✅ Đã gửi thành công</div>
                <div style={{ color: "#36ae9a", marginTop: 8 }}>
                  📧 Email xác nhận đã được gửi
                </div>
              </div>
              <div style={{ color: "#888", marginBottom: 8 }}>
                🏥 TRẠNG THÁI: Chờ duyệt
              </div>
              <div style={{ color: "#888", marginBottom: 8 }}>
                ⏰ Thời gian xử lý: 15-30 phút
              </div>
              <div style={{ color: "#888", marginBottom: 8 }}>
                📲 Bạn sẽ nhận được: SMS, Email, Thông báo trạng thái
              </div>
              <Button
                type="primary"
                block
                style={{ margin: "16px 0" }}
                onClick={() => setCurrentStep(1)}
              >
                Thêm thuốc khác
              </Button>
              <Button block onClick={() => setIsEditModalVisible(false)}>
                Về trang chủ
              </Button>
            </div>
          )}
        </Modal>

        <Modal
          open={detailModalOpen}
          onCancel={() => setDetailModalOpen(false)}
          footer={[
            <Button
              key="close"
              type="primary"
              onClick={() => setDetailModalOpen(false)}
            >
              Đóng
            </Button>,
          ]}
          title={selectedMedicine?.medication?.name || "Chi tiết thuốc"}
          width={500}
        >
          {selectedMedicine && (
            <div className="space-y-4">
              {selectedMedicine.image && (
                <div className="flex justify-center mb-4">
                  <Image
                    src={selectedMedicine.image}
                    alt="Ảnh thuốc"
                    style={{
                      maxWidth: 200,
                      maxHeight: 200,
                      borderRadius: 8,
                    }}
                  />
                </div>
              )}
              <div className="flex justify-between items-center">
                <Text type="secondary">Liều lượng:</Text>
                <Text strong>{selectedMedicine.dosage}</Text>
              </div>
              <div className="flex justify-between items-center">
                <Text type="secondary">Tần suất:</Text>
                <Text strong>
                  {frequencyLabel[selectedMedicine.frequency] ||
                    selectedMedicine.frequency}
                </Text>
              </div>
              {selectedMedicine.startDate && selectedMedicine.endDate && (
                <div className="flex justify-between items-center">
                  <Text type="secondary">Thời gian:</Text>
                  <Text strong>
                    {dayjs(selectedMedicine.startDate).format("DD/MM/YYYY")} -{" "}
                    {dayjs(selectedMedicine.endDate).format("DD/MM/YYYY")}
                  </Text>
                </div>
              )}
              {selectedMedicine.instructions && (
                <div>
                  <Text type="secondary">Hướng dẫn sử dụng:</Text>
                  <div className="mt-1 p-2 bg-gray-50 rounded-lg">
                    <Text>{selectedMedicine.instructions}</Text>
                  </div>
                </div>
              )}
              {selectedMedicine.description && (
                <div>
                  <Text type="secondary">Mô tả:</Text>
                  <div className="mt-1 p-2 bg-gray-50 rounded-lg">
                    <Text>{selectedMedicine.description}</Text>
                  </div>
                </div>
              )}
              <div className="flex justify-between items-center">
                <Text type="secondary">Đơn vị:</Text>
                <Text strong>{selectedMedicine.unit}</Text>
              </div>
              <div className="flex justify-between items-center">
                <Text type="secondary">Số lượng:</Text>
                <Text strong>
                  {selectedMedicine.medication?.stockQuantity ?? "-"}
                </Text>
              </div>
              <div className="flex justify-between items-center">
                <Text type="secondary">Trạng thái:</Text>
                <Tag color={statusColor[selectedMedicine.status]}>
                  {statusLabel[selectedMedicine.status]}
                </Tag>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default MedicineInfo;
