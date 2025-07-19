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
    const [selectedPromoting, setSelectedPromoting] = useState([]);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState("");
    const [resultType, setResultType] = useState("success");
    const [academicYears, setAcademicYears] = useState([]);
    const [selectedAcademicYear, setSelectedAcademicYear] = useState("");
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [classViewModalOpen, setClassViewModalOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Lấy danh sách năm học
                const yearsRes = await axios.get("/school-year/academic-years");
                const years = yearsRes.data.academicYears || [];
                setAcademicYears(years);

                // Lấy dữ liệu preview
                const res = await axios.get("/school-year/preview-promotion");
                setGraduating(res.data.graduating);
                setPromoting(res.data.promoting);
                setSelectedPromoting(res.data.promoting.map((s) => s.id));
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

    // Table columns
    const columns = [
        {
            title: "Tên học sinh",
            dataIndex: "fullName",
            key: "fullName",
            width: 200,
            render: (text, record) => (
                <Space>
                    <Text strong>{record.user?.fullName || "Chưa có tên"}</Text>
                    <Button
                        type="link"
                        size="small"
                        onClick={() => handleViewDetail(record)}
                        style={{ padding: 0, height: "auto" }}
                    >
                        <UserOutlined />
                    </Button>
                </Space>
            ),
        },
        {
            title: "Lớp hiện tại",
            dataIndex: "class",
            key: "currentClass",
            width: 120,
            align: "center",
            render: (text, record) => (
                <Text
                    code
                    style={{
                        fontSize: "14px",
                        backgroundColor: "#f5f5f5",
                        padding: "2px 6px",
                        borderRadius: "4px",
                    }}
                >
                    {text} (Khối {record.grade})
                </Text>
            ),
        },
        {
            title: "Lớp mới",
            dataIndex: "class",
            key: "newClass",
            width: 120,
            align: "center",
            render: (text, record) => (
                <Space>
                    <ArrowUpOutlined style={{ color: "#ffffff" }} />
                    <Text strong style={{ color: "#ffffff", fontSize: "14px" }}>
                        {nextClass(text)} (Khối {parseInt(record.grade) + 1})
                    </Text>
                </Space>
            ),
        },
        {
            title: "Chọn",
            dataIndex: "id",
            key: "select",
            width: 80,
            align: "center",
            render: (id) => (
                <Checkbox
                    checked={selectedPromoting.includes(id)}
                    onChange={() => handleSelect(id)}
                />
            ),
        },
    ];

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

    // Chọn/bỏ chọn học sinh
    const handleSelect = (id) => {
        setSelectedPromoting((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    // Chọn tất cả/bỏ chọn tất cả
    const handleSelectAll = (checked) => {
        if (checked) {
            setSelectedPromoting(promoting.map((s) => s.id));
        } else {
            setSelectedPromoting([]);
        }
    };

    // Xác nhận chuyển năm học
    const handlePromote = () => {
        if (!selectedAcademicYear) {
            message.error("Vui lòng chọn năm học mới!");
            return;
        }

        Modal.confirm({
            title: "Xác nhận chuyển năm học",
            icon: <ExclamationCircleOutlined />,
            content: (
                <div>
                    <p>
                        Bạn chắc chắn muốn chuyển năm học cho{" "}
                        <strong>{selectedPromoting.length}</strong> học sinh?
                    </p>
                    <p>
                        <strong>Năm học mới:</strong> {selectedAcademicYear}
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
                        graduateIds: [],
                        promoteIds: selectedPromoting,
                        newAcademicYear: selectedAcademicYear,
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
        <div style={{ padding: "16px 0" }}>
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col span={12}>
                    <Card size="small">
                        <Statistic
                            title="Học sinh sẽ lên lớp"
                            value={promoting.length}
                            prefix={<UserOutlined />}
                            valueStyle={{ color: "#1890ff" }}
                        />
                    </Card>
                </Col>
                <Col span={12}>
                    <Card size="small">
                        <Statistic
                            title="Học sinh cuối cấp"
                            value={graduating.length}
                            prefix={<TrophyOutlined />}
                            valueStyle={{ color: "#52c41a" }}
                        />
                    </Card>
                </Col>
            </Row>

            <Card title="Cài đặt chuyển năm học" style={{ marginBottom: 16 }}>
                <Space direction="vertical" style={{ width: "100%" }}>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                        }}
                    >
                        <Text strong>Năm học mới:</Text>
                        <Select
                            style={{ width: 200 }}
                            placeholder="Chọn năm học mới"
                            value={selectedAcademicYear}
                            onChange={setSelectedAcademicYear}
                            showSearch
                            filterOption={(input, option) =>
                                option.children
                                    .toLowerCase()
                                    .includes(input.toLowerCase())
                            }
                        >
                            {academicYears.map((year) => (
                                <Option key={year} value={year}>
                                    {year}
                                </Option>
                            ))}
                        </Select>
                        {selectedAcademicYear && (
                            <Text type="success" style={{ fontSize: 12 }}>
                                ✓ Đã chọn năm học mới
                            </Text>
                        )}
                    </div>
                    <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                        <Button
                            type="dashed"
                            icon={<UserOutlined />}
                            onClick={() => setClassViewModalOpen(true)}
                        >
                            Xem theo lớp (
                            {
                                Object.keys(groupStudentsByClass(promoting))
                                    .length
                            }{" "}
                            lớp)
                        </Button>
                    </div>
                    <Alert
                        message="Hướng dẫn"
                        description="Học sinh khối 5 sẽ tốt nghiệp, các khối khác sẽ lên lớp. Vui lòng kiểm tra danh sách trước khi xác nhận."
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
                                    Học sinh cuối cấp (sẽ tốt nghiệp) -{" "}
                                    {graduating.length} học sinh
                                </Text>
                            </Space>
                        }
                        style={{ marginBottom: 16 }}
                        size="small"
                    >
                        <Table
                            dataSource={graduating}
                            columns={[
                                {
                                    title: "Tên học sinh",
                                    dataIndex: "fullName",
                                    key: "fullName",
                                    width: 200,
                                    render: (text, record) => (
                                        <Text strong>
                                            {record.user?.fullName ||
                                                "Chưa có tên"}
                                        </Text>
                                    ),
                                },
                                {
                                    title: "Lớp hiện tại",
                                    dataIndex: "class",
                                    key: "class",
                                    align: "center",
                                    width: 120,
                                    render: (text, record) => (
                                        <Text
                                            code
                                            style={{
                                                fontSize: "14px",
                                                backgroundColor: "#f5f5f5",
                                                padding: "2px 6px",
                                                borderRadius: "4px",
                                            }}
                                        >
                                            {text} (Khối {record.grade})
                                        </Text>
                                    ),
                                },
                                {
                                    title: "Trạng thái",
                                    key: "status",
                                    align: "center",
                                    width: 150,
                                    render: () => (
                                        <Text
                                            type="success"
                                            strong
                                            style={{
                                                backgroundColor: "#f6ffed",
                                                padding: "4px 8px",
                                                borderRadius: "4px",
                                                border: "1px solid #b7eb8f",
                                            }}
                                        >
                                            <TrophyOutlined
                                                style={{
                                                    marginRight: 4,
                                                    color: "#52c41a",
                                                }}
                                            />
                                            Sẽ tốt nghiệp
                                        </Text>
                                    ),
                                },
                            ]}
                            rowKey="id"
                            pagination={false}
                            size="small"
                            bordered
                            scroll={{ x: 500 }}
                        />
                    </Card>
                )}

                <Card
                    title={
                        <Space>
                            <Text strong>
                                Học sinh sẽ lên lớp - {promoting.length} học
                                sinh
                            </Text>
                            <Checkbox
                                checked={
                                    selectedPromoting.length ===
                                        promoting.length && promoting.length > 0
                                }
                                indeterminate={
                                    selectedPromoting.length > 0 &&
                                    selectedPromoting.length < promoting.length
                                }
                                onChange={(e) =>
                                    handleSelectAll(e.target.checked)
                                }
                            >
                                Chọn tất cả ({selectedPromoting.length}/
                                {promoting.length})
                            </Checkbox>
                        </Space>
                    }
                    style={{ marginBottom: 16 }}
                    size="small"
                >
                    {/* Hiển thị theo lớp */}
                    {Object.entries(groupStudentsByClass(promoting)).map(
                        ([className, students]) => (
                            <div key={className} style={{ marginBottom: 16 }}>
                                <div
                                    style={{
                                        background: "#f0f8ff",
                                        padding: "8px 12px",
                                        borderRadius: "4px",
                                        marginBottom: 8,
                                        border: "1px solid #d9d9d9",
                                    }}
                                >
                                    <Text strong style={{ fontSize: 14 }}>
                                        Lớp {className} - {students.length} học
                                        sinh
                                    </Text>
                                </div>
                                <Table
                                    dataSource={students}
                                    columns={[
                                        {
                                            title: "Tên học sinh",
                                            dataIndex: "fullName",
                                            key: "fullName",
                                            width: 200,
                                            render: (text, record) => (
                                                <Text strong>
                                                    {record.user?.fullName ||
                                                        "Chưa có tên"}
                                                </Text>
                                            ),
                                        },
                                        {
                                            title: "Lớp hiện tại",
                                            dataIndex: "class",
                                            key: "currentClass",
                                            width: 120,
                                            align: "center",
                                            render: (text, record) => (
                                                <Text
                                                    code
                                                    style={{
                                                        fontSize: "14px",
                                                        backgroundColor:
                                                            "#f5f5f5",
                                                        padding: "2px 6px",
                                                        borderRadius: "4px",
                                                    }}
                                                >
                                                    {text} (Khối {record.grade})
                                                </Text>
                                            ),
                                        },
                                        {
                                            title: "Lớp mới",
                                            dataIndex: "class",
                                            key: "newClass",
                                            width: 120,
                                            align: "center",
                                            render: (text, record) => (
                                                <Space>
                                                    <ArrowUpOutlined
                                                        style={{
                                                            color: "#1890ff",
                                                        }}
                                                    />
                                                    <Text
                                                        strong
                                                        style={{
                                                            color: "#1890ff",
                                                            fontSize: "14px",
                                                        }}
                                                    >
                                                        {nextClass(text)} (Khối{" "}
                                                        {parseInt(
                                                            record.grade
                                                        ) + 1}
                                                        )
                                                    </Text>
                                                </Space>
                                            ),
                                        },
                                        {
                                            title: "Chọn",
                                            dataIndex: "id",
                                            key: "select",
                                            width: 80,
                                            align: "center",
                                            render: (id) => (
                                                <Checkbox
                                                    checked={selectedPromoting.includes(
                                                        id
                                                    )}
                                                    onChange={() =>
                                                        handleSelect(id)
                                                    }
                                                />
                                            ),
                                        },
                                    ]}
                                    rowKey="id"
                                    pagination={false}
                                    size="small"
                                    bordered
                                    scroll={{ x: 600 }}
                                    rowClassName={(record) =>
                                        selectedPromoting.includes(record.id)
                                            ? "ant-table-row-selected"
                                            : "promotion-table-row"
                                    }
                                />
                            </div>
                        )
                    )}
                </Card>

                <div style={{ textAlign: "center", marginTop: 24 }}>
                    <Space direction="vertical" size="middle">
                        <div>
                            <Text type="secondary">
                                Tổng cộng: {graduating.length} học sinh tốt
                                nghiệp + {selectedPromoting.length} học sinh lên
                                lớp
                            </Text>
                        </div>
                        <Button
                            type="primary"
                            size="large"
                            onClick={handlePromote}
                            disabled={
                                selectedPromoting.length === 0 ||
                                !selectedAcademicYear
                            }
                            loading={loading}
                            icon={<ArrowUpOutlined />}
                            style={{
                                height: 48,
                                fontSize: 16,
                                fontWeight: 600,
                                minWidth: 300,
                            }}
                        >
                            Xác nhận chuyển năm học ({selectedPromoting.length}{" "}
                            học sinh)
                        </Button>
                        {!selectedAcademicYear && (
                            <Text type="warning" style={{ fontSize: 12 }}>
                                ⚠️ Vui lòng chọn năm học mới trước khi xác nhận
                            </Text>
                        )}
                        {selectedPromoting.length === 0 &&
                            selectedAcademicYear && (
                                <Text type="warning" style={{ fontSize: 12 }}>
                                    ⚠️ Vui lòng chọn ít nhất 1 học sinh để lên
                                    lớp
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
                width={1000}
                style={{ top: 20 }}
            >
                {selectedStudent && (
                    <div>
                        <Row gutter={[16, 16]}>
                            <Col span={12}>
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
                            <Col span={12}>
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
                        </Row>
                    </div>
                )}
            </Modal>

            {/* Modal xem theo lớp */}
            <Modal
                open={classViewModalOpen}
                title="Xem theo lớp"
                onCancel={() => setClassViewModalOpen(false)}
                footer={[
                    <Button
                        key="close"
                        onClick={() => setClassViewModalOpen(false)}
                    >
                        Đóng
                    </Button>,
                ]}
                width={1400}
                style={{ top: 20 }}
            >
                <div>
                    {Object.entries(groupStudentsByClass(promoting)).map(
                        ([className, students]) => (
                            <Card
                                key={className}
                                title={`Lớp ${className} - ${students.length} học sinh`}
                                style={{ marginBottom: 16 }}
                                size="small"
                            >
                                <Table
                                    dataSource={students}
                                    columns={[
                                        {
                                            title: "Tên học sinh",
                                            dataIndex: "fullName",
                                            key: "fullName",
                                            render: (text, record) => (
                                                <Text strong>
                                                    {record.user?.fullName ||
                                                        "Chưa có tên"}
                                                </Text>
                                            ),
                                        },
                                        {
                                            title: "Lớp mới",
                                            key: "newClass",
                                            align: "center",
                                            render: (text, record) => (
                                                <Text
                                                    strong
                                                    style={{ color: "#1890ff" }}
                                                >
                                                    {nextClass(record.class)}{" "}
                                                    (Khối{" "}
                                                    {parseInt(record.grade) + 1}
                                                    )
                                                </Text>
                                            ),
                                        },
                                        {
                                            title: "Chọn",
                                            key: "select",
                                            align: "center",
                                            width: 80,
                                            render: (id, record) => (
                                                <Checkbox
                                                    checked={selectedPromoting.includes(
                                                        record.id
                                                    )}
                                                    onChange={() =>
                                                        handleSelect(record.id)
                                                    }
                                                />
                                            ),
                                        },
                                    ]}
                                    rowKey="id"
                                    pagination={false}
                                    size="small"
                                    bordered
                                />
                            </Card>
                        )
                    )}
                </div>
            </Modal>

            <style jsx>{`
                .promotion-table-row {
                    background-color: #f0f8ff !important;
                }
                .promotion-table-row:hover {
                    background-color: #e6f7ff !important;
                }
                .ant-table-row-selected {
                    background-color: #1890ff !important;
                    color: #ffffff !important;
                }
                .ant-table-row-selected:hover {
                    background-color: #40a9ff !important;
                }
                .ant-table-row-selected .ant-typography {
                    color: #ffffff !important;
                }
                .ant-table-row-selected .ant-typography code {
                    background-color: rgba(255, 255, 255, 0.2) !important;
                    color: #ffffff !important;
                }
            `}</style>
        </div>
    );
};

export default SchoolYearPromotion;
