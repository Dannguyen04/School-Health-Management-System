import {
    AudioOutlined,
    DeleteOutlined,
    EditOutlined,
    ExclamationCircleOutlined,
    EyeOutlined,
    HeartOutlined,
    MedicineBoxOutlined,
    PlusOutlined,
} from "@ant-design/icons";
import {
    Alert,
    Button,
    Card,
    Col,
    Descriptions,
    Divider,
    Form,
    Input,
    message,
    Modal,
    Row,
    Select,
    Spin,
    Steps,
    Switch,
    Tag,
    Typography,
} from "antd";
import axios from "axios";
import { FieldArray, Formik } from "formik";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import * as Yup from "yup";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Step } = Steps;

const validationSchema = Yup.object().shape({
    hasAllergy: Yup.boolean(),
    allergies: Yup.array().when("hasAllergy", {
        is: true,
        then: (schema) =>
            schema.min(1, "Vui lòng thêm ít nhất 1 dị ứng").of(
                Yup.object().shape({
                    type: Yup.string().required("Chọn loại dị ứng"),
                    name: Yup.string().required("Nhập tên dị ứng"),
                    level: Yup.string().required("Chọn mức độ"),
                    symptoms: Yup.string().required("Nhập triệu chứng"),
                })
            ),
        otherwise: (schema) => schema,
    }),
    hasDisease: Yup.boolean(),
    chronicDiseases: Yup.array().when("hasDisease", {
        is: true,
        then: (schema) =>
            schema.min(1, "Vui lòng thêm ít nhất 1 bệnh nền").of(
                Yup.object().shape({
                    group: Yup.string().required("Chọn nhóm bệnh"),
                    name: Yup.string().required("Nhập tên bệnh"),
                    level: Yup.string().required("Chọn mức độ"),
                    status: Yup.string().required("Chọn tình trạng hiện tại"),
                    doctor: Yup.string(),
                    hospital: Yup.string(),
                    notes: Yup.string(),
                })
            ),
        otherwise: (schema) => schema,
    }),
    medications: Yup.array().of(Yup.string().required("Nhập tên thuốc")),
    vision: Yup.string().required("Vui lòng nhập thị lực"),
    hearing: Yup.string().required("Vui lòng nhập thính lực"),
    height: Yup.number()
        .typeError("Vui lòng nhập chiều cao")
        .min(0.1, "Chiều cao phải lớn hơn 0")
        .required("Vui lòng nhập chiều cao"),
    weight: Yup.number()
        .typeError("Vui lòng nhập cân nặng")
        .min(0.1, "Cân nặng phải lớn hơn 0")
        .required("Vui lòng nhập cân nặng"),
});

