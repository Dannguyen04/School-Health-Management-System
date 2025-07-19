import React, { useEffect, useState } from "react";
import {
    Table,
    Button,
    Checkbox,
    Modal,
    message,
    Spin,
    Typography,
    Select,
    Space,
    Card,
    Alert,
    Divider,
    Row,
    Col,
    Statistic,
} from "antd";
import {
    ExclamationCircleOutlined,
    CheckCircleOutlined,
    TrophyOutlined,
    UserOutlined,
    ArrowUpOutlined,
} from "@ant-design/icons";
import axios from "../../utils/api";

const { Title, Text } = Typography;
const { Option } = Select;

const SchoolYearPromotion = () => {
    const [graduating, setGraduating] = useState([]);
    const [promoting, setPromoting] = useState([]);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState("");
    const [resultType, setResultType] = useState("success");
    const [currentAcademicYear, setCurrentAcademicYear] = useState("");
    const [newAcademicYear, setNewAcademicYear] = useState("");
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Lấy dữ liệu preview và năm học hiện tại
                const res = await axios.get("/school-year/preview-promotion");
                setGraduating(res.data.graduating);
                setPromoting(res.data.promoting);

                // Lấy năm học hiện tại
                const currentYear = res.data.currentAcademicYear || "";
                setCurrentAcademicYear(currentYear);

                // Tự động tính năm học mới
                if (currentYear) {
                    const match = currentYear.match(/^(\d{4})-(\d{4})$/);
                    if (match) {
                        const startYear = parseInt(match[1]);
                        const endYear = parseInt(match[2]);
                        const newStartYear = startYear + 1;
                        const newEndYear = endYear + 1;
                        const calculatedNewYear = `${newStartYear}-${newEndYear}`;
                        setNewAcademicYear(calculatedNewYear);
                    }
                }
            } catch (err) {
                setResult(
                    "Lỗi tải dữ liệu: " +
                        (err.response?.data?.error || err.message)
                );
                setResultType("error");
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    // Hàm tăng class
    function nextClass(currentClass) {
        const match = currentClass.match(/^([0-9]+)([A-Za-z]*)$/);
        if (!match) return currentClass;
        const newNumber = parseInt(match[1], 10) + 1;
        return newNumber + (match[2] || "");
    }

    // Hàm nhóm học sinh theo lớp
    const groupStudentsByClass = (students) => {
        const grouped = {};
        students.forEach((student) => {
            const className = student.class;
            if (!grouped[className]) {
                grouped[className] = [];
            }
            grouped[className].push(student);
        });
        return grouped;
    };

    // Hàm mở modal chi tiết
    const handleViewDetail = (student) => {
        setSelectedStudent(student);
        setDetailModalOpen(true);
    };

    // Xác nhận chuyển năm học
    const handlePromote = () => {
        if (!newAcademicYear) {
            message.error("Không thể tính toán năm học mới!");
            return;
        }

        Modal.confirm({
            title: "Xác nhận chuyển năm học",
            icon: <ExclamationCircleOutlined />,
            content: (
                <div>
                    <p>
                        Bạn chắc chắn muốn chuyển năm học cho{" "}
                        <strong>{promoting.length + graduating.length}</strong>{" "}
                        học sinh?
                    </p>
                    <p>
                        <strong>Năm học hiện tại:</strong> {currentAcademicYear}
                    </p>
                    <p>
                        <strong>Năm học mới:</strong> {newAcademicYear}
                    </p>
                    <p style={{ color: "#ff4d4f" }}>
                        Thao tác này không thể hoàn tác.
                    </p>
                </div>
            ),
            okText: "Xác nhận",
            cancelText: "Hủy",
            onOk: async () => {
                setLoading(true);
                setResult("");
                try {
                    const response = await axios.post("/school-year/promote", {
                        graduateIds: graduating.map((s) => s.id),
                        promoteIds: promoting.map((s) => s.id),
                        newAcademicYear: newAcademicYear,
                    });
                    setResult(
                        `Chuyển năm học thành công! Năm học mới: ${response.data.newAcademicYear}`
                    );
                    setResultType("success");
                    message.success("Chuyển năm học thành công!");
                } catch (err) {
                    setResult(
                        "Có lỗi xảy ra: " +
                            (err.response?.data?.error || err.message)
                    );
                    setResultType("error");
                    message.error("Có lỗi xảy ra khi chuyển năm học!");
                }
                setLoading(false);
            },
        });
    };

    return (
        <div
            className="school-year-promotion-container"
            style={{
                padding: "16px 0",
                maxWidth: "100%",
                width: "100%",
                // Responsive cho màn hình lớn
                "@media (min-width: 1200px)": {
                    padding: "0 24px",
                },
            }}
        >
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col span={8}>
                    <Card
                        size="small"
                        style={{ textAlign: "center", background: "#f0f8ff" }}
                    >
                        <Statistic
                            title="Học sinh sẽ lên lớp"
                            value={promoting.length}
                            prefix={<UserOutlined />}
                            valueStyle={{ color: "#1890ff", fontSize: 24 }}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card
                        size="small"
                        style={{ textAlign: "center", background: "#f6ffed" }}
                    >
                        <Statistic
                            title="Học sinh cuối cấp"
                            value={graduating.length}
                            prefix={<TrophyOutlined />}
                            valueStyle={{ color: "#52c41a", fontSize: 24 }}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card
                        size="small"
                        style={{ textAlign: "center", background: "#fff7e6" }}
                    >
                        <Statistic
                            title="Tổng cộng"
                            value={promoting.length + graduating.length}
                            prefix={<ArrowUpOutlined />}
                            valueStyle={{ color: "#fa8c16", fontSize: 24 }}
                        />
                    </Card>
                </Col>
            </Row>

            <Card
                title="Thông tin chuyển năm học"
                style={{ marginBottom: 16, width: "100%" }}
            >
                <Space direction="vertical" style={{ width: "100%" }}>
                    <Row gutter={[16, 16]}>
                        <Col span={12}>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                }}
                            >
                                <Text strong>Năm học hiện tại:</Text>
                                <Text
                                    code
                                    style={{ fontSize: 16, color: "#1890ff" }}
                                >
                                    {currentAcademicYear || "Đang tải..."}
                                </Text>
                            </div>
                        </Col>
                        <Col span={12}>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                }}
                            >
                                <Text strong>Năm học mới:</Text>
                                <Text
                                    code
                                    style={{ fontSize: 16, color: "#52c41a" }}
                                >
                                    {newAcademicYear || "Đang tính toán..."}
                                </Text>
                            </div>
                        </Col>
                    </Row>
                    <Alert
                        message="Thông tin chuyển năm học"
                        description={`Học sinh khối 5 sẽ tốt nghiệp, các khối khác sẽ lên lớp. Tất cả học sinh sẽ được chuyển từ năm học ${currentAcademicYear} sang năm học ${newAcademicYear} tự động.`}
                        type="info"
                        showIcon
                        style={{ marginTop: 8 }}
                    />
                </Space>
            </Card>

            <Spin spinning={loading}>
                {graduating.length > 0 && (
                    <Card
                        title={
                            <Space>
                                <TrophyOutlined style={{ color: "#52c41a" }} />
                                <Text strong>
                                    Lớp sẽ tốt nghiệp -{" "}
                                    {
                                        Object.keys(
                                            groupStudentsByClass(graduating)
                                        ).length
                                    }{" "}
                                    lớp
                                </Text>
                            </Space>
                        }
                        style={{ marginBottom: 16, width: "100%" }}
                        size="small"
                    >
                        <Row gutter={[16, 16]}>
                            {Object.entries(
                                groupStudentsByClass(graduating)
                            ).map(([className, students]) => (
                                <Col span={8} key={className}>
                                    <Card
                                        size="small"
                                        title={
                                            <Text
                                                strong
                                                style={{ fontSize: 14 }}
                                            >
                                                Lớp {className} -{" "}
                                                {students.length} học sinh
                                            </Text>
                                        }
                                        style={{
                                            marginBottom: 8,
                                            border: "1px solid #d9d9d9",
                                            backgroundColor: "#f6ffed",
                                        }}
                                    >
                                        <div style={{ textAlign: "center" }}>
                                            <TrophyOutlined
                                                style={{
                                                    fontSize: 24,
                                                    color: "#52c41a",
                                                    marginBottom: 8,
                                                }}
                                            />
                                            <br />
                                            <Text type="success" strong>
                                                Sẽ tốt nghiệp
                                            </Text>
                                        </div>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </Card>
                )}

                <Card
                    title={
                        <Space>
                            <Text strong>
                                Lớp sẽ lên lớp -{" "}
                                {
                                    Object.keys(groupStudentsByClass(promoting))
                                        .length
                                }{" "}
                                lớp
                            </Text>
                        </Space>
                    }
                    style={{ marginBottom: 16, width: "100%" }}
                    size="small"
                >
                    {/* Hiển thị theo lớp - Layout ngang */}
                    <Row gutter={[16, 16]}>
                        {Object.entries(groupStudentsByClass(promoting)).map(
                            ([className, students]) => (
                                <Col span={8} key={className}>
                                    <Card
                                        size="small"
                                        title={
                                            <Text
                                                strong
                                                style={{ fontSize: 14 }}
                                            >
                                                Lớp {className} -{" "}
                                                {students.length} học sinh
                                            </Text>
                                        }
                                        style={{
                                            marginBottom: 8,
                                            border: "1px solid #d9d9d9",
                                            backgroundColor: "#f0f8ff",
                                        }}
                                    >
                                        <div style={{ textAlign: "center" }}>
                                            <ArrowUpOutlined
                                                style={{
                                                    fontSize: 24,
                                                    color: "#1890ff",
                                                    marginBottom: 8,
                                                }}
                                            />
                                            <br />
                                            <Text
                                                strong
                                                style={{ color: "#1890ff" }}
                                            >
                                                Lên lớp {nextClass(className)}
                                            </Text>
                                            <br />
                                            <Text
                                                type="secondary"
                                                style={{ fontSize: 12 }}
                                            >
                                                {students.length} học sinh
                                            </Text>
                                        </div>
                                    </Card>
                                </Col>
                            )
                        )}
                    </Row>
                </Card>

                <div style={{ textAlign: "center", marginTop: 24 }}>
                    <Space direction="vertical" size="middle">
                        <div>
                            <Text type="secondary">
                                Tổng cộng: {graduating.length} học sinh tốt
                                nghiệp + {promoting.length} học sinh lên lớp
                            </Text>
                        </div>
                        <Button
                            type="primary"
                            size="large"
                            onClick={handlePromote}
                            disabled={!newAcademicYear}
                            loading={loading}
                            icon={<ArrowUpOutlined />}
                            style={{
                                height: 48,
                                fontSize: 16,
                                fontWeight: 600,
                                minWidth: 300,
                            }}
                        >
                            Xác nhận chuyển năm học ({promoting.length} học
                            sinh)
                        </Button>
                        {!newAcademicYear && (
                            <Text type="warning" style={{ fontSize: 12 }}>
                                ⚠️ Đang tính toán năm học mới...
                            </Text>
                        )}
                    </Space>
                </div>

                {result && (
                    <Alert
                        message={
                            resultType === "success" ? "Thành công" : "Lỗi"
                        }
                        description={result}
                        type={resultType}
                        showIcon
                        style={{ marginTop: 16 }}
                    />
                )}
            </Spin>

            {/* Modal chi tiết học sinh */}
            <Modal
                open={detailModalOpen}
                title="Chi tiết học sinh"
                onCancel={() => setDetailModalOpen(false)}
                footer={[
                    <Button
                        key="close"
                        onClick={() => setDetailModalOpen(false)}
                    >
                        Đóng
                    </Button>,
                ]}
                width={1400}
                style={{ top: 20 }}
            >
                {selectedStudent && (
                    <div>
                        <Row gutter={[16, 16]}>
                            <Col span={8}>
                                <Card size="small" title="Thông tin học sinh">
                                    <div>
                                        <Text strong>Tên học sinh:</Text>{" "}
                                        {selectedStudent.user?.fullName ||
                                            "Chưa có tên"}
                                    </div>
                                    <div>
                                        <Text strong>Lớp hiện tại:</Text>{" "}
                                        {selectedStudent.class} (Khối{" "}
                                        {selectedStudent.grade})
                                    </div>
                                    <div>
                                        <Text strong>Lớp mới:</Text>{" "}
                                        {nextClass(selectedStudent.class)} (Khối{" "}
                                        {parseInt(selectedStudent.grade) + 1})
                                    </div>
                                    <div>
                                        <Text strong>Năm học hiện tại:</Text>{" "}
                                        {selectedStudent.academicYear ||
                                            "Chưa có"}
                                    </div>
                                </Card>
                            </Col>
                            <Col span={8}>
                                <Card size="small" title="Thống kê theo lớp">
                                    <div>
                                        <Text strong>
                                            Học sinh cùng lớp (
                                            {selectedStudent.class}):
                                        </Text>
                                        <br />
                                        <Text type="secondary">
                                            {
                                                promoting.filter(
                                                    (s) =>
                                                        s.class ===
                                                        selectedStudent.class
                                                ).length
                                            }{" "}
                                            học sinh
                                        </Text>
                                    </div>
                                    <div style={{ marginTop: 8 }}>
                                        <Text strong>Học sinh cùng khối:</Text>
                                        <br />
                                        <Text type="secondary">
                                            {
                                                promoting.filter(
                                                    (s) =>
                                                        s.grade ===
                                                        selectedStudent.grade
                                                ).length
                                            }{" "}
                                            học sinh
                                        </Text>
                                    </div>
                                </Card>
                            </Col>
                            <Col span={8}>
                                <Card size="small" title="Thống kê tổng quan">
                                    <div>
                                        <Text strong>
                                            Tổng học sinh lên lớp:
                                        </Text>
                                        <br />
                                        <Text type="secondary">
                                            {promoting.length} học sinh
                                        </Text>
                                    </div>
                                    <div style={{ marginTop: 8 }}>
                                        <Text strong>Số lớp:</Text>
                                        <br />
                                        <Text type="secondary">
                                            {
                                                Object.keys(
                                                    groupStudentsByClass(
                                                        promoting
                                                    )
                                                ).length
                                            }{" "}
                                            lớp
                                        </Text>
                                    </div>
                                </Card>
                            </Col>
                        </Row>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default SchoolYearPromotion;
