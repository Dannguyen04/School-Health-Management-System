import {
    EditOutlined,
    HeartOutlined,
    EyeOutlined,
    AudioOutlined,
    UserOutlined,
    WarningOutlined,
    MedicineBoxOutlined,
    ExclamationCircleOutlined,
    BookOutlined,
} from "@ant-design/icons";
import {
    Alert,
    Button,
    Card,
    Col,
    Descriptions,
    Form,
    Input,
    message,
    Modal,
    Row,
    Select,
    Spin,
    Typography,
    Progress,
    Tag,
    Divider,
    Space,
} from "antd";
import axios from "axios";
import { Formik } from "formik";
import { useEffect, useState } from "react";
import * as Yup from "yup";
import { useLocation } from "react-router-dom";

const { Title, Text } = Typography;
const { TextArea } = Input;

const validationSchema = Yup.object().shape({
    allergies: Yup.string().required("Vui lòng nhập thông tin dị ứng"),
    chronicDiseases: Yup.string().required("Vui lòng nhập thông tin bệnh nền"),
    medications: Yup.string().required(
        "Vui lòng nhập thông tin thuốc đang dùng"
    ),
    treatmentHistory: Yup.string(),
    vision: Yup.string(),
    hearing: Yup.string(),
    height: Yup.number().nullable(),
    weight: Yup.number().nullable(),
    notes: Yup.string(),
});