const HealthProfile = () => {
    const [showSuccess, setShowSuccess] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [children, setChildren] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [healthProfile, setHealthProfile] = useState(null);
    const location = useLocation();
    const [currentStep, setCurrentStep] = useState(0);
    const [hasChanges, setHasChanges] = useState(false);
    const [draftData, setDraftData] = useState(null);
    const [lastSaved, setLastSaved] = useState(null);
    const [editFromConfirmStep, setEditFromConfirmStep] = useState(false);

    useEffect(() => {
        fetchChildren();
    }, []);

    useEffect(() => {
        // Ưu tiên lấy studentId từ query param nếu có
        const params = new URLSearchParams(location.search);
        const studentIdFromQuery = params.get("studentId");
        if (studentIdFromQuery) {
            setSelectedStudent(studentIdFromQuery);
        }
    }, [location.search]);

    const fetchChildren = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const response = await axios.get("/api/parents/my-children", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const studentData = response.data?.data || [];
            setChildren(studentData);
            if (studentData.length > 0) {
                setSelectedStudent(studentData[0].studentId);
            }
        } catch (error) {
            message.error(
                error.response?.data?.error ||
                    "Không thể tải danh sách học sinh"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedStudent) {
            setShowSuccess(false); // Reset thông báo khi đổi học sinh
            fetchHealthProfile();
        } else {
            setHealthProfile(null);
            setShowSuccess(false); // Reset luôn ở đây cho chắc
        }
    }, [selectedStudent]);

    const fetchHealthProfile = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const response = await axios.get(
                `/api/parents/health-profile/${selectedStudent}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setHealthProfile(response.data.data?.healthProfile);
            if (!response.data.data?.healthProfile) setShowSuccess(false);
        } catch (error) {
            setHealthProfile(null);
            setShowSuccess(false);
            message.error(
                error.response?.data?.error === "Health profile not found"
                    ? "Chưa cập nhật hồ sơ sức khỏe cho học sinh"
                    : error.response?.data?.error ||
                          "Không thể tải hồ sơ sức khỏe"
            );
        } finally {
            setLoading(false);
        }
    };

    const handleStudentChange = (studentId) => {
        setSelectedStudent(studentId);
    };

    const handleSubmit = async (values, { setSubmitting }) => {
        try {
            // Transform dayjs objects to strings for backend
            const transformedValues = {
                ...values,
                allergies: values.hasAllergy ? values.allergies : [],
                chronicDiseases: values.hasDisease
                    ? values.chronicDiseases
                    : [],
                medications: values.medications.filter(
                    (med) => med.trim() !== ""
                ),
                vision: values.vision === "" ? null : values.vision,
                hearing: values.hearing === "" ? null : values.hearing,
                height:
                    values.height === null || values.height === ""
                        ? null
                        : parseFloat(values.height),
                weight:
                    values.weight === null || values.weight === ""
                        ? null
                        : parseFloat(values.weight),
            };
            const token = localStorage.getItem("token");
            await axios.post(
                `/api/parents/health-profile/${selectedStudent}`,
                transformedValues,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            message.success("Cập nhật hồ sơ sức khỏe thành công");
            setIsEditModalVisible(false);
            setShowSuccess(true);
            fetchHealthProfile();
            clearDraft(); // Clear draft after successful submission
        } catch (error) {
            message.error(
                error.response?.data?.error ||
                    "Có lỗi xảy ra khi cập nhật hồ sơ"
            );
        } finally {
            setSubmitting(false);
        }
    };

    const getInitialValues = () => {
        // Transform date strings to dayjs objects for DatePicker
        return {
            hasAllergy:
                Array.isArray(healthProfile?.allergies) &&
                healthProfile.allergies.length > 0,
            allergies: healthProfile?.allergies || [],
            hasDisease:
                Array.isArray(healthProfile?.chronicDiseases) &&
                healthProfile.chronicDiseases.length > 0,
            chronicDiseases: healthProfile?.chronicDiseases || [],
            medications: healthProfile?.medications || [],
            vision: healthProfile?.vision || "",
            hearing: healthProfile?.hearing || "",
            height: healthProfile?.height || null,
            weight: healthProfile?.weight || null,
        };
    };

    // Calculate BMI if height and weight are available
    const calculateBMI = () => {
        if (healthProfile?.height && healthProfile?.weight) {
            const heightInMeters = healthProfile.height / 100;
            const bmi =
                healthProfile.weight / (heightInMeters * heightInMeters);
            return bmi.toFixed(1);
        }
        return null;
    };

    const getBMICategory = (bmi) => {
        if (bmi < 18.5) return { category: "Thiếu cân", color: "orange" };
        if (bmi < 25) return { category: "Bình thường", color: "green" };
        if (bmi < 30) return { category: "Thừa cân", color: "orange" };
        return { category: "Béo phì", color: "red" };
    };

    const bmi = calculateBMI();
    const bmiCategory = bmi ? getBMICategory(parseFloat(bmi)) : null;

    // Auto-save draft function
    const saveDraft = (data) => {
        try {
            const draft = {
                data: data,
                timestamp: new Date().toISOString(),
                studentId: selectedStudent,
            };
            localStorage.setItem(
                `healthProfile_draft_${selectedStudent}`,
                JSON.stringify(draft)
            );
            setLastSaved(new Date());
            setHasChanges(false);
            message.success("Đã lưu nháp tự động", 1);
        } catch (error) {
            console.error("Error saving draft:", error);
        }
    };

    // Load draft function
    const loadDraft = () => {
        try {
            const savedDraft = localStorage.getItem(
                `healthProfile_draft_${selectedStudent}`
            );
            if (savedDraft) {
                const draft = JSON.parse(savedDraft);
                setDraftData(draft);
                return draft.data;
            }
        } catch (error) {
            console.error("Error loading draft:", error);
        }
        return null;
    };

    // Clear draft function
    const clearDraft = () => {
        localStorage.removeItem(`healthProfile_draft_${selectedStudent}`);
        setDraftData(null);
        setLastSaved(null);
    };

    // Auto-save effect
    useEffect(() => {
        if (hasChanges && selectedStudent) {
            const interval = setInterval(() => {
                // Get current form data from Formik context
                const currentFormData = {
                    hasAllergy: false,
                    allergies: [],
                    hasDisease: false,
                    chronicDiseases: [],
                    vision: "",
                    hearing: "",
                    height: null,
                    weight: null,
                };
                saveDraft(currentFormData);
            }, 30000); // 30 seconds

            return () => clearInterval(interval);
        }
    }, [hasChanges, selectedStudent]);

    // Load draft when student changes
    useEffect(() => {
        if (selectedStudent) {
            const draft = loadDraft();
            if (draft) {
                setDraftData(draft);
            }
        }
    }, [selectedStudent]);

    // Track form changes
    const handleFormChange = () => {
        setHasChanges(true);
    };

    // Thêm các hàm map giá trị sang tiếng Việt
    const allergyTypeVi = {
        food: "Thực phẩm",
        medicine: "Thuốc",
        environment: "Môi trường",
        other: "Khác",
    };
    const levelVi = {
        mild: "Nhẹ",
        moderate: "Trung bình",
        severe: "Nặng",
    };
    const diseaseGroupVi = {
        "tim-mach": "Tim mạch",
        "ho-hap": "Hô hấp",
        "tieu-duong": "Tiểu đường",
        "than-kinh": "Thần kinh",
        other: "Khác",
    };
    const diseaseStatusVi = {
        stable: "Ổn định",
        treating: "Đang điều trị",
        relapse: "Tái phát",
        other: "Khác",
    };

    if (loading) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-[#f6fcfa]">
                <div className="w-full max-w-5xl mx-auto px-4">
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
                        <HeartOutlined className="text-[#36ae9a]" />
                        <span>Quản lý sức khỏe học sinh</span>
                    </div>
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">
                        Hồ sơ sức khỏe
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Theo dõi và cập nhật thông tin sức khỏe chi tiết của học
                        sinh
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
                                Chọn học sinh để xem và cập nhật hồ sơ sức khỏe
                            </Text>
                        </div>
                        <div className="flex items-center gap-4">
                            {children && children.length > 0 ? (
                                <Select
                                    style={{ width: 320, minWidth: 220 }}
                                    dropdownStyle={{
                                        borderRadius: 18,
                                        boxShadow:
                                            "0 8px 32px rgba(54, 174, 154, 0.15)",
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
                                <Text type="secondary">
                                    Không có học sinh nào
                                </Text>
                            )}
                            <Button
                                type="primary"
                                icon={<EditOutlined />}
                                onClick={() => {
                                    setCurrentStep(0); // Bắt đầu từ step đầu tiên
                                    setEditFromConfirmStep(false); // Không phải edit từ xác nhận
                                    setIsEditModalVisible(true);
                                }}
                                disabled={!selectedStudent}
                                size="large"
                                className="bg-[#36ae9a] hover:bg-[#2a8a7a] border-[#36ae9a]"
                            >
                                Cập nhật thông tin
                            </Button>
                        </div>
                    </div>
                </Card>

                {showSuccess && (
                    <Alert
                        message="Thông tin đã được cập nhật thành công!"
                        type="success"
                        showIcon
                        className="mb-6"
                    />
                )}

                {!selectedStudent && (
                    <Card className="rounded-2xl shadow-lg border-0">
                        <div className="text-center py-12">
                            <div className="text-gray-400 text-6xl mb-4">
                                👨‍🎓
                            </div>
                            <h3 className="text-xl font-semibold text-gray-600 mb-2">
                                Vui lòng chọn học sinh
                            </h3>
                            <p className="text-gray-500">
                                Chọn học sinh từ danh sách để xem hồ sơ sức khỏe
                            </p>
                        </div>
                    </Card>
                )}

                {selectedStudent && !healthProfile && !loading && (
                    <Card className="rounded-2xl shadow-lg border-0">
                        <div className="text-center py-12">
                            <div className="text-gray-400 text-6xl mb-4">
                                📋
                            </div>
                            <h3 className="text-xl font-semibold text-gray-600 mb-2">
                                Chưa có hồ sơ sức khỏe
                            </h3>
                            <p className="text-gray-500 mb-6">
                                Học sinh này chưa có hồ sơ sức khỏe. Hãy tạo hồ
                                sơ để theo dõi sức khỏe.
                            </p>
                            <Button
                                type="primary"
                                size="large"
                                onClick={() => {
                                    setCurrentStep(0); // Bắt đầu từ step đầu tiên
                                    setEditFromConfirmStep(false); // Không phải edit từ xác nhận
                                    setIsEditModalVisible(true);
                                }}
                                className="bg-[#36ae9a] hover:bg-[#2a8a7a] border-[#36ae9a]"
                            >
                                Tạo hồ sơ sức khỏe
                            </Button>
                        </div>
                    </Card>
                )}

                {healthProfile && (
                    <>
                        {/* Separator */}
                        <div className="my-8">
                            <div className="flex items-center">
                                <div className="flex-1 h-px bg-gray-200"></div>
                                <div className="px-4">
                                    <div className="inline-flex items-center gap-2 bg-white text-gray-500 px-3 py-1 rounded-full text-sm border border-gray-200">
                                        <HeartOutlined className="text-[#36ae9a]" />
                                        <span>Hồ sơ sức khỏe</span>
                                    </div>
                                </div>
                                <div className="flex-1 h-px bg-gray-200"></div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Health Metrics */}
                            <div className="lg:col-span-1">
                                <Card className="rounded-2xl shadow-lg border-0 h-fit">
                                    <div className="p-6">
                                        <Title level={4} className="mb-6">
                                            Chỉ số sức khỏe
                                        </Title>

                                        {healthProfile.height &&
                                            healthProfile.weight && (
                                                <div className="space-y-4">
                                                    <div className="text-center p-4 bg-gray-50 rounded-xl">
                                                        <div className="text-2xl font-bold text-[#36ae9a] mb-1">
                                                            {
                                                                healthProfile.height
                                                            }{" "}
                                                            cm
                                                        </div>
                                                        <Text type="secondary">
                                                            Chiều cao
                                                        </Text>
                                                    </div>

                                                    <div className="text-center p-4 bg-gray-50 rounded-xl">
                                                        <div className="text-2xl font-bold text-[#36ae9a] mb-1">
                                                            {
                                                                healthProfile.weight
                                                            }{" "}
                                                            kg
                                                        </div>
                                                        <Text type="secondary">
                                                            Cân nặng
                                                        </Text>
                                                    </div>

                                                    {bmi && (
                                                        <div className="text-center p-4 bg-gray-50 rounded-xl">
                                                            <div className="text-2xl font-bold text-[#36ae9a] mb-1">
                                                                {bmi}
                                                            </div>
                                                            <Text
                                                                className="mr-1"
                                                                type="secondary"
                                                            >
                                                                Chỉ số BMI
                                                            </Text>
                                                            <Tag
                                                                color={
                                                                    bmiCategory.color
                                                                }
                                                                className="mt-2"
                                                            >
                                                                {
                                                                    bmiCategory.category
                                                                }
                                                            </Tag>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                        {/* Vision & Hearing */}
                                        <Divider />
                                        <div className="space-y-4">
                                            {healthProfile.vision && (
                                                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                                                    <EyeOutlined className="text-blue-500 text-lg" />
                                                    <div>
                                                        <Text strong>
                                                            Thị lực
                                                        </Text>
                                                        <div className="text-sm text-gray-600">
                                                            {
                                                                healthProfile.vision
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {healthProfile.hearing && (
                                                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                                                    <AudioOutlined className="text-green-500 text-lg" />
                                                    <div>
                                                        <Text strong>
                                                            Thính lực
                                                        </Text>
                                                        <div className="text-sm text-gray-600">
                                                            {
                                                                healthProfile.hearing
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            </div>

                            {/* Health Information */}
                            <div className="lg:col-span-2">
                                <Card className="rounded-2xl shadow-lg border-0">
                                    <div className="p-6">
                                        <Title level={4} className="mb-6">
                                            Thông tin sức khỏe chi tiết
                                        </Title>

                                        <div className="space-y-6">
                                            {/* Allergies - Enhanced Display */}
                                            <div className="border border-red-200 rounded-xl p-6 bg-gradient-to-r from-red-50 to-pink-50">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="p-2 bg-red-100 rounded-lg">
                                                        <ExclamationCircleOutlined className="text-red-600 text-xl" />
                                                    </div>
                                                    <div>
                                                        <Text
                                                            strong
                                                            className="text-red-700 text-lg"
                                                        >
                                                            Thông tin dị ứng
                                                        </Text>
                                                        <div className="text-sm text-red-600">
                                                            Thông tin quan trọng
                                                            cần lưu ý
                                                        </div>
                                                    </div>
                                                </div>

                                                {healthProfile.allergies &&
                                                healthProfile.allergies.length >
                                                    0 ? (
                                                    <div className="space-y-3">
                                                        <div className="space-y-3">
                                                            {healthProfile.allergies.map(
                                                                (
                                                                    allergy,
                                                                    index
                                                                ) => (
                                                                    <div
                                                                        key={
                                                                            index
                                                                        }
                                                                        className="bg-white p-4 rounded-lg border border-red-200"
                                                                    >
                                                                        <div className="flex items-center gap-2 mb-2">
                                                                            <Tag
                                                                                color="red"
                                                                                className="text-xs"
                                                                            >
                                                                                {allergy.type ===
                                                                                "food"
                                                                                    ? "🍽️ Thực phẩm"
                                                                                    : allergy.type ===
                                                                                      "medicine"
                                                                                    ? "💊 Thuốc"
                                                                                    : allergy.type ===
                                                                                      "environment"
                                                                                    ? "🌍 Môi trường"
                                                                                    : "❓ Khác"}
                                                                            </Tag>
                                                                            <Tag
                                                                                color={
                                                                                    allergy.level ===
                                                                                    "severe"
                                                                                        ? "red"
                                                                                        : allergy.level ===
                                                                                          "moderate"
                                                                                        ? "orange"
                                                                                        : "green"
                                                                                }
                                                                                className="text-xs"
                                                                            >
                                                                                {allergy.level ===
                                                                                "severe"
                                                                                    ? "Nặng"
                                                                                    : allergy.level ===
                                                                                      "moderate"
                                                                                    ? "Trung bình"
                                                                                    : "Nhẹ"}
                                                                            </Tag>
                                                                        </div>
                                                                        <div className="font-medium text-red-700 mb-1">
                                                                            {
                                                                                allergy.name
                                                                            }
                                                                        </div>
                                                                        <div className="text-sm text-gray-600">
                                                                            Triệu
                                                                            chứng:{" "}
                                                                            {
                                                                                allergy.symptoms
                                                                            }
                                                                        </div>
                                                                    </div>
                                                                )
                                                            )}
                                                        </div>
                                                        <div className="mt-4 p-3 bg-red-100 rounded-lg border border-red-200">
                                                            <Text className="text-red-700 text-sm">
                                                                <strong>
                                                                    Lưu ý:
                                                                </strong>{" "}
                                                                Vui lòng thông
                                                                báo cho nhân
                                                                viên y tế và
                                                                giáo viên về các
                                                                dị ứng này để
                                                                đảm bảo an toàn
                                                                cho học sinh.
                                                            </Text>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-4">
                                                        <div className="text-gray-400 text-4xl mb-2">
                                                            ✅
                                                        </div>
                                                        <Text className="text-gray-600">
                                                            Không có thông tin
                                                            dị ứng
                                                        </Text>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Chronic Diseases - Enhanced Display */}
                                            <div className="border border-orange-200 rounded-xl p-6 bg-gradient-to-r from-orange-50 to-yellow-50">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="p-2 bg-orange-100 rounded-lg">
                                                        <MedicineBoxOutlined className="text-orange-600 text-xl" />
                                                    </div>
                                                    <div>
                                                        <Text
                                                            strong
                                                            className="text-orange-700 text-lg"
                                                        >
                                                            Bệnh nền
                                                        </Text>
                                                        <div className="text-sm text-orange-600">
                                                            Thông tin bệnh lý
                                                            cần theo dõi
                                                        </div>
                                                    </div>
                                                </div>

                                                {healthProfile.chronicDiseases &&
                                                healthProfile.chronicDiseases
                                                    .length > 0 ? (
                                                    <div className="space-y-3">
                                                        <div className="space-y-3">
                                                            {healthProfile.chronicDiseases.map(
                                                                (
                                                                    disease,
                                                                    index
                                                                ) => (
                                                                    <div
                                                                        key={
                                                                            index
                                                                        }
                                                                        className="bg-white p-4 rounded-lg border border-orange-200"
                                                                    >
                                                                        <div className="flex items-center gap-2 mb-2">
                                                                            <Tag
                                                                                color="orange"
                                                                                className="text-xs"
                                                                            >
                                                                                {disease.group ===
                                                                                "tim-mach"
                                                                                    ? "❤️ Tim mạch"
                                                                                    : disease.group ===
                                                                                      "ho-hap"
                                                                                    ? "🫁 Hô hấp"
                                                                                    : disease.group ===
                                                                                      "tieu-duong"
                                                                                    ? "🩸 Tiểu đường"
                                                                                    : disease.group ===
                                                                                      "than-kinh"
                                                                                    ? "🧠 Thần kinh"
                                                                                    : "🏥 Khác"}
                                                                            </Tag>
                                                                            <Tag
                                                                                color={
                                                                                    disease.level ===
                                                                                    "severe"
                                                                                        ? "red"
                                                                                        : disease.level ===
                                                                                          "moderate"
                                                                                        ? "orange"
                                                                                        : "green"
                                                                                }
                                                                                className="text-xs"
                                                                            >
                                                                                {disease.level ===
                                                                                "severe"
                                                                                    ? "Nặng"
                                                                                    : disease.level ===
                                                                                      "moderate"
                                                                                    ? "Trung bình"
                                                                                    : "Nhẹ"}
                                                                            </Tag>
                                                                            <Tag
                                                                                color={
                                                                                    disease.status ===
                                                                                    "stable"
                                                                                        ? "green"
                                                                                        : disease.status ===
                                                                                          "treating"
                                                                                        ? "blue"
                                                                                        : "orange"
                                                                                }
                                                                                className="text-xs"
                                                                            >
                                                                                {disease.status ===
                                                                                "stable"
                                                                                    ? "Ổn định"
                                                                                    : disease.status ===
                                                                                      "treating"
                                                                                    ? "Đang điều trị"
                                                                                    : "Tái phát"}
                                                                            </Tag>
                                                                        </div>
                                                                        <div className="font-medium text-orange-700 mb-1">
                                                                            {
                                                                                disease.name
                                                                            }
                                                                        </div>
                                                                        <div className="text-sm text-gray-600 space-y-1">
                                                                            {disease.doctor && (
                                                                                <div>
                                                                                    Bác
                                                                                    sĩ:{" "}
                                                                                    {
                                                                                        disease.doctor
                                                                                    }
                                                                                </div>
                                                                            )}
                                                                            {disease.hospital && (
                                                                                <div>
                                                                                    Nơi
                                                                                    khám:{" "}
                                                                                    {
                                                                                        disease.hospital
                                                                                    }
                                                                                </div>
                                                                            )}
                                                                            {disease.notes && (
                                                                                <div>
                                                                                    Ghi
                                                                                    chú:{" "}
                                                                                    {
                                                                                        disease.notes
                                                                                    }
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                )
                                                            )}
                                                        </div>
                                                        <div className="mt-4 p-3 bg-orange-100 rounded-lg border border-orange-200">
                                                            <Text className="text-orange-700 text-sm">
                                                                <strong>
                                                                    Lưu ý:
                                                                </strong>{" "}
                                                                Cần theo dõi
                                                                định kỳ và tuân
                                                                thủ hướng dẫn
                                                                điều trị từ bác
                                                                sĩ chuyên khoa.
                                                            </Text>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-4">
                                                        <div className="text-gray-400 text-4xl mb-2">
                                                            ✅
                                                        </div>
                                                        <Text className="text-gray-600">
                                                            Không có bệnh nền
                                                        </Text>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Medications */}
                                            {healthProfile.medications &&
                                                healthProfile.medications
                                                    .length > 0 && (
                                                    <div className="border border-blue-200 rounded-xl p-6 bg-gradient-to-r from-blue-50 to-cyan-50">
                                                        <div className="flex items-center gap-3 mb-4">
                                                            <div className="p-2 bg-blue-100 rounded-lg">
                                                                <MedicineBoxOutlined className="text-blue-600 text-xl" />
                                                            </div>
                                                            <div>
                                                                <Text
                                                                    strong
                                                                    className="text-blue-700 text-lg"
                                                                >
                                                                    Thuốc đang
                                                                    dùng
                                                                </Text>
                                                                <div className="text-sm text-blue-600">
                                                                    Danh sách
                                                                    thuốc hiện
                                                                    tại
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-wrap gap-2">
                                                            {healthProfile.medications.map(
                                                                (
                                                                    medication,
                                                                    index
                                                                ) => (
                                                                    <Tag
                                                                        key={
                                                                            index
                                                                        }
                                                                        color="blue"
                                                                        className="text-sm px-3 py-1 border-2 border-blue-300 bg-blue-100 text-blue-700 font-medium"
                                                                    >
                                                                        💊{" "}
                                                                        {
                                                                            medication
                                                                        }
                                                                    </Tag>
                                                                )
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                            {/* Treatment History */}
                                            {healthProfile.treatmentHistory && (
                                                <div className="border border-gray-200 rounded-xl p-6 bg-gray-50">
                                                    <div className="flex items-center gap-3 mb-4">
                                                        <div className="p-2 bg-gray-100 rounded-lg">
                                                            <MedicineBoxOutlined className="text-gray-600 text-xl" />
                                                        </div>
                                                        <div>
                                                            <Text
                                                                strong
                                                                className="text-gray-700 text-lg"
                                                            >
                                                                Lịch sử điều trị
                                                            </Text>
                                                            <div className="text-sm text-gray-600">
                                                                Thông tin điều
                                                                trị trước đây
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="p-4 bg-white rounded-lg border border-gray-200">
                                                        <Text className="text-gray-700">
                                                            {
                                                                healthProfile.treatmentHistory
                                                            }
                                                        </Text>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Notes */}
                                            {healthProfile.notes && (
                                                <div className="border border-gray-200 rounded-xl p-6 bg-gray-50">
                                                    <div className="flex items-center gap-3 mb-4">
                                                        <div className="p-2 bg-gray-100 rounded-lg">
                                                            <EditOutlined className="text-gray-600 text-xl" />
                                                        </div>
                                                        <div>
                                                            <Text
                                                                strong
                                                                className="text-gray-700 text-lg"
                                                            >
                                                                Ghi chú
                                                            </Text>
                                                            <div className="text-sm text-gray-600">
                                                                Thông tin bổ
                                                                sung
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="p-4 bg-white rounded-lg border border-gray-200">
                                                        <Text className="text-gray-700">
                                                            {
                                                                healthProfile.notes
                                                            }
                                                        </Text>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Edit Modal */}
            <Modal
                title={
                    <div>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                marginBottom: 16,
                            }}
                        >
                            <Steps
                                current={currentStep}
                                size="small"
                                style={{ flex: 1 }}
                            >
                                <Step title="Thông tin cơ bản" />
                                <Step title="Dị ứng & Bệnh nền" />
                                <Step title="Chỉ số sức khỏe" />
                                <Step title="Xác nhận" />
                            </Steps>
                            {draftData && (
                                <Button
                                    type="link"
                                    size="small"
                                    onClick={() => {
                                        // Restore draft data
                                        message.info(
                                            "Đã khôi phục dữ liệu nháp"
                                        );
                                        clearDraft();
                                    }}
                                    style={{ marginLeft: 16 }}
                                >
                                    Khôi phục nháp
                                </Button>
                            )}
                        </div>
                        {lastSaved && (
                            <div
                                style={{
                                    fontSize: 12,
                                    color: "#888",
                                    marginTop: 8,
                                }}
                            >
                                Lần lưu cuối: {lastSaved.toLocaleTimeString()}
                            </div>
                        )}
                    </div>
                }
                open={isEditModalVisible}
                onCancel={() => setIsEditModalVisible(false)}
                footer={null}
                width={900}
            >
                <Formik
                    initialValues={getInitialValues()}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                    enableReinitialize={true}
                >
                    {({
                        values,
                        handleChange,
                        handleBlur,
                        handleSubmit,
                        isSubmitting,
                        setFieldValue,
                        validateForm,
                        errors,
                        touched,
                    }) => {
                        return (
                            <Form layout="vertical" onFinish={handleSubmit}>
                                {/* Step 0: Thông tin cơ bản */}
                                {currentStep === 0 && (
                                    <div>
                                        <Title
                                            level={4}
                                            style={{ marginBottom: 16 }}
                                        >
                                            Thông tin cơ bản
                                        </Title>
                                        <Row gutter={24}>
                                            <Col xs={24} md={12}>
                                                <Form.Item
                                                    label="Thị lực"
                                                    validateStatus={
                                                        errors.vision &&
                                                        touched.vision
                                                            ? "error"
                                                            : undefined
                                                    }
                                                    help={
                                                        touched.vision &&
                                                        errors.vision
                                                            ? errors.vision
                                                            : undefined
                                                    }
                                                >
                                                    <Input
                                                        name="vision"
                                                        onChange={(e) => {
                                                            handleChange(e);
                                                            handleFormChange();
                                                        }}
                                                        onBlur={handleBlur}
                                                        value={values.vision}
                                                        placeholder="VD: 10/10"
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col xs={24} md={12}>
                                                <Form.Item
                                                    label="Thính lực"
                                                    validateStatus={
                                                        errors.hearing &&
                                                        touched.hearing
                                                            ? "error"
                                                            : undefined
                                                    }
                                                    help={
                                                        touched.hearing &&
                                                        errors.hearing
                                                            ? errors.hearing
                                                            : undefined
                                                    }
                                                >
                                                    <Input
                                                        name="hearing"
                                                        onChange={(e) => {
                                                            handleChange(e);
                                                            handleFormChange();
                                                        }}
                                                        onBlur={handleBlur}
                                                        value={values.hearing}
                                                        placeholder="VD: Bình thường"
                                                    />
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                        <Row gutter={24}>
                                            <Col xs={24} md={12}>
                                                <Form.Item
                                                    label="Chiều cao (cm)"
                                                    validateStatus={
                                                        errors.height &&
                                                        touched.height
                                                            ? "error"
                                                            : undefined
                                                    }
                                                    help={
                                                        touched.height &&
                                                        errors.height
                                                            ? errors.height
                                                            : undefined
                                                    }
                                                >
                                                    <Input
                                                        name="height"
                                                        type="number"
                                                        onChange={(e) => {
                                                            handleChange(e);
                                                            handleFormChange();
                                                        }}
                                                        onBlur={handleBlur}
                                                        value={values.height}
                                                        placeholder="VD: 150"
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col xs={24} md={12}>
                                                <Form.Item
                                                    label="Cân nặng (kg)"
                                                    validateStatus={
                                                        errors.weight &&
                                                        touched.weight
                                                            ? "error"
                                                            : undefined
                                                    }
                                                    help={
                                                        touched.weight &&
                                                        errors.weight
                                                            ? errors.weight
                                                            : undefined
                                                    }
                                                >
                                                    <Input
                                                        name="weight"
                                                        type="number"
                                                        onChange={(e) => {
                                                            handleChange(e);
                                                            handleFormChange();
                                                        }}
                                                        onBlur={handleBlur}
                                                        value={values.weight}
                                                        placeholder="VD: 45"
                                                    />
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                        <div
                                            style={{
                                                textAlign: "right",
                                                marginTop: 24,
                                            }}
                                        >
                                            <Button
                                                type="primary"
                                                onClick={async () => {
                                                    const errors =
                                                        await validateForm();
                                                    if (
                                                        !errors.vision &&
                                                        !errors.hearing &&
                                                        !errors.height &&
                                                        !errors.weight
                                                    ) {
                                                        if (
                                                            editFromConfirmStep
                                                        ) {
                                                            setCurrentStep(3); // Quay lại xác nhận
                                                            setEditFromConfirmStep(
                                                                false
                                                            );
                                                        } else {
                                                            setCurrentStep(1);
                                                        }
                                                    } else {
                                                        message.error(
                                                            "Vui lòng nhập đầy đủ thông tin cơ bản!"
                                                        );
                                                    }
                                                }}
                                            >
                                                Tiếp theo →
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {/* Step 1: Dị ứng & Bệnh nền */}
                                {currentStep === 1 && (
                                    <div>
                                        <Title
                                            level={4}
                                            style={{ marginBottom: 16 }}
                                        >
                                            Dị ứng & Bệnh nền
                                        </Title>

                                        {/* Medications Section */}
                                        <div style={{ marginBottom: 24 }}>
                                            <Title
                                                level={5}
                                                style={{ marginBottom: 16 }}
                                            >
                                                Thuốc đang sử dụng
                                            </Title>
                                            <FieldArray name="medications">
                                                {({ push, remove }) => (
                                                    <>
                                                        {values.medications.map(
                                                            (
                                                                medication,
                                                                index
                                                            ) => (
                                                                <Card
                                                                    key={index}
                                                                    className="mb-4"
                                                                    size="small"
                                                                    bordered
                                                                    style={{
                                                                        background:
                                                                            "#f0f8ff",
                                                                        borderColor:
                                                                            "#91d5ff",
                                                                        position:
                                                                            "relative",
                                                                        boxShadow:
                                                                            "0 2px 8px #f0f1f2",
                                                                        paddingTop: 24,
                                                                        paddingBottom: 16,
                                                                        marginBottom: 16,
                                                                    }}
                                                                >
                                                                    <div
                                                                        style={{
                                                                            position:
                                                                                "absolute",
                                                                            top: 8,
                                                                            right: 8,
                                                                        }}
                                                                    >
                                                                        <Button
                                                                            danger
                                                                            type="text"
                                                                            icon={
                                                                                <DeleteOutlined />
                                                                            }
                                                                            onClick={() => {
                                                                                remove(
                                                                                    index
                                                                                );
                                                                                handleFormChange();
                                                                            }}
                                                                        />
                                                                    </div>
                                                                    <div
                                                                        style={{
                                                                            display:
                                                                                "flex",
                                                                            alignItems:
                                                                                "center",
                                                                            marginBottom: 12,
                                                                        }}
                                                                    >
                                                                        <MedicineBoxOutlined
                                                                            style={{
                                                                                color: "#1890ff",
                                                                                fontSize: 20,
                                                                                marginRight: 8,
                                                                            }}
                                                                        />
                                                                        <span
                                                                            style={{
                                                                                fontWeight: 600,
                                                                                color: "#096dd9",
                                                                            }}
                                                                        >
                                                                            Thuốc
                                                                            #
                                                                            {index +
                                                                                1}
                                                                        </span>
                                                                    </div>
                                                                    <Form.Item
                                                                        label={
                                                                            <b>
                                                                                Tên
                                                                                thuốc
                                                                            </b>
                                                                        }
                                                                        required
                                                                    >
                                                                        <Input
                                                                            name={`medications[${index}]`}
                                                                            value={
                                                                                medication
                                                                            }
                                                                            onChange={
                                                                                handleChange
                                                                            }
                                                                            placeholder="Tên thuốc đang sử dụng"
                                                                        />
                                                                    </Form.Item>
                                                                </Card>
                                                            )
                                                        )}
                                                        <div
                                                            style={{
                                                                textAlign:
                                                                    "center",
                                                                marginTop: 16,
                                                            }}
                                                        >
                                                            <Button
                                                                type="dashed"
                                                                onClick={() => {
                                                                    push("");
                                                                    handleFormChange();
                                                                }}
                                                                icon={
                                                                    <PlusOutlined />
                                                                }
                                                                style={{
                                                                    color: "#096dd9",
                                                                    borderColor:
                                                                        "#91d5ff",
                                                                    width: 200,
                                                                }}
                                                            >
                                                                Thêm thuốc
                                                            </Button>
                                                        </div>
                                                    </>
                                                )}
                                            </FieldArray>
                                        </div>

                                        <Row gutter={24}>
                                            <Col xs={24} md={12}>
                                                <Form.Item label="Có dị ứng không?">
                                                    <Switch
                                                        checked={
                                                            values.hasAllergy
                                                        }
                                                        onChange={(checked) => {
                                                            setFieldValue(
                                                                "hasAllergy",
                                                                checked
                                                            );
                                                            if (!checked)
                                                                setFieldValue(
                                                                    "allergies",
                                                                    []
                                                                );
                                                            handleFormChange();
                                                        }}
                                                    />
                                                </Form.Item>
                                                {values.hasAllergy && (
                                                    <FieldArray name="allergies">
                                                        {({ push, remove }) => (
                                                            <>
                                                                {values.allergies.map(
                                                                    (
                                                                        allergy,
                                                                        index
                                                                    ) => (
                                                                        <Card
                                                                            key={
                                                                                index
                                                                            }
                                                                            className="mb-4"
                                                                            size="small"
                                                                            bordered
                                                                            style={{
                                                                                background:
                                                                                    "#f6ffed",
                                                                                borderColor:
                                                                                    "#b7eb8f",
                                                                                position:
                                                                                    "relative",
                                                                                boxShadow:
                                                                                    "0 2px 8px #f0f1f2",
                                                                                paddingTop: 24,
                                                                                paddingBottom: 16,
                                                                                marginBottom: 24,
                                                                            }}
                                                                        >
                                                                            <div
                                                                                style={{
                                                                                    position:
                                                                                        "absolute",
                                                                                    top: 8,
                                                                                    right: 8,
                                                                                }}
                                                                            >
                                                                                <Button
                                                                                    danger
                                                                                    type="text"
                                                                                    icon={
                                                                                        <DeleteOutlined />
                                                                                    }
                                                                                    onClick={() => {
                                                                                        remove(
                                                                                            index
                                                                                        );
                                                                                        handleFormChange();
                                                                                    }}
                                                                                />
                                                                            </div>
                                                                            <div
                                                                                style={{
                                                                                    display:
                                                                                        "flex",
                                                                                    alignItems:
                                                                                        "center",
                                                                                    marginBottom: 12,
                                                                                }}
                                                                            >
                                                                                <ExclamationCircleOutlined
                                                                                    style={{
                                                                                        color: "#52c41a",
                                                                                        fontSize: 20,
                                                                                        marginRight: 8,
                                                                                    }}
                                                                                />
                                                                                <span
                                                                                    style={{
                                                                                        fontWeight: 600,
                                                                                        color: "#389e0d",
                                                                                    }}
                                                                                >
                                                                                    Dị
                                                                                    ứng
                                                                                    #
                                                                                    {index +
                                                                                        1}
                                                                                </span>
                                                                            </div>
                                                                            <Form.Item
                                                                                label={
                                                                                    <b>
                                                                                        Loại
                                                                                    </b>
                                                                                }
                                                                                required
                                                                            >
                                                                                <Select
                                                                                    name={`allergies[${index}].type`}
                                                                                    value={
                                                                                        allergy.type
                                                                                    }
                                                                                    onChange={(
                                                                                        value
                                                                                    ) => {
                                                                                        setFieldValue(
                                                                                            `allergies[${index}].type`,
                                                                                            value
                                                                                        );
                                                                                        handleFormChange();
                                                                                    }}
                                                                                    placeholder="Chọn loại"
                                                                                >
                                                                                    <Select.Option value="food">
                                                                                        Thực
                                                                                        phẩm
                                                                                    </Select.Option>
                                                                                    <Select.Option value="medicine">
                                                                                        Thuốc
                                                                                    </Select.Option>
                                                                                    <Select.Option value="environment">
                                                                                        Môi
                                                                                        trường
                                                                                    </Select.Option>
                                                                                    <Select.Option value="other">
                                                                                        Khác
                                                                                    </Select.Option>
                                                                                </Select>
                                                                            </Form.Item>
                                                                            <Form.Item
                                                                                label={
                                                                                    <b>
                                                                                        Tên
                                                                                    </b>
                                                                                }
                                                                                required
                                                                            >
                                                                                <Input
                                                                                    name={`allergies[${index}].name`}
                                                                                    value={
                                                                                        allergy.name
                                                                                    }
                                                                                    onChange={
                                                                                        handleChange
                                                                                    }
                                                                                    placeholder="Tên dị ứng"
                                                                                />
                                                                            </Form.Item>
                                                                            <Form.Item
                                                                                label={
                                                                                    <b>
                                                                                        Mức
                                                                                        độ
                                                                                    </b>
                                                                                }
                                                                                required
                                                                            >
                                                                                <Select
                                                                                    name={`allergies[${index}].level`}
                                                                                    value={
                                                                                        allergy.level
                                                                                    }
                                                                                    onChange={(
                                                                                        value
                                                                                    ) => {
                                                                                        setFieldValue(
                                                                                            `allergies[${index}].level`,
                                                                                            value
                                                                                        );
                                                                                        handleFormChange();
                                                                                    }}
                                                                                    placeholder="Chọn mức độ"
                                                                                >
                                                                                    <Select.Option value="mild">
                                                                                        Nhẹ
                                                                                    </Select.Option>
                                                                                    <Select.Option value="moderate">
                                                                                        Trung
                                                                                        bình
                                                                                    </Select.Option>
                                                                                    <Select.Option value="severe">
                                                                                        Nặng
                                                                                    </Select.Option>
                                                                                </Select>
                                                                            </Form.Item>
                                                                            <Form.Item
                                                                                label={
                                                                                    <b>
                                                                                        Triệu
                                                                                        chứng
                                                                                    </b>
                                                                                }
                                                                                required
                                                                            >
                                                                                <Input
                                                                                    name={`allergies[${index}].symptoms`}
                                                                                    value={
                                                                                        allergy.symptoms
                                                                                    }
                                                                                    onChange={
                                                                                        handleChange
                                                                                    }
                                                                                    placeholder="Triệu chứng"
                                                                                />
                                                                            </Form.Item>
                                                                        </Card>
                                                                    )
                                                                )}
                                                                <div
                                                                    style={{
                                                                        textAlign:
                                                                            "center",
                                                                        marginTop: 24,
                                                                    }}
                                                                >
                                                                    <Button
                                                                        type="dashed"
                                                                        onClick={() => {
                                                                            push(
                                                                                {
                                                                                    type: "",
                                                                                    name: "",
                                                                                    level: "",
                                                                                    symptoms:
                                                                                        "",
                                                                                }
                                                                            );
                                                                            handleFormChange();
                                                                        }}
                                                                        icon={
                                                                            <PlusOutlined />
                                                                        }
                                                                        style={{
                                                                            color: "#389e0d",
                                                                            borderColor:
                                                                                "#b7eb8f",
                                                                            width: 200,
                                                                        }}
                                                                    >
                                                                        Thêm dị
                                                                        ứng
                                                                    </Button>
                                                                </div>
                                                            </>
                                                        )}
                                                    </FieldArray>
                                                )}
                                            </Col>
                                            <Col xs={24} md={12}>
                                                <Form.Item label="Có bệnh nền không?">
                                                    <Switch
                                                        checked={
                                                            values.hasDisease
                                                        }
                                                        onChange={(checked) => {
                                                            setFieldValue(
                                                                "hasDisease",
                                                                checked
                                                            );
                                                            if (!checked)
                                                                setFieldValue(
                                                                    "chronicDiseases",
                                                                    []
                                                                );
                                                            handleFormChange();
                                                        }}
                                                    />
                                                </Form.Item>
                                                {values.hasDisease && (
                                                    <FieldArray name="chronicDiseases">
                                                        {({ push, remove }) => (
                                                            <>
                                                                {values.chronicDiseases.map(
                                                                    (
                                                                        disease,
                                                                        index
                                                                    ) => (
                                                                        <Card
                                                                            key={
                                                                                index
                                                                            }
                                                                            className="mb-4"
                                                                            size="small"
                                                                            bordered
                                                                            style={{
                                                                                background:
                                                                                    "#fffbe6",
                                                                                borderColor:
                                                                                    "#ffe58f",
                                                                                position:
                                                                                    "relative",
                                                                                boxShadow:
                                                                                    "0 2px 8px #f0f1f2",
                                                                                paddingTop: 24,
                                                                                paddingBottom: 16,
                                                                                marginBottom: 24,
                                                                            }}
                                                                        >
                                                                            <div
                                                                                style={{
                                                                                    position:
                                                                                        "absolute",
                                                                                    top: 8,
                                                                                    right: 8,
                                                                                }}
                                                                            >
                                                                                <Button
                                                                                    danger
                                                                                    type="text"
                                                                                    icon={
                                                                                        <DeleteOutlined />
                                                                                    }
                                                                                    onClick={() => {
                                                                                        remove(
                                                                                            index
                                                                                        );
                                                                                        handleFormChange();
                                                                                    }}
                                                                                />
                                                                            </div>
                                                                            <div
                                                                                style={{
                                                                                    display:
                                                                                        "flex",
                                                                                    alignItems:
                                                                                        "center",
                                                                                    marginBottom: 12,
                                                                                }}
                                                                            >
                                                                                <MedicineBoxOutlined
                                                                                    style={{
                                                                                        color: "#faad14",
                                                                                        fontSize: 20,
                                                                                        marginRight: 8,
                                                                                    }}
                                                                                />
                                                                                <span
                                                                                    style={{
                                                                                        fontWeight: 600,
                                                                                        color: "#d48806",
                                                                                    }}
                                                                                >
                                                                                    Bệnh
                                                                                    nền
                                                                                    #
                                                                                    {index +
                                                                                        1}
                                                                                </span>
                                                                            </div>
                                                                            <Form.Item
                                                                                label={
                                                                                    <b>
                                                                                        Nhóm
                                                                                        bệnh
                                                                                    </b>
                                                                                }
                                                                                required
                                                                            >
                                                                                <Select
                                                                                    name={`chronicDiseases[${index}].group`}
                                                                                    value={
                                                                                        disease.group
                                                                                    }
                                                                                    onChange={(
                                                                                        value
                                                                                    ) => {
                                                                                        setFieldValue(
                                                                                            `chronicDiseases[${index}].group`,
                                                                                            value
                                                                                        );
                                                                                        handleFormChange();
                                                                                    }}
                                                                                    placeholder="Ví dụ: Tim mạch, Hô hấp..."
                                                                                >
                                                                                    <Select.Option value="tim-mach">
                                                                                        Tim
                                                                                        mạch
                                                                                    </Select.Option>
                                                                                    <Select.Option value="ho-hap">
                                                                                        Hô
                                                                                        hấp
                                                                                    </Select.Option>
                                                                                    <Select.Option value="tieu-duong">
                                                                                        Tiểu
                                                                                        đường
                                                                                    </Select.Option>
                                                                                    <Select.Option value="than-kinh">
                                                                                        Thần
                                                                                        kinh
                                                                                    </Select.Option>
                                                                                    <Select.Option value="other">
                                                                                        Khác
                                                                                    </Select.Option>
                                                                                </Select>
                                                                            </Form.Item>
                                                                            <Form.Item
                                                                                label={
                                                                                    <b>
                                                                                        Tên
                                                                                        bệnh
                                                                                    </b>
                                                                                }
                                                                                required
                                                                            >
                                                                                <Input
                                                                                    name={`chronicDiseases[${index}].name`}
                                                                                    value={
                                                                                        disease.name
                                                                                    }
                                                                                    onChange={
                                                                                        handleChange
                                                                                    }
                                                                                    placeholder="Ví dụ: Tim bẩm sinh, Hen phế quản..."
                                                                                />
                                                                            </Form.Item>
                                                                            <Form.Item
                                                                                label={
                                                                                    <b>
                                                                                        Mức
                                                                                        độ
                                                                                    </b>
                                                                                }
                                                                                required
                                                                            >
                                                                                <Select
                                                                                    name={`chronicDiseases[${index}].level`}
                                                                                    value={
                                                                                        disease.level
                                                                                    }
                                                                                    onChange={(
                                                                                        value
                                                                                    ) => {
                                                                                        setFieldValue(
                                                                                            `chronicDiseases[${index}].level`,
                                                                                            value
                                                                                        );
                                                                                        handleFormChange();
                                                                                    }}
                                                                                    placeholder="Chọn mức độ"
                                                                                >
                                                                                    <Select.Option value="mild">
                                                                                        Nhẹ
                                                                                    </Select.Option>
                                                                                    <Select.Option value="moderate">
                                                                                        Trung
                                                                                        bình
                                                                                    </Select.Option>
                                                                                    <Select.Option value="severe">
                                                                                        Nặng
                                                                                    </Select.Option>
                                                                                </Select>
                                                                            </Form.Item>
                                                                            <Form.Item
                                                                                label={
                                                                                    <b>
                                                                                        Tình
                                                                                        trạng
                                                                                        hiện
                                                                                        tại
                                                                                    </b>
                                                                                }
                                                                                required
                                                                            >
                                                                                <Select
                                                                                    name={`chronicDiseases[${index}].status`}
                                                                                    value={
                                                                                        disease.status
                                                                                    }
                                                                                    onChange={(
                                                                                        value
                                                                                    ) => {
                                                                                        setFieldValue(
                                                                                            `chronicDiseases[${index}].status`,
                                                                                            value
                                                                                        );
                                                                                        handleFormChange();
                                                                                    }}
                                                                                    placeholder="Chọn tình trạng"
                                                                                >
                                                                                    <Select.Option value="stable">
                                                                                        Ổn
                                                                                        định
                                                                                    </Select.Option>
                                                                                    <Select.Option value="treating">
                                                                                        Đang
                                                                                        điều
                                                                                        trị
                                                                                    </Select.Option>
                                                                                    <Select.Option value="relapse">
                                                                                        Tái
                                                                                        phát
                                                                                    </Select.Option>
                                                                                    <Select.Option value="other">
                                                                                        Khác
                                                                                    </Select.Option>
                                                                                </Select>
                                                                            </Form.Item>

                                                                            <Row
                                                                                gutter={
                                                                                    16
                                                                                }
                                                                            >
                                                                                <Col
                                                                                    span={
                                                                                        12
                                                                                    }
                                                                                >
                                                                                    <Form.Item
                                                                                        label={
                                                                                            <b>
                                                                                                Bác
                                                                                                sĩ
                                                                                                khám
                                                                                            </b>
                                                                                        }
                                                                                    >
                                                                                        <Input
                                                                                            name={`chronicDiseases[${index}].doctor`}
                                                                                            value={
                                                                                                disease.doctor
                                                                                            }
                                                                                            onChange={
                                                                                                handleChange
                                                                                            }
                                                                                            placeholder="Tên bác sĩ"
                                                                                        />
                                                                                    </Form.Item>
                                                                                </Col>
                                                                                <Col
                                                                                    span={
                                                                                        12
                                                                                    }
                                                                                >
                                                                                    <Form.Item
                                                                                        label={
                                                                                            <b>
                                                                                                Nơi
                                                                                                khám
                                                                                            </b>
                                                                                        }
                                                                                    >
                                                                                        <Input
                                                                                            name={`chronicDiseases[${index}].hospital`}
                                                                                            value={
                                                                                                disease.hospital
                                                                                            }
                                                                                            onChange={
                                                                                                handleChange
                                                                                            }
                                                                                            placeholder="Bệnh viện, phòng khám..."
                                                                                        />
                                                                                    </Form.Item>
                                                                                </Col>
                                                                            </Row>
                                                                            <Form.Item
                                                                                label={
                                                                                    <b>
                                                                                        Ghi
                                                                                        chú
                                                                                    </b>
                                                                                }
                                                                            >
                                                                                <Input
                                                                                    name={`chronicDiseases[${index}].notes`}
                                                                                    value={
                                                                                        disease.notes
                                                                                    }
                                                                                    onChange={
                                                                                        handleChange
                                                                                    }
                                                                                    placeholder="Ghi chú thêm (nếu có)"
                                                                                />
                                                                            </Form.Item>
                                                                        </Card>
                                                                    )
                                                                )}
                                                                <div
                                                                    style={{
                                                                        textAlign:
                                                                            "center",
                                                                        marginTop: 24,
                                                                    }}
                                                                >
                                                                    <Button
                                                                        type="dashed"
                                                                        onClick={() => {
                                                                            push(
                                                                                {
                                                                                    group: "",
                                                                                    name: "",
                                                                                    level: "",
                                                                                    status: "",
                                                                                    doctor: "",
                                                                                    hospital:
                                                                                        "",
                                                                                    notes: "",
                                                                                }
                                                                            );
                                                                            handleFormChange();
                                                                        }}
                                                                        icon={
                                                                            <PlusOutlined />
                                                                        }
                                                                        style={{
                                                                            color: "#d48806",
                                                                            borderColor:
                                                                                "#ffe58f",
                                                                            width: 200,
                                                                        }}
                                                                    >
                                                                        Thêm
                                                                        bệnh nền
                                                                    </Button>
                                                                </div>
                                                            </>
                                                        )}
                                                    </FieldArray>
                                                )}
                                            </Col>
                                        </Row>
                                        <div
                                            style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                marginTop: 24,
                                            }}
                                        >
                                            <Button
                                                onClick={() =>
                                                    setCurrentStep(0)
                                                }
                                            >
                                                ← Quay lại
                                            </Button>
                                            <Button
                                                type="primary"
                                                onClick={async () => {
                                                    const errors =
                                                        await validateForm();
                                                    let hasError = false;
                                                    // Validate medications
                                                    if (
                                                        Array.isArray(
                                                            values.medications
                                                        )
                                                    ) {
                                                        values.medications.forEach(
                                                            (med, idx) => {
                                                                if (
                                                                    errors.medications &&
                                                                    errors
                                                                        .medications[
                                                                        idx
                                                                    ]
                                                                )
                                                                    hasError = true;
                                                            }
                                                        );
                                                    }
                                                    // Validate allergies if hasAllergy
                                                    if (values.hasAllergy) {
                                                        if (errors.allergies)
                                                            hasError = true;
                                                    }
                                                    // Validate chronicDiseases if hasDisease
                                                    if (values.hasDisease) {
                                                        if (
                                                            errors.chronicDiseases
                                                        )
                                                            hasError = true;
                                                    }
                                                    if (!hasError) {
                                                        if (
                                                            editFromConfirmStep
                                                        ) {
                                                            setCurrentStep(3);
                                                            setEditFromConfirmStep(
                                                                false
                                                            );
                                                        } else {
                                                            setCurrentStep(2);
                                                        }
                                                    } else {
                                                        message.error(
                                                            "Vui lòng nhập đầy đủ thông tin dị ứng, bệnh nền và thuốc!"
                                                        );
                                                    }
                                                }}
                                            >
                                                Tiếp theo →
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {/* Step 2: Chỉ số sức khỏe */}
                                {currentStep === 2 && (
                                    <>
                                        <div
                                            style={{
                                                display: "flex",
                                                gap: 24,
                                                justifyContent: "center",
                                                marginBottom: 32,
                                                flexWrap: "wrap",
                                            }}
                                        >
                                            <Card
                                                style={{
                                                    minWidth: 140,
                                                    textAlign: "center",
                                                    background: "#e6f7ff",
                                                    borderRadius: 16,
                                                    boxShadow:
                                                        "0 2px 8px #f0f1f2",
                                                }}
                                                bodyStyle={{ padding: 20 }}
                                            >
                                                <div
                                                    style={{
                                                        fontSize: 28,
                                                        fontWeight: 700,
                                                        color: "#1890ff",
                                                    }}
                                                >
                                                    {values.height || "--"} cm
                                                </div>
                                                <div style={{ color: "#888" }}>
                                                    Chiều cao
                                                </div>
                                            </Card>
                                            <Card
                                                style={{
                                                    minWidth: 140,
                                                    textAlign: "center",
                                                    background: "#fffbe6",
                                                    borderRadius: 16,
                                                    boxShadow:
                                                        "0 2px 8px #f0f1f2",
                                                }}
                                                bodyStyle={{ padding: 20 }}
                                            >
                                                <div
                                                    style={{
                                                        fontSize: 28,
                                                        fontWeight: 700,
                                                        color: "#faad14",
                                                    }}
                                                >
                                                    {values.weight || "--"} kg
                                                </div>
                                                <div style={{ color: "#888" }}>
                                                    Cân nặng
                                                </div>
                                            </Card>
                                            <Card
                                                style={{
                                                    minWidth: 140,
                                                    textAlign: "center",
                                                    background: "#f6ffed",
                                                    borderRadius: 16,
                                                    boxShadow:
                                                        "0 2px 8px #f0f1f2",
                                                }}
                                                bodyStyle={{ padding: 20 }}
                                            >
                                                <div
                                                    style={{
                                                        fontSize: 28,
                                                        fontWeight: 700,
                                                        color: "#52c41a",
                                                    }}
                                                >
                                                    {Array.isArray(
                                                        values.allergies
                                                    ) && values.hasAllergy
                                                        ? values.allergies
                                                              .length
                                                        : 0}
                                                </div>
                                                <div style={{ color: "#888" }}>
                                                    Dị ứng
                                                </div>
                                            </Card>
                                            <Card
                                                style={{
                                                    minWidth: 140,
                                                    textAlign: "center",
                                                    background: "#fff0f6",
                                                    borderRadius: 16,
                                                    boxShadow:
                                                        "0 2px 8px #f0f1f2",
                                                }}
                                                bodyStyle={{ padding: 20 }}
                                            >
                                                <div
                                                    style={{
                                                        fontSize: 28,
                                                        fontWeight: 700,
                                                        color: "#eb2f96",
                                                    }}
                                                >
                                                    {Array.isArray(
                                                        values.chronicDiseases
                                                    ) && values.hasDisease
                                                        ? values.chronicDiseases
                                                              .length
                                                        : 0}
                                                </div>
                                                <div style={{ color: "#888" }}>
                                                    Bệnh nền
                                                </div>
                                            </Card>
                                            <Card
                                                style={{
                                                    minWidth: 140,
                                                    textAlign: "center",
                                                    background: "#f9f0ff",
                                                    borderRadius: 16,
                                                    boxShadow:
                                                        "0 2px 8px #f0f1f2",
                                                }}
                                                bodyStyle={{ padding: 20 }}
                                            >
                                                <div
                                                    style={{
                                                        fontSize: 28,
                                                        fontWeight: 700,
                                                        color: "#722ed1",
                                                    }}
                                                >
                                                    {Array.isArray(
                                                        values.medications
                                                    )
                                                        ? values.medications.filter(
                                                              (med) =>
                                                                  med.trim() !==
                                                                  ""
                                                          ).length
                                                        : 0}
                                                </div>
                                                <div style={{ color: "#888" }}>
                                                    Thuốc
                                                </div>
                                            </Card>
                                        </div>
                                        <div
                                            style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                marginTop: 24,
                                            }}
                                        >
                                            <Button
                                                onClick={() =>
                                                    setCurrentStep(1)
                                                }
                                            >
                                                ← Quay lại
                                            </Button>
                                            <Button
                                                type="primary"
                                                onClick={async () => {
                                                    if (editFromConfirmStep) {
                                                        setCurrentStep(3);
                                                        setEditFromConfirmStep(
                                                            false
                                                        );
                                                    } else {
                                                        setCurrentStep(3);
                                                    }
                                                }}
                                            >
                                                Tiếp theo →
                                            </Button>
                                        </div>
                                    </>
                                )}

                                {/* Step 3: Xác nhận */}
                                {currentStep === 3 && (
                                    <>
                                        {/* Chỉ số cơ bản */}
                                        <Card
                                            style={{
                                                background: "#fff",
                                                borderRadius: 16,
                                                boxShadow: "0 2px 8px #f0f1f2",
                                                marginBottom: 24,
                                            }}
                                        >
                                            <div
                                                style={{
                                                    display: "flex",
                                                    justifyContent:
                                                        "space-between",
                                                    alignItems: "center",
                                                }}
                                            >
                                                <h3
                                                    style={{
                                                        fontWeight: 700,
                                                        marginBottom: 16,
                                                    }}
                                                >
                                                    Chỉ số cơ bản
                                                </h3>
                                                <Button
                                                    size="small"
                                                    icon={<EditOutlined />}
                                                    onClick={() => {
                                                        setCurrentStep(0);
                                                        setEditFromConfirmStep(
                                                            true
                                                        );
                                                    }}
                                                >
                                                    Chỉnh sửa
                                                </Button>
                                            </div>
                                            <Descriptions
                                                column={2}
                                                size="small"
                                                bordered
                                            >
                                                <Descriptions.Item label="Thị lực">
                                                    {values.vision}
                                                </Descriptions.Item>
                                                <Descriptions.Item label="Thính lực">
                                                    {values.hearing}
                                                </Descriptions.Item>
                                                <Descriptions.Item label="Chiều cao">
                                                    {values.height} cm
                                                </Descriptions.Item>
                                                <Descriptions.Item label="Cân nặng">
                                                    {values.weight} kg
                                                </Descriptions.Item>
                                            </Descriptions>
                                        </Card>
                                        {/* Dị ứng */}
                                        <Card
                                            style={{
                                                background: "#fffbe6",
                                                borderRadius: 16,
                                                marginBottom: 24,
                                            }}
                                        >
                                            <div
                                                style={{
                                                    display: "flex",
                                                    justifyContent:
                                                        "space-between",
                                                    alignItems: "center",
                                                }}
                                            >
                                                <h3
                                                    style={{
                                                        fontWeight: 700,
                                                        marginBottom: 8,
                                                    }}
                                                >
                                                    Dị ứng
                                                </h3>
                                                <Button
                                                    size="small"
                                                    icon={<EditOutlined />}
                                                    onClick={() => {
                                                        setCurrentStep(1);
                                                        setEditFromConfirmStep(
                                                            true
                                                        );
                                                    }}
                                                >
                                                    Chỉnh sửa
                                                </Button>
                                            </div>
                                            {values.hasAllergy &&
                                            values.allergies.length > 0 ? (
                                                values.allergies.map(
                                                    (a, idx) => (
                                                        <Descriptions
                                                            key={idx}
                                                            size="small"
                                                            column={2}
                                                            bordered
                                                            style={{
                                                                marginBottom: 16,
                                                                background:
                                                                    "#fff",
                                                            }}
                                                        >
                                                            <Descriptions.Item label="Tên">
                                                                {a.name}
                                                            </Descriptions.Item>
                                                            <Descriptions.Item label="Loại">
                                                                <Tag color="red">
                                                                    {allergyTypeVi[
                                                                        a.type
                                                                    ] || a.type}
                                                                </Tag>
                                                            </Descriptions.Item>
                                                            <Descriptions.Item label="Mức độ">
                                                                <Tag
                                                                    color={
                                                                        a.level ===
                                                                        "mild"
                                                                            ? "green"
                                                                            : a.level ===
                                                                              "moderate"
                                                                            ? "orange"
                                                                            : "red"
                                                                    }
                                                                >
                                                                    {levelVi[
                                                                        a.level
                                                                    ] ||
                                                                        a.level}
                                                                </Tag>
                                                            </Descriptions.Item>
                                                            <Descriptions.Item label="Triệu chứng">
                                                                {a.symptoms}
                                                            </Descriptions.Item>
                                                        </Descriptions>
                                                    )
                                                )
                                            ) : (
                                                <span>Không có</span>
                                            )}
                                        </Card>
                                        {/* Bệnh nền */}
                                        <Card
                                            style={{
                                                background: "#f6ffed",
                                                borderRadius: 16,
                                                marginBottom: 24,
                                            }}
                                        >
                                            <div
                                                style={{
                                                    display: "flex",
                                                    justifyContent:
                                                        "space-between",
                                                    alignItems: "center",
                                                }}
                                            >
                                                <h3
                                                    style={{
                                                        fontWeight: 700,
                                                        marginBottom: 8,
                                                    }}
                                                >
                                                    Bệnh nền
                                                </h3>
                                                <Button
                                                    size="small"
                                                    icon={<EditOutlined />}
                                                    onClick={() => {
                                                        setCurrentStep(1);
                                                        setEditFromConfirmStep(
                                                            true
                                                        );
                                                    }}
                                                >
                                                    Chỉnh sửa
                                                </Button>
                                            </div>
                                            {values.hasDisease &&
                                            values.chronicDiseases.length >
                                                0 ? (
                                                values.chronicDiseases.map(
                                                    (d, idx) => (
                                                        <Descriptions
                                                            key={idx}
                                                            size="small"
                                                            column={2}
                                                            bordered
                                                            style={{
                                                                marginBottom: 16,
                                                                background:
                                                                    "#fff",
                                                            }}
                                                        >
                                                            <Descriptions.Item label="Tên">
                                                                {d.name}
                                                            </Descriptions.Item>
                                                            <Descriptions.Item label="Nhóm">
                                                                <Tag color="blue">
                                                                    {diseaseGroupVi[
                                                                        d.group
                                                                    ] ||
                                                                        d.group}
                                                                </Tag>
                                                            </Descriptions.Item>
                                                            <Descriptions.Item label="Mức độ">
                                                                <Tag
                                                                    color={
                                                                        d.level ===
                                                                        "mild"
                                                                            ? "green"
                                                                            : d.level ===
                                                                              "moderate"
                                                                            ? "orange"
                                                                            : "red"
                                                                    }
                                                                >
                                                                    {levelVi[
                                                                        d.level
                                                                    ] ||
                                                                        d.level}
                                                                </Tag>
                                                            </Descriptions.Item>
                                                            <Descriptions.Item label="Tình trạng">
                                                                <Tag
                                                                    color={
                                                                        d.status ===
                                                                        "stable"
                                                                            ? "green"
                                                                            : d.status ===
                                                                              "treating"
                                                                            ? "blue"
                                                                            : "orange"
                                                                    }
                                                                >
                                                                    {diseaseStatusVi[
                                                                        d.status
                                                                    ] ||
                                                                        d.status}
                                                                </Tag>
                                                            </Descriptions.Item>
                                                            {d.notes && (
                                                                <Descriptions.Item label="Ghi chú">
                                                                    {d.notes}
                                                                </Descriptions.Item>
                                                            )}
                                                        </Descriptions>
                                                    )
                                                )
                                            ) : (
                                                <span>Không có</span>
                                            )}
                                        </Card>
                                        {/* Thuốc đang dùng */}
                                        <Card
                                            style={{
                                                background: "#f9f0ff",
                                                borderRadius: 16,
                                            }}
                                        >
                                            <div
                                                style={{
                                                    display: "flex",
                                                    justifyContent:
                                                        "space-between",
                                                    alignItems: "center",
                                                }}
                                            >
                                                <h3
                                                    style={{
                                                        fontWeight: 700,
                                                        marginBottom: 8,
                                                    }}
                                                >
                                                    Thuốc đang dùng
                                                </h3>
                                                <Button
                                                    size="small"
                                                    icon={<EditOutlined />}
                                                    onClick={() => {
                                                        setCurrentStep(1);
                                                        setEditFromConfirmStep(
                                                            true
                                                        );
                                                    }}
                                                >
                                                    Chỉnh sửa
                                                </Button>
                                            </div>
                                            {values.medications &&
                                            values.medications.length > 0 ? (
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        flexWrap: "wrap",
                                                        gap: 8,
                                                    }}
                                                >
                                                    {values.medications
                                                        .filter(
                                                            (m) =>
                                                                m.trim() !== ""
                                                        )
                                                        .map((m, idx) => (
                                                            <Tag
                                                                color="purple"
                                                                key={idx}
                                                            >
                                                                {m}
                                                            </Tag>
                                                        ))}
                                                </div>
                                            ) : (
                                                <span>Không có</span>
                                            )}
                                        </Card>
                                        <div
                                            style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                marginTop: 24,
                                            }}
                                        >
                                            <Button
                                                onClick={() =>
                                                    setCurrentStep(2)
                                                }
                                            >
                                                ← Quay lại
                                            </Button>
                                            <Button
                                                type="primary"
                                                htmlType="submit"
                                                loading={isSubmitting}
                                            >
                                                Lưu hồ sơ
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </Form>
                        );
                    }}
                </Formik>
            </Modal>
        </div>
    );
};

export default HealthProfile;
