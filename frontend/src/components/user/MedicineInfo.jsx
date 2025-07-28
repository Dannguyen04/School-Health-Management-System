import {
  CheckCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  MedicineBoxOutlined,
  PlusOutlined,
  UploadOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Button,
  Card,
  Checkbox,
  DatePicker,
  Empty,
  Form,
  Image,
  Input,
  InputNumber,
  message,
  Modal,
  Progress,
  Radio,
  Select,
  Spin,
  Steps,
  Tag,
  TimePicker,
  Tooltip,
  Typography,
  Upload,
} from "antd";
import axios from "axios";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import { useEffect, useState } from "react";
import * as Yup from "yup";
dayjs.extend(isSameOrAfter);

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Search } = Input;
const { Dragger } = Upload;
const { Step } = Steps;

// Tạo schema riêng cho từng bước
const step1Schema = Yup.object().shape({
  medicationName: Yup.string()
    .required("Vui lòng nhập tên thuốc")
    .min(2, "Tên thuốc phải có ít nhất 2 ký tự")
    .matches(/^[\p{L}\s]+$/u, "Tên chỉ được chứa chữ cái và khoảng trắng"),
  medicationType: Yup.string()
    .required("Vui lòng chọn loại thuốc")
    .min(2, "Tên thuốc phải có ít nhất 2 ký tự")
    .matches(/^[\p{L}\s]+$/u, "Tên chỉ được chứa chữ cái và khoảng trắng"),
  medicationTypeDetail: Yup.string().when("medicationType", {
    is: (val) => val === "khac",
    then: (schema) =>
      schema
        .required("Vui lòng nhập loại thuốc cụ thể")
        .min(3, "Loại thuốc phải có ít nhất 3 ký tự"),
    otherwise: (schema) => schema,
  }),
  stockQuantity: Yup.number()
    .typeError("Vui lòng nhập số lượng")
    .min(1, "Số lượng phải lớn hơn 0")
    .required("Vui lòng nhập số lượng"),
});
const step2Schema = Yup.object().shape({
  dosage: Yup.string().required("Vui lòng nhập liều lượng"),
  unit: Yup.string()
    .required("Vui lòng chọn đơn vị")
    .min(2, "Tên thuốc phải có ít nhất 2 ký tự")
    .matches(/^[\p{L}\s]+$/u, "Tên chỉ được chứa chữ cái và khoảng trắng"),
  frequency: Yup.string().required("Vui lòng chọn tần suất sử dụng"),
  customTimes: Yup.array().when("frequency", {
    is: (val) => val !== "as-needed",
    then: (schema) =>
      schema
        .of(Yup.string().required("Vui lòng nhập giờ uống"))
        .min(1, "Vui lòng nhập ít nhất 1 giờ uống")
        .test(
          "is-working-hour",
          "Giờ uống thuốc chỉ được phép trong giờ hành chính (07:00 - 17:00)",
          (times) => {
            if (!times) return true;
            return times.every((t) => {
              if (!t) return false;
              const [h, m] = t.split(":").map(Number);
              if (isNaN(h) || isNaN(m)) return false;
              return h >= 7 && (h < 17 || (h === 17 && m === 0));
            });
          }
        ),
    otherwise: (schema) => schema,
  }),
  startDate: Yup.mixed()
    .required("Vui lòng chọn ngày bắt đầu")
    .test("not-in-past", "Ngày bắt đầu không được ở quá khứ", (value) => {
      if (!value) return false;
      const today = dayjs().startOf("day");
      const start = dayjs(value).startOf("day");
      return start.isSameOrAfter(today);
    }),
  endDate: Yup.mixed()
    .required("Vui lòng chọn ngày kết thúc")
    .test(
      "end-after-start",
      "Ngày kết thúc phải sau hoặc bằng ngày bắt đầu",
      function (value) {
        const { startDate } = this.parent;
        if (!value || !startDate) return false;
        const start = dayjs(startDate).startOf("day");
        const end = dayjs(value).startOf("day");
        return end.isSameOrAfter(start);
      }
    ),
});
const step3Schema = Yup.object().shape({
  instructions: Yup.string()
    .min(2, "Tên thuốc phải có ít nhất 2 ký tự")
    .matches(/^[\p{L}\s]+$/u, "Tên chỉ được chứa chữ cái và khoảng trắng"),
});
const step4Schema = Yup.object().shape({
  agreeConfirm: Yup.boolean().oneOf([true], "Bạn phải xác nhận thông tin"),
  agreeTerms: Yup.boolean().oneOf(
    [true],
    "Bạn phải chấp nhận tự chịu trách nhiệm với các phản ứng không mong muốn"
  ),
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
  DELIVERED: "Đã gửi thuốc",
  RECEIVED: "Y tá đã nhận",
  SCHEDULED: "Đã lên lịch",
};

const frequencyLabel = {
  "as-needed": "Khi cần",
  daily: "Hàng ngày",
  twice: "2 lần/ngày",
  three: "3 lần/ngày",
  four: "4 lần/ngày",
  once: "1 lần/ngày",
};

const unitLabel = {
  vien: "viên",
  ml: "ml",
  mg: "mg",
  khac: "Khác",
};

const usageNoteLabel = {
  "before-meal": "Uống trước ăn",
  "after-meal": "Uống sau ăn",
  "with-food": "Uống cùng thức ăn",
  "empty-stomach": "Uống lúc đói",
  other: "Khác",
};

const MedicineInfo = () => {
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [children, setChildren] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentMedicines, setStudentMedicines] = useState([]);
  const [loadingMedicines, setLoadingMedicines] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [prescriptionImage, setPrescriptionImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageError, setImageError] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const [multiStepData, setMultiStepData] = useState({
    studentId: selectedStudent,
    studentName: "",
    className: "",
    medicationName: "",
    medicationType: "",
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
    prescriptionImage: null,
    agreeConfirm: false,
    agreeTerms: false,
    stockQuantity: 1,
  });
  const [pendingMedicines, setPendingMedicines] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  // Khôi phục các biến/hàm cần thiết đã bị xóa nhầm
  const [filteredMedicines, setFilteredMedicines] = useState([]);
  // Đảm bảo frequencyToTimes được định nghĩa
  const frequencyToTimes = {
    once: 1,
    twice: 2,
    three: 3,
    "6h": 4,
  };

  // Xóa setSearchText nếu không dùng đến
  const [searchText] = useState("");

  // Hàm lọc danh sách thuốc (khôi phục logic getFilteredMedicines)
  useEffect(() => {
    let filtered = Array.isArray(studentMedicines) ? studentMedicines : [];
    if (searchText) {
      filtered = filtered.filter(
        (medicine) =>
          medicine.medicationName
            ?.toLowerCase()
            .includes(searchText.toLowerCase()) ||
          medicine.dosage?.toLowerCase().includes(searchText.toLowerCase()) ||
          medicine.instructions
            ?.toLowerCase()
            .includes(searchText.toLowerCase())
      );
    }
    setFilteredMedicines(filtered);
  }, [studentMedicines, searchText]);

  // Khôi phục các hàm bị xóa nhầm
  const handleMedicineClick = (medicine) => {
    setSelectedMedicine(medicine);
    setDetailModalOpen(true);
  };
  const handleEditPendingMedicine = (idx) => {
    const med = pendingMedicines[idx];
    setMultiStepData(med);
    setEditIndex(idx);
    setShowForm(true);
    setCurrentStep(1);
  };
  const handleRemovePendingMedicine = (idx) => {
    setPendingMedicines((list) => list.filter((_, i) => i !== idx));
  };
  const handleSaveMedicine = () => {
    if (!multiStepData.studentId || multiStepData.studentId === "null") {
      message.error("Vui lòng chọn học sinh!");
      return;
    }
    if (
      !multiStepData.medicationName ||
      !multiStepData.medicationType ||
      !multiStepData.dosage ||
      !multiStepData.frequency ||
      !multiStepData.unit ||
      !multiStepData.startDate
    ) {
      message.error("Vui lòng nhập đầy đủ thông tin bắt buộc!");
      return;
    }
    if (!multiStepData.stockQuantity || multiStepData.stockQuantity < 1) {
      message.error("Vui lòng nhập số lượng thuốc hợp lệ!");
      return;
    }
    const medicineData = { ...multiStepData, prescriptionImage };
    if (editIndex !== null) {
      setPendingMedicines((list) =>
        list.map((item, idx) => (idx === editIndex ? medicineData : item))
      );
    } else {
      setPendingMedicines((list) => [...list, medicineData]);
    }
    setShowForm(false);
    setEditIndex(null);
    setCurrentStep(1);
    setPrescriptionImage(null);
    setImagePreview(null);
    setImageError("");
    message.success("Đã lưu thuốc vào danh sách!");
  };

  // 5. Gom reset state
  const resetFormState = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setIsEditModalVisible(false);
    setShowForm(false);
    setEditIndex(null);
    setPendingMedicines([]);
    setCurrentStep(0);
    setFieldErrors({});
    setPrescriptionImage(null);
    setImagePreview(null);
    setImageError("");
  };

  // Định nghĩa fetchChildren và fetchStudentMedicines là các hàm thường, không dùng useCallback
  const fetchChildren = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/parents/my-children", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setChildren(response.data.data);
        if (response.data.data.length > 0) {
          setSelectedStudent(response.data.data[0].studentId);
          setMultiStepData((d) => ({
            ...d,
            studentId: response.data.data[0].studentId,
          }));
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
        const mapped = (response.data.data || []).map((item) => ({
          id: item.id,
          medicationName: item.name || "",
          medicationType: item.type || "",
          description: item.description || "",
          dosage: item.dosage || "",
          unit: unitLabel[item.unit] || item.unit || "",
          frequency: frequencyLabel[item.frequency] || item.frequency || "",
          instructions: item.instructions || "",
          status: item.status,
          statusLabel: statusLabel[item.status] || item.status,
          startDate: item.startDate,
          endDate: item.endDate,
          // Đảm bảo lấy đúng trường số lượng thuốc
          stockQuantity:
            item.stockQuantity !== undefined
              ? item.stockQuantity
              : item.quantity !== undefined
              ? item.quantity
              : "",
          usageNote: item.usageNote || "",
          image: item.image || "",
          prescriptionImage: item.prescriptionImage || "",
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        }));
        setStudentMedicines(mapped);
      } else {
        setStudentMedicines([]);
      }
    } catch {
      setStudentMedicines([]);
      message.error("Không thể lấy danh sách thuốc");
    } finally {
      setLoadingMedicines(false);
    }
  };

  const handleStudentChange = (studentId) => {
    setSelectedStudent(studentId);
    setMultiStepData((d) => ({ ...d, studentId }));
  };

  // Gửi tất cả thuốc trong danh sách tạm
  const handleSendAllMedicines = async () => {
    if (pendingMedicines.length === 0) return;
    setLoading(true);
    let successCount = 0;
    let failCount = 0;
    for (const med of pendingMedicines) {
      try {
        const token = localStorage.getItem("token");
        const formData = new FormData();
        formData.append("medicationName", med.medicationName);
        formData.append("medicationType", med.medicationType);
        formData.append("type", med.medicationType);
        formData.append("dosage", med.dosage);
        formData.append("frequency", med.frequency);
        formData.append("instructions", med.instructions);
        formData.append(
          "startDate",
          med.startDate ? med.startDate.toISOString() : ""
        );
        formData.append(
          "endDate",
          med.endDate ? med.endDate.toISOString() : ""
        );
        formData.append("description", med.description || "");
        formData.append("unit", med.unit || "");
        formData.append("stockQuantity", med.stockQuantity);
        formData.append("usageNote", med.usageNote || "");
        formData.append("customTimes", JSON.stringify(med.customTimes || []));
        if (med.prescriptionImage) {
          formData.append("medicineImage", med.prescriptionImage);
        }
        await axios.post(
          `/api/parents/request-medication/${med.studentId}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        successCount++;
      } catch (error) {
        failCount++;
      }
    }
    setLoading(false);
    setPendingMedicines([]);
    setMultiStepData((d) => ({
      ...d,
      medicationName: "",
      medicationType: "",
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
      prescriptionImage: null,
      agreeConfirm: false,
      agreeTerms: false,
      stockQuantity: 1,
    }));
    setCurrentStep(5);
    if (successCount > 0) {
      message.success(`Đã gửi thành công ${successCount} thuốc!`);
      fetchStudentMedicines(selectedStudent);
      setShowForm(true); // Đảm bảo render step 5
      setCurrentStep(5); // Hiện báo cáo thành công
    }
    if (failCount > 0) message.error(`Có ${failCount} thuốc gửi thất bại!`);
  };
  // Hàm validate cho từng bước
  const handleNextStep = async () => {
    try {
      await step1Schema.validate(multiStepData, { abortEarly: false });
      setFieldErrors({});
      setCurrentStep(2);
    } catch (err) {
      if (err.inner) {
        const errors = {};
        err.inner.forEach((e) => {
          errors[e.path] = e.message;
        });
        setFieldErrors(errors);
      }
    }
  };
  const handleNextStep2 = async () => {
    try {
      console.log("Step 2 multiStepData:", multiStepData);
      await step2Schema.validate(multiStepData, { abortEarly: false });
      setFieldErrors({});
      setCurrentStep(3);
      console.log("Step 2 passed, moving to step 3");
    } catch (err) {
      console.log("Step 2 catch error:", err, err.message);

      if (err.inner) {
        const errors = {};
        err.inner.forEach((e) => {
          errors[e.path] = e.message;
        });
        setFieldErrors(errors);
        console.log(errors);
      } else {
        setFieldErrors({
          unknown: err.message || "Lỗi không xác định",
        });
      }
    }
  };
  const handleNextStep3 = async () => {
    try {
      await step3Schema.validate(multiStepData, { abortEarly: false });
      setFieldErrors({});
      setCurrentStep(4);
    } catch (err) {
      if (err.inner) {
        const errors = {};
        err.inner.forEach((e) => {
          errors[e.path] = e.message;
        });
        setFieldErrors(errors);
      }
    }
  };
  const handleNextStep4 = async () => {
    try {
      await step4Schema.validate(multiStepData, { abortEarly: false });
      setFieldErrors({});
      // Tiếp tục logic lưu thuốc hoặc gửi thuốc ở đây
      handleSaveMedicine();
    } catch (err) {
      if (err.inner) {
        const errors = {};
        err.inner.forEach((e) => {
          errors[e.path] = e.message;
        });
        setFieldErrors(errors);
      }
    }
  };

  // Đảm bảo các hàm sau được định nghĩa đúng vị trí nếu chưa có
  // handleAddNewMedicine
  const handleAddNewMedicine = () => {
    setMultiStepData((d) => ({
      ...d,
      medicationName: "",
      medicationType: "",
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
      prescriptionImage: null,
      agreeConfirm: false,
      agreeTerms: false,
      stockQuantity: 1,
    }));
    setEditIndex(null);
    setShowForm(true);
    setCurrentStep(1);
  };
  // handleSendAllMedicines đã có ở trên
  // handleRemoveImage
  const handleRemoveImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setPrescriptionImage(null);
    setImagePreview(null);
    setImageError("");
  };
  // handleAddAnotherMedicine
  const handleAddAnotherMedicine = () => {
    resetFormState();
    setTimeout(() => {
      setIsEditModalVisible(true);
      setShowForm(true);
    }, 100);
  };

  useEffect(() => {
    fetchChildren();
  }, []);

  useEffect(() => {
    if (selectedStudent) {
      fetchStudentMedicines(selectedStudent);
    }
  }, [selectedStudent]);

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
                  style={{ width: 320, minWidth: 220 }}
                  dropdownStyle={{
                    borderRadius: 18,
                    boxShadow: "0 8px 32px rgba(54, 174, 154, 0.15)",
                  }}
                  dropdownClassName="custom-student-dropdown"
                  value={selectedStudent}
                  onChange={handleStudentChange}
                  placeholder="Chọn học sinh"
                  size="large"
                >
                  {children.map((child) => (
                    <Select.Option
                      key={child.studentId}
                      value={child.studentId}
                      className="!py-3 !px-5 !text-lg hover:bg-[#e8f5f2]"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                      }}
                    >
                      <span className="font-semibold text-gray-800 truncate max-w-[140px]">
                        {child.fullName} - {child.class}
                      </span>
                    </Select.Option>
                  ))}
                </Select>
              ) : (
                <Text type="secondary">Không có học sinh nào</Text>
              )}
            </div>
          </div>
        </Card>

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
                    onClick={() => {
                      setIsEditModalVisible(true);
                      setShowForm(true);
                      setCurrentStep(0); // Luôn về màn hình chào mừng
                      setEditIndex(null);
                      setMultiStepData({
                        ...multiStepData /* reset fields nếu cần */,
                      });
                      setFieldErrors({});
                    }}
                    className="bg-[#36ae9a] hover:bg-[#2a8a7a] border-[#36ae9a]"
                  >
                    Gửi thuốc cho học sinh
                  </Button>
                </div>
                {/* XÓA các tab, badge, filter, tag, hoặc logic liên quan đến 'Sắp hết hạn' (expiring) trong danh sách thuốc */}
                {loadingMedicines ? (
                  <Spin />
                ) : studentMedicines.length === 0 ? (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={
                      <span>
                        {searchText
                          ? "Không tìm thấy thuốc phù hợp"
                          : "Chưa có thông tin thuốc nào"}
                      </span>
                    }
                  >
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => {
                        setIsEditModalVisible(true);
                        setShowForm(true);
                        setCurrentStep(0); // Mở step 0 (welcome)
                        setEditIndex(null);
                        setMultiStepData({
                          ...multiStepData,
                        });
                        setFieldErrors({});
                      }}
                      className="bg-[#36ae9a] hover:bg-[#2a8a7a] border-[#36ae9a]"
                    >
                      Gửi thuốc cho học sinh
                    </Button>
                  </Empty>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                    {filteredMedicines.map((medicine) => {
                      // const isExpiring =
                      //   medicine.endDate &&
                      //   dayjs(medicine.endDate).diff(dayjs(), "day") <= 7;
                      // const isExpired =
                      //   medicine.endDate &&
                      //   dayjs(medicine.endDate).diff(dayjs(), "day") < 0;

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
                                {medicine.medicationName || "Không có tên"}
                              </Title>
                              <Tag
                                color={statusColor[medicine.status]}
                                className="mb-2"
                              >
                                {statusLabel[medicine.status]}
                              </Tag>
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
          onCancel={resetFormState}
          footer={null}
          width={500}
          centered
        >
          {/* Nếu showForm = false: chỉ hiện danh sách thuốc và nút thêm mới */}
          {!showForm && (
            <div style={{ padding: 24 }}>
              <Typography.Title
                level={4}
                style={{
                  textAlign: "center",
                  marginBottom: 24,
                }}
              >
                <MedicineBoxOutlined
                  style={{ color: "#36ae9a", marginRight: 8 }}
                />
                Danh sách thuốc cần gửi
              </Typography.Title>
              {pendingMedicines.length === 0 ? (
                <div style={{ textAlign: "center", padding: 32 }}>
                  <MedicineBoxOutlined
                    style={{
                      fontSize: 64,
                      color: "#e0e0e0",
                      marginBottom: 16,
                    }}
                  />
                  <div
                    style={{
                      color: "#888",
                      fontSize: 18,
                      marginBottom: 16,
                    }}
                  >
                    Chưa có thuốc nào, hãy thêm thuốc mới
                  </div>
                </div>
              ) : (
                <div style={{ marginBottom: 32 }}>
                  {pendingMedicines.map((med, idx) => (
                    <Card
                      key={idx}
                      style={{
                        borderRadius: 16,
                        boxShadow: "0 2px 8px #e0e0e0",
                        marginBottom: 20,
                        padding: 0,
                        transition: "box-shadow 0.2s",
                        cursor: "pointer",
                      }}
                      bodyStyle={{ padding: 16 }}
                      hoverable
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <MedicineBoxOutlined
                            style={{
                              color: "#36ae9a",
                              fontSize: 28,
                              marginRight: 16,
                            }}
                          />
                          <div>
                            <div
                              style={{
                                fontWeight: 700,
                                fontSize: 17,
                                marginBottom: 2,
                              }}
                            >
                              {med.medicationName}
                            </div>
                            <div
                              style={{
                                color: "#888",
                                fontSize: 15,
                              }}
                            >
                              {med.dosage} {med.unit} -{" "}
                              {frequencyLabel[med.frequency] || med.frequency}
                            </div>
                          </div>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            gap: 12,
                          }}
                        >
                          <Tooltip title="Sửa">
                            <Button
                              icon={<EditOutlined />}
                              shape="circle"
                              onClick={() => handleEditPendingMedicine(idx)}
                            />
                          </Tooltip>
                          <Tooltip title="Xóa">
                            <Button
                              icon={<DeleteOutlined />}
                              shape="circle"
                              danger
                              onClick={() => handleRemovePendingMedicine(idx)}
                            />
                          </Tooltip>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
              <Button
                type="primary"
                icon={<PlusOutlined />}
                block
                size="large"
                style={{
                  margin: "0 0 18px 0",
                  fontWeight: 600,
                  borderRadius: 24,
                  fontSize: 17,
                  height: 48,
                  background: "#36ae9a",
                  borderColor: "#36ae9a",
                }}
                onClick={handleAddNewMedicine}
              >
                Thêm thuốc mới
              </Button>
              {pendingMedicines.length > 0 && (
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  block
                  size="large"
                  style={{
                    background: "#36ae9a",
                    borderColor: "#36ae9a",
                    fontWeight: 600,
                    borderRadius: 24,
                    fontSize: 17,
                    height: 48,
                  }}
                  onClick={handleSendAllMedicines}
                >
                  Xác nhận tất cả thuốc và gửi
                </Button>
              )}
            </div>
          )}
          {/* Nếu showForm = true: hiện multi-step form nhập thuốc */}
          {showForm && (
            <div>
              {pendingMedicines.length > 0 && (
                <Button
                  type="link"
                  onClick={() => {
                    setShowForm(false);
                    setEditIndex(null);
                    setCurrentStep(0);
                    setFieldErrors({});
                    setPrescriptionImage(null);
                    setImagePreview(null);
                    setImageError("");
                  }}
                  style={{ marginBottom: 12 }}
                >
                  ← Quay lại danh sách thuốc cần gửi
                </Button>
              )}
              {/* STEP 0: Welcome */}
              {currentStep === 0 && (
                <div style={{ textAlign: "center", padding: 24 }}>
                  <div
                    style={{
                      fontSize: 28,
                      fontWeight: 700,
                      marginBottom: 8,
                    }}
                  >
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
                      <div
                        style={{
                          fontWeight: 500,
                          marginTop: 8,
                        }}
                      >
                        THÔNG TIN THUỐC
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      color: "#555",
                      marginBottom: 8,
                    }}
                  >
                    Giúp con bạn uống thuốc đúng cách và an toàn tại trường
                  </div>
                  <div
                    style={{
                      color: "#888",
                      fontSize: 15,
                      marginBottom: 16,
                    }}
                  >
                    ⏱️ Chỉ mất 3-5 phút
                    <br />
                    📋 4 bước đơn giản
                    <br />
                  </div>
                  <Button
                    type="primary"
                    size="large"
                    style={{
                      width: 220,
                      fontWeight: 600,
                      background: "#36ae9a",
                      borderColor: "#36ae9a",
                      borderRadius: 8,
                    }}
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
                      style={{
                        padding: 0,
                        marginRight: 8,
                      }}
                    >
                      &larr;
                    </Button>
                    <b>Thông tin cơ bản</b>
                    <Tooltip title="Nhập thông tin thuốc">
                      <span
                        style={{
                          marginLeft: 8,
                          color: "#888",
                        }}
                      >
                        ?
                      </span>
                    </Tooltip>
                    <div style={{ flex: 1 }} />
                    <span
                      style={{
                        color: "#36ae9a",
                        fontWeight: 500,
                      }}
                    >
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
                    <Form.Item
                      label="Tên thuốc"
                      required
                      validateStatus={fieldErrors.medicationName ? "error" : ""}
                      help={fieldErrors.medicationName}
                    >
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
                    <Form.Item
                      label="Loại thuốc"
                      required
                      validateStatus={fieldErrors.medicationType ? "error" : ""}
                      help={fieldErrors.medicationType}
                    >
                      <Input
                        value={multiStepData.medicationType}
                        onChange={(e) =>
                          setMultiStepData((d) => ({
                            ...d,
                            medicationType: e.target.value,
                          }))
                        }
                        placeholder="Gợi ý: Thuốc giảm đau, thực phẩm bổ sung,..."
                      />
                    </Form.Item>
                    <Form.Item
                      label="Số lượng thuốc sẽ gửi"
                      required
                      validateStatus={fieldErrors.stockQuantity ? "error" : ""}
                      help={fieldErrors.stockQuantity}
                    >
                      <InputNumber
                        min={1}
                        value={multiStepData.stockQuantity}
                        onChange={(value) =>
                          setMultiStepData((d) => ({
                            ...d,
                            stockQuantity: value,
                          }))
                        }
                        placeholder="Nhập số lượng thuốc gửi"
                        style={{ width: "100%" }}
                      />
                    </Form.Item>
                    <Button
                      type="primary"
                      block
                      onClick={handleNextStep}
                      style={{
                        height: 40,
                        borderRadius: 8,
                        fontSize: 14,
                        fontWeight: 600,
                        background: "#36ae9a",
                        borderColor: "#36ae9a",
                        marginTop: 8,
                      }}
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
                      style={{
                        padding: 0,
                        marginRight: 8,
                      }}
                    >
                      &larr;
                    </Button>
                    <b>Liều lượng & Thời gian</b>
                    <Tooltip title="Thiết lập cách uống thuốc cho học sinh">
                      <span
                        style={{
                          marginLeft: 8,
                          color: "#888",
                        }}
                      >
                        ?
                      </span>
                    </Tooltip>
                    <div style={{ flex: 1 }} />
                    <span
                      style={{
                        color: "#36ae9a",
                        fontWeight: 500,
                      }}
                    >
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
                    {/* Liều lượng & Đơn vị */}
                    <div
                      style={{
                        background: "#f8fffe",
                        borderRadius: 12,
                        padding: 20,
                        marginBottom: 20,
                        border: "1px solid #e8f5f2",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          marginBottom: 8,
                        }}
                      >
                        <div
                          style={{
                            background: "#36ae9a",
                            color: "white",
                            width: 20,
                            height: 20,
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginRight: 6,
                            fontSize: 10,
                            fontWeight: 600,
                          }}
                        >
                          1
                        </div>
                        <div
                          style={{
                            fontSize: 14,
                            fontWeight: 600,
                            color: "#333",
                          }}
                        >
                          Liều lượng cho một lần sử dụng
                        </div>
                      </div>

                      <Form.Item
                        required
                        validateStatus={fieldErrors.dosage ? "error" : ""}
                        help={fieldErrors.dosage}
                        style={{ marginBottom: 6 }}
                      >
                        <div
                          style={{
                            display: "flex",
                            gap: 6,
                            alignItems: "flex-end",
                          }}
                        >
                          <div>
                            <div
                              style={{
                                fontSize: 11,
                                color: "#666",
                                marginBottom: 2,
                              }}
                            >
                              Số lượng
                            </div>
                            <Input
                              type="number"
                              min={1}
                              step={0.1}
                              value={multiStepData.dosage}
                              onChange={(e) => {
                                const val = e.target.value.replace(
                                  /[^\d.]/g,
                                  ""
                                );
                                setMultiStepData((d) => ({
                                  ...d,
                                  dosage: val,
                                }));
                              }}
                              placeholder="VD: 250"
                              style={{
                                height: 32,
                                borderRadius: 4,
                                border: "1px solid #d9d9d9",
                              }}
                            />
                          </div>
                          <div>
                            <div
                              style={{
                                fontSize: 11,
                                color: "#666",
                                marginBottom: 2,
                              }}
                            >
                              Đơn vị
                            </div>
                            <Input
                              value={multiStepData.unit}
                              onChange={(e) =>
                                setMultiStepData((d) => ({
                                  ...d,
                                  unit: e.target.value,
                                }))
                              }
                              placeholder="Gợi ý: viên, mg, ml,..."
                            />
                          </div>
                        </div>

                        {multiStepData.unit === "khac" && (
                          <div style={{ marginTop: 6 }}>
                            <Input
                              value={multiStepData.unitDetail || ""}
                              onChange={(e) =>
                                setMultiStepData((d) => ({
                                  ...d,
                                  unitDetail: e.target.value,
                                }))
                              }
                              placeholder="Nhập đơn vị cụ thể"
                              style={{
                                height: 32,
                                borderRadius: 4,
                                border: "1px solid #d9d9d9",
                              }}
                            />
                          </div>
                        )}
                      </Form.Item>
                    </div>

                    {/* Tần suất sử dụng */}
                    <div
                      style={{
                        background: "#f8fffe",
                        borderRadius: 12,
                        padding: 20,
                        marginBottom: 20,
                        border: "1px solid #e8f5f2",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          marginBottom: 8,
                        }}
                      >
                        <div
                          style={{
                            background: "#36ae9a",
                            color: "white",
                            width: 20,
                            height: 20,
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginRight: 6,
                            fontSize: 10,
                            fontWeight: 600,
                          }}
                        >
                          2
                        </div>
                        <div
                          style={{
                            fontSize: 14,
                            fontWeight: 600,
                            color: "#333",
                          }}
                        >
                          Tần suất sử dụng
                        </div>
                      </div>

                      <Form.Item
                        required
                        validateStatus={fieldErrors.frequency ? "error" : ""}
                        help={fieldErrors.frequency}
                        style={{ marginBottom: 0 }}
                      >
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
                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 6,
                              width: "100%",
                            }}
                          >
                            {[
                              { value: "once", label: "Ngày 1 lần" },
                              { value: "twice", label: "Ngày 2 lần" },
                              { value: "three", label: "Ngày 3 lần" },
                              { value: "as-needed", label: "Khi cần" },
                              { value: "custom", label: "Tùy chỉnh..." },
                            ].map((option) => (
                              <div
                                key={option.value}
                                style={{
                                  border:
                                    multiStepData.frequency === option.value
                                      ? "2px solid #36ae9a"
                                      : "1px solid #e8e8e8",
                                  borderRadius: 6,
                                  padding: "8px 6px",
                                  cursor: "pointer",
                                  background:
                                    multiStepData.frequency === option.value
                                      ? "#f0fdfa"
                                      : "white",
                                  transition: "all 0.2s ease",
                                  textAlign: "center",
                                  minHeight: "32px",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flex: "1 1 0",
                                  minWidth: "100px",
                                }}
                                onClick={() => {
                                  const freq = option.value;
                                  let newTimes =
                                    multiStepData.customTimes || [];
                                  if (
                                    freq !== "custom" &&
                                    freq !== "as-needed"
                                  ) {
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
                                <Radio
                                  value={option.value}
                                  style={{ display: "none" }}
                                />
                                <span
                                  style={{
                                    fontWeight:
                                      multiStepData.frequency === option.value
                                        ? 600
                                        : 400,
                                    color:
                                      multiStepData.frequency === option.value
                                        ? "#36ae9a"
                                        : "#333",
                                    fontSize: 11,
                                    lineHeight: 1.2,
                                  }}
                                >
                                  {option.label}
                                </span>
                              </div>
                            ))}
                          </div>
                        </Radio.Group>
                      </Form.Item>
                    </div>

                    {/* Giờ uống cụ thể */}
                    {multiStepData.frequency !== "as-needed" && (
                      <div
                        style={{
                          background: "#f8fffe",
                          borderRadius: 12,
                          padding: 20,
                          marginBottom: 20,
                          border: "1px solid #e8f5f2",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            marginBottom: 12,
                          }}
                        >
                          <div
                            style={{
                              background: "#36ae9a",
                              color: "white",
                              width: 20,
                              height: 20,
                              borderRadius: "50%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              marginRight: 6,
                              fontSize: 10,
                              fontWeight: 600,
                            }}
                          >
                            3
                          </div>
                          <div
                            style={{
                              fontSize: 14,
                              fontWeight: 600,
                              color: "#333",
                            }}
                          >
                            Giờ uống cụ thể
                          </div>
                        </div>

                        <Form.Item
                          required
                          validateStatus={
                            fieldErrors.customTimes
                              ? "error"
                              : (multiStepData.customTimes || []).some(
                                  (t) => !t
                                )
                              ? "error"
                              : ""
                          }
                          help={
                            fieldErrors.customTimes ||
                            ((multiStepData.customTimes || []).some((t) => !t)
                              ? "Vui lòng nhập đủ giờ uống cho từng lần"
                              : undefined)
                          }
                          style={{ marginBottom: 0 }}
                        >
                          <div style={{ display: "grid", gap: 4 }}>
                            {(multiStepData.customTimes || []).map(
                              (time, idx) => (
                                <div
                                  key={idx}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 6,
                                    padding: 6,
                                    background: "white",
                                    borderRadius: 4,
                                    border: "1px solid #e8e8e8",
                                  }}
                                >
                                  <div
                                    style={{
                                      background: "#36ae9a",
                                      color: "white",
                                      width: 16,
                                      height: 16,
                                      borderRadius: "50%",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      fontSize: 9,
                                      fontWeight: 600,
                                    }}
                                  >
                                    {idx + 1}
                                  </div>
                                  <TimePicker
                                    format="HH:mm"
                                    value={time ? dayjs(time, "HH:mm") : null}
                                    onChange={(value) => {
                                      const newTimes = [
                                        ...multiStepData.customTimes,
                                      ];
                                      newTimes[idx] = value
                                        ? value.format("HH:mm")
                                        : "";
                                      setMultiStepData((d) => ({
                                        ...d,
                                        customTimes: newTimes,
                                      }));
                                    }}
                                    placeholder="Chọn giờ"
                                    style={{
                                      width: 80,
                                      borderRadius: 4,
                                    }}
                                  />
                                  {multiStepData.frequency === "custom" && (
                                    <Button
                                      size="small"
                                      danger
                                      type="text"
                                      icon={<DeleteOutlined />}
                                      onClick={() => {
                                        const newTimes = [
                                          ...multiStepData.customTimes,
                                        ];
                                        newTimes.splice(idx, 1);
                                        setMultiStepData((d) => ({
                                          ...d,
                                          customTimes: newTimes,
                                        }));
                                      }}
                                      style={{
                                        marginLeft: "auto",
                                        padding: "0 4px",
                                      }}
                                    />
                                  )}
                                </div>
                              )
                            )}

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
                                style={{
                                  height: 28,
                                  borderRadius: 4,
                                  border: "1px dashed #d9d9d9",
                                  color: "#666",
                                  fontSize: 11,
                                }}
                              >
                                Thêm lần uống
                              </Button>
                            )}
                          </div>
                        </Form.Item>
                      </div>
                    )}

                    {/* Thời gian sử dụng */}
                    <div
                      style={{
                        background: "#f8fffe",
                        borderRadius: 12,
                        padding: 20,
                        marginBottom: 20,
                        border: "1px solid #e8f5f2",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          marginBottom: 8,
                        }}
                      >
                        <div
                          style={{
                            background: "#36ae9a",
                            color: "white",
                            width: 20,
                            height: 20,
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginRight: 6,
                            fontSize: 10,
                            fontWeight: 600,
                          }}
                        >
                          {multiStepData.frequency === "as-needed" ? 3 : 4}
                        </div>
                        <div
                          style={{
                            fontSize: 14,
                            fontWeight: 600,
                            color: "#333",
                          }}
                        >
                          Thời gian sử dụng
                        </div>
                      </div>

                      <Form.Item
                        required
                        validateStatus={
                          fieldErrors.startDate || fieldErrors.endDate
                            ? "error"
                            : ""
                        }
                        help={fieldErrors.startDate || fieldErrors.endDate}
                        style={{ marginBottom: 0 }}
                      >
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
                          style={{
                            width: "100%",
                            height: 32,
                            borderRadius: 4,
                          }}
                          format="DD/MM/YYYY"
                          placeholder={["Ngày bắt đầu", "Ngày kết thúc"]}
                        />

                        {multiStepData.startDate && multiStepData.endDate && (
                          <div
                            style={{
                              marginTop: 6,
                              padding: 4,
                              background: "#e8f5f2",
                              borderRadius: 3,
                              textAlign: "center",
                              color: "#36ae9a",
                              fontSize: 11,
                              fontWeight: 500,
                            }}
                          >
                            📅 Tổng cộng:{" "}
                            {multiStepData.endDate.diff(
                              multiStepData.startDate,
                              "day"
                            ) + 1}{" "}
                            ngày
                          </div>
                        )}
                      </Form.Item>
                    </div>

                    <Button
                      type="primary"
                      block
                      size="large"
                      onClick={handleNextStep2}
                      disabled={
                        !(
                          multiStepData.dosage &&
                          multiStepData.unit &&
                          multiStepData.frequency &&
                          multiStepData.startDate &&
                          multiStepData.endDate &&
                          (multiStepData.frequency === "as-needed" ||
                            ((multiStepData.customTimes || []).length > 0 &&
                              (multiStepData.customTimes || []).every(
                                (t) => !!t
                              )))
                        )
                      }
                      style={{
                        height: 40,
                        borderRadius: 8,
                        fontSize: 14,
                        fontWeight: 600,
                        background: "#36ae9a",
                        borderColor: "#36ae9a",
                        marginTop: 8,
                      }}
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
                      style={{
                        padding: 0,
                        marginRight: 8,
                      }}
                    >
                      &larr;
                    </Button>
                    <b>Hướng dẫn sử dụng</b>
                    <Tooltip title="Cách dùng, lưu ý, liên hệ">
                      <span
                        style={{
                          marginLeft: 8,
                          color: "#888",
                        }}
                      >
                        ?
                      </span>
                    </Tooltip>
                    <div style={{ flex: 1 }} />
                    <span
                      style={{
                        color: "#36ae9a",
                        fontWeight: 500,
                      }}
                    >
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
                    <Button
                      type="primary"
                      block
                      onClick={handleNextStep3}
                      style={{
                        height: 40,
                        borderRadius: 8,
                        fontSize: 14,
                        fontWeight: 600,
                        background: "#36ae9a",
                        borderColor: "#36ae9a",
                        marginTop: 8,
                      }}
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
                      style={{
                        padding: 0,
                        marginRight: 8,
                      }}
                    >
                      &larr;
                    </Button>
                    <b>Upload ảnh & Xác nhận</b>
                    <Tooltip title="Upload ảnh thuốc, xác nhận">
                      <span
                        style={{
                          marginLeft: 8,
                          color: "#888",
                        }}
                      >
                        ?
                      </span>
                    </Tooltip>
                    <div style={{ flex: 1 }} />
                    <span
                      style={{
                        color: "#36ae9a",
                        fontWeight: 500,
                      }}
                    >
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
                    <Form.Item label="Ảnh đơn thuốc (nếu có)">
                      <Upload
                        accept="image/*"
                        showUploadList={false}
                        beforeUpload={(file) => {
                          const isImage = file.type.startsWith("image/");
                          const isLt10M = file.size / 1024 / 1024 < 10;
                          if (!isImage) {
                            setImageError(
                              "Chỉ hỗ trợ file ảnh (JPG, PNG, GIF, WebP)"
                            );
                            return false;
                          }
                          if (!isLt10M) {
                            setImageError("Ảnh phải nhỏ hơn 10MB!");
                            return false;
                          }
                          setImageError("");
                          if (imagePreview) URL.revokeObjectURL(imagePreview);
                          setPrescriptionImage(file);
                          setImagePreview(URL.createObjectURL(file));
                          return false;
                        }}
                        maxCount={1}
                        disabled={!!prescriptionImage}
                      >
                        <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
                      </Upload>
                      {imageError && (
                        <div
                          style={{
                            color: "red",
                            marginTop: 8,
                          }}
                        >
                          {imageError}
                        </div>
                      )}
                      {imagePreview && (
                        <div style={{ marginTop: 12 }}>
                          <Image
                            src={imagePreview}
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
                            onClick={handleRemoveImage}
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
                        Tôi tự chịu trách nhiệm với các phản ứng không mong muốn
                        có thể xảy ra
                      </Checkbox>
                    </Form.Item>
                    <Button
                      type="primary"
                      block
                      onClick={handleNextStep4}
                      disabled={
                        !(
                          multiStepData.agreeConfirm && multiStepData.agreeTerms
                        )
                      }
                      style={{
                        height: 40,
                        borderRadius: 8,
                        fontSize: 14,
                        fontWeight: 600,
                        background: "#36ae9a",
                        borderColor: "#36ae9a",
                        marginTop: 8,
                      }}
                    >
                      Lưu vào danh sách
                    </Button>
                  </Form>
                </div>
              )}
              {/* STEP 5: Thành công */}
              {currentStep === 5 && (
                <div style={{ textAlign: "center", padding: 32 }}>
                  <div
                    style={{
                      fontSize: 32,
                      marginBottom: 16,
                    }}
                  >
                    🎉 Đã gửi thành công!
                  </div>
                  <Button
                    type="primary"
                    block
                    style={{
                      margin: "16px 0",
                      height: 40,
                      borderRadius: 8,
                      fontSize: 14,
                      fontWeight: 600,
                      background: "#36ae9a",
                      borderColor: "#36ae9a",
                    }}
                    onClick={handleAddAnotherMedicine}
                  >
                    Thêm thuốc khác
                  </Button>
                  <Button
                    block
                    onClick={resetFormState}
                    style={{
                      height: 40,
                      borderRadius: 8,
                      fontSize: 14,
                      fontWeight: 600,
                    }}
                  >
                    Về trang chủ
                  </Button>
                </div>
              )}
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
              style={{
                height: 40,
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                background: "#36ae9a",
                borderColor: "#36ae9a",
              }}
            >
              Đóng
            </Button>,
          ]}
          title={selectedMedicine?.medicationName || "Chi tiết thuốc"}
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
                  {selectedMedicine.stockQuantity !== undefined &&
                  selectedMedicine.stockQuantity !== null
                    ? selectedMedicine.stockQuantity
                    : "-"}
                </Text>
              </div>
              <div className="flex justify-between items-center">
                <Text type="secondary">Trạng thái:</Text>
                <Tag color={statusColor[selectedMedicine.status]}>
                  {statusLabel[selectedMedicine.status]}
                </Tag>
              </div>
              {selectedMedicine.usageNote && (
                <div>
                  <Text type="secondary">Cách sử dụng:</Text>
                  <div className="mt-1 p-2 bg-gray-50 rounded-lg">
                    <Text>
                      {usageNoteLabel[selectedMedicine.usageNote] ||
                        selectedMedicine.usageNote}
                    </Text>
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default MedicineInfo;