const HealthProfile = () => {
    const [showSuccess, setShowSuccess] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [children, setChildren] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [healthProfile, setHealthProfile] = useState(null);
    const location = useLocation();

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
            fetchHealthProfile();
        } else {
            setHealthProfile(null);
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
        } catch (error) {
            setHealthProfile(null);
            message.error(
                error.response?.data?.error || "Không thể tải hồ sơ sức khỏe"
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
            const transformedValues = {
                ...values,
                allergies: values.allergies
                    .split(",")
                    .map((item) => item.trim())
                    .filter((item) => item !== ""),
                chronicDiseases: values.chronicDiseases
                    .split(",")
                    .map((item) => item.trim())
                    .filter((item) => item !== ""),
                medications: values.medications
                    .split(",")
                    .map((item) => item.trim())
                    .filter((item) => item !== ""),
                treatmentHistory:
                    values.treatmentHistory === ""
                        ? null
                        : values.treatmentHistory,
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
                notes: values.notes === "" ? null : values.notes,
            };

            const token = localStorage.getItem("token");
            const response = await axios.post(
                `/api/parents/health-profile/${selectedStudent}`,
                transformedValues,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            console.log("Health profile upserted successfully:", response.data);
            message.success("Cập nhật hồ sơ sức khỏe thành công");
            setIsEditModalVisible(false);
            setShowSuccess(true);
            fetchHealthProfile();
        } catch (error) {
            console.error("Error updating health profile:", error);
            message.error(
                error.response?.data?.error ||
                    "Có lỗi xảy ra khi cập nhật hồ sơ"
            );
        } finally {
            setSubmitting(false);
        }
    };

    const getInitialValues = () => ({
        allergies: healthProfile?.allergies?.join(", ") || "",
        chronicDiseases: healthProfile?.chronicDiseases?.join(", ") || "",
        medications: healthProfile?.medications?.join(", ") || "",
        treatmentHistory: healthProfile?.treatmentHistory || "",
        vision: healthProfile?.vision || "",
        hearing: healthProfile?.hearing || "",
        height: healthProfile?.height || null,
        weight: healthProfile?.weight || null,
        notes: healthProfile?.notes || "",
    });

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
                <Card className="rounded-2xl shadow-lg border-0 mb-6 bg-gradient-to-r from-[#f8fffe] to-[#e8f5f2]">
                    <div className="flex flex-col lg:flex-row justify-between items-center gap-6 p-6">
                        <div>
                            <Title level={4} className="mb-2 text-[#36ae9a]">
                                Chọn học sinh
                            </Title>
                            <Text type="secondary" className="text-gray-600">
                                Chọn học sinh để xem và cập nhật hồ sơ sức khỏe
                            </Text>
                        </div>
                        <div className="flex items-center gap-4">
                            {children && children.length > 0 ? (
                                <Select
                                    style={{ 
                                        width: 300,
                                        borderRadius: '12px',
                                    }}
                                    value={selectedStudent}
                                    onChange={handleStudentChange}
                                    placeholder="Chọn học sinh"
                                    size="large"
                                    className="custom-select"
                                >
                                    {children.map((child) => (
                                        <Select.Option
                                            key={child.studentId}
                                            value={child.studentId}
                                        >
                                            <div className="flex items-center justify-between py-2">
                                                <span className="font-semibold text-gray-800">{child.fullName}</span>
                                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                                    Lớp {child.class} - Khối {child.grade}
                                                </span>
                                            </div>
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
                                onClick={() => setIsEditModalVisible(true)}
                                disabled={!selectedStudent}
                                size="large"
                                className="bg-[#36ae9a] hover:bg-[#2a8a7a] border-[#36ae9a] shadow-lg"
                                style={{ borderRadius: '12px' }}
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
                                onClick={() => setIsEditModalVisible(true)}
                                className="bg-[#36ae9a] hover:bg-[#2a8a7a] border-[#36ae9a]"
                            >
                                Tạo hồ sơ sức khỏe
                            </Button>
                        </div>
                    </Card>
                )}

                {healthProfile && (
                    <>
                        {/* Student Information Card */}
                        <Card className="rounded-2xl shadow-xl border-0 mb-6 overflow-hidden student-info-card">
                            <div className="bg-gradient-to-r from-[#36ae9a] to-[#2a8a7a] p-8 text-white relative">
                                <div className="flex items-center gap-8 relative z-10">
                                    <div className="p-5 glass-badge rounded-full shadow-lg">
                                        <BookOutlined className="text-white text-3xl" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="mb-4">
                                            <div className="text-sm opacity-80 mb-1">Học sinh</div>
                                            <Title level={1} className="mb-0 text-white">
                                                {children.find(child => child.studentId === selectedStudent)?.fullName}
                                            </Title>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-3 glass-badge px-5 py-3 rounded-full shadow-md">
                                                <div className="w-2 h-2 bg-white rounded-full"></div>
                                                <span className="font-medium">Lớp:</span>
                                                <span className="font-bold text-lg">{children.find(child => child.studentId === selectedStudent)?.class}</span>
                                            </div>
                                            <div className="flex items-center gap-3 glass-badge px-5 py-3 rounded-full shadow-md">
                                                <div className="w-2 h-2 bg-white rounded-full"></div>
                                                <span className="font-medium">Khối:</span>
                                                <span className="font-bold text-lg">{children.find(child => child.studentId === selectedStudent)?.grade}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                </div>
                            </div>
                        </Card>

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
                                                            <Text type="secondary">
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
                                                        <div className="flex flex-wrap gap-2">
                                                            {healthProfile.allergies.map(
                                                                (
                                                                    allergy,
                                                                    index
                                                                ) => (
                                                                    <Tag
                                                                        key={
                                                                            index
                                                                        }
                                                                        color="red"
                                                                        className="text-sm px-3 py-1 border-2 border-red-300 bg-red-100 text-red-700 font-medium"
                                                                    >
                                                                        ⚠️{" "}
                                                                        {
                                                                            allergy
                                                                        }
                                                                    </Tag>
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
                                                        <div className="flex flex-wrap gap-2">
                                                            {healthProfile.chronicDiseases.map(
                                                                (
                                                                    disease,
                                                                    index
                                                                ) => (
                                                                    <Tag
                                                                        key={
                                                                            index
                                                                        }
                                                                        color="orange"
                                                                        className="text-sm px-3 py-1 border-2 border-orange-300 bg-orange-100 text-orange-700 font-medium"
                                                                    >
                                                                        🏥{" "}
                                                                        {
                                                                            disease
                                                                        }
                                                                    </Tag>
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
                title="Cập nhật hồ sơ sức khỏe"
                open={isEditModalVisible}
                onCancel={() => setIsEditModalVisible(false)}
                footer={null}
                width={800}
            >
                <Formik
                    initialValues={getInitialValues()}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                    enableReinitialize={true}
                >
                    {({
                        values,
                        errors,
                        touched,
                        handleChange,
                        handleBlur,
                        handleSubmit,
                        isSubmitting,
                    }) => (
                        <Form layout="vertical" onFinish={handleSubmit}>
                            <Title level={4}>Thông tin cơ bản</Title>
                            <Row gutter={24}>
                                <Col xs={24} md={12}>
                                    <Form.Item
                                        label="Dị ứng"
                                        validateStatus={
                                            touched.allergies &&
                                            errors.allergies
                                                ? "error"
                                                : ""
                                        }
                                        help={
                                            touched.allergies &&
                                            errors.allergies
                                        }
                                    >
                                        <TextArea
                                            name="allergies"
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            value={values.allergies}
                                            placeholder="Nhập thông tin dị ứng (nếu có)"
                                            rows={4}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={12}>
                                    <Form.Item
                                        label="Bệnh nền"
                                        validateStatus={
                                            touched.chronicDiseases &&
                                            errors.chronicDiseases
                                                ? "error"
                                                : ""
                                        }
                                        help={
                                            touched.chronicDiseases &&
                                            errors.chronicDiseases
                                        }
                                    >
                                        <TextArea
                                            name="chronicDiseases"
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            value={values.chronicDiseases}
                                            placeholder="Nhập thông tin bệnh nền (nếu có)"
                                            rows={4}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={24}>
                                <Col xs={24} md={12}>
                                    <Form.Item label="Thị lực">
                                        <Input
                                            name="vision"
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            value={values.vision}
                                            placeholder="VD: 10/10"
                                        />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={12}>
                                    <Form.Item label="Thính lực">
                                        <Input
                                            name="hearing"
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            value={values.hearing}
                                            placeholder="VD: Bình thường"
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={24}>
                                <Col xs={24} md={12}>
                                    <Form.Item label="Chiều cao (cm)">
                                        <Input
                                            name="height"
                                            type="number"
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            value={values.height}
                                            placeholder="VD: 150"
                                        />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={12}>
                                    <Form.Item label="Cân nặng (kg)">
                                        <Input
                                            name="weight"
                                            type="number"
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            value={values.weight}
                                            placeholder="VD: 45"
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Title level={4}>Thông tin bổ sung</Title>
                            <Form.Item label="Thuốc đang dùng">
                                <TextArea
                                    name="medications"
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    value={values.medications}
                                    placeholder="Nhập thông tin thuốc đang dùng (nếu có)"
                                    rows={3}
                                />
                            </Form.Item>

                            <Form.Item label="Lịch sử điều trị">
                                <TextArea
                                    name="treatmentHistory"
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    value={values.treatmentHistory}
                                    placeholder="Nhập lịch sử điều trị (nếu có)"
                                    rows={3}
                                />
                            </Form.Item>

                            <Form.Item label="Ghi chú">
                                <TextArea
                                    name="notes"
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    value={values.notes}
                                    placeholder="Nhập ghi chú bổ sung (nếu có)"
                                    rows={3}
                                />
                            </Form.Item>

                            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                                <Button
                                    onClick={() => setIsEditModalVisible(false)}
                                    size="large"
                                >
                                    Hủy
                                </Button>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    size="large"
                                    loading={isSubmitting}
                                    className="bg-[#36ae9a] hover:bg-[#2a8a7a] border-[#36ae9a]"
                                >
                                    Lưu thay đổi
                                </Button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </Modal>
        </div>
    );
};

export default HealthProfile;
