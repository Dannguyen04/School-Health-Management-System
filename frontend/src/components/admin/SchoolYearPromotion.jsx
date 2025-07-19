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
} from "antd";
import {
    ExclamationCircleOutlined,
    CheckCircleOutlined,
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
            title: "Mã học sinh",
            dataIndex: "userId",
            key: "userId",
        },
        {
            title: "Lớp hiện tại → Lớp mới",
            dataIndex: "class",
            key: "class",
            render: (text, record) => (
                <span>
                    {record.class} (Khối {record.grade}) →{" "}
                    <b>{nextClass(record.class)}</b> (Khối{" "}
                    <b>{parseInt(record.grade) + 1}</b>)
                </span>
            ),
        },
        {
            title: "Năm học hiện tại",
            dataIndex: "academicYear",
            key: "academicYear",
            render: (text) => text || "Chưa có",
        },
        {
            title: "Chọn",
            dataIndex: "id",
            key: "select",
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

    // Chọn/bỏ chọn học sinh
    const handleSelect = (id) => {
        setSelectedPromoting((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    // Xác nhận chuyển năm học
    const handlePromote = () => {
        Modal.confirm({
            title: "Xác nhận chuyển năm học",
            icon: <ExclamationCircleOutlined />,
            content: `Bạn chắc chắn muốn chuyển năm học cho ${selectedPromoting.length} học sinh này? Thao tác này không thể hoàn tác.`,
            okText: "Xác nhận",
            cancelText: "Hủy",
            onOk: async () => {
                setLoading(true);
                setResult("");
                try {
                    const response = await axios.post("/school-year/promote", {
                        graduateIds: [],
                        promoteIds: selectedPromoting,
                    });
                    setResult(
                        `Chuyển năm học thành công! Năm học mới: ${response.data.newAcademicYear}`
                    );
                    setResultType("success");
                } catch (err) {
                    setResult(
                        "Có lỗi xảy ra: " +
                            (err.response?.data?.error || err.message)
                    );
                    setResultType("error");
                }
                setLoading(false);
            },
        });
    };

    return (
        <div>
            <Title level={4}>Chuyển năm học mới</Title>

            <Space style={{ marginBottom: 16 }}>
                <Text strong>Năm học:</Text>
                <Select
                    style={{ width: 200 }}
                    placeholder="Chọn năm học"
                    value={selectedAcademicYear}
                    onChange={setSelectedAcademicYear}
                >
                    {academicYears.map((year) => (
                        <Option key={year} value={year}>
                            {year}
                        </Option>
                    ))}
                </Select>
            </Space>

            <Spin spinning={loading}>
                <div style={{ marginBottom: 16 }}>
                    <Text strong>Học sinh cuối cấp (sẽ tốt nghiệp):</Text>
                    <ul>
                        {graduating.length === 0 && (
                            <li>Không có học sinh cuối cấp.</li>
                        )}
                        {graduating.map((s) => (
                            <li key={s.id}>
                                [{s.class}] - {s.userId} (Khối {s.grade}) - Năm
                                học: {s.academicYear || "Chưa có"}
                            </li>
                        ))}
                    </ul>
                </div>
                <div style={{ marginBottom: 16 }}>
                    <Text strong>Học sinh sẽ lên lớp:</Text>
                    <Table
                        dataSource={promoting}
                        columns={columns}
                        rowKey="id"
                        pagination={false}
                        size="small"
                        bordered
                    />
                </div>
                <Button
                    type="primary"
                    onClick={handlePromote}
                    disabled={selectedPromoting.length === 0}
                    loading={loading}
                >
                    Xác nhận chuyển năm học
                </Button>
                {result && (
                    <div style={{ marginTop: 16 }}>
                        {resultType === "success" ? (
                            <Text type="success">
                                <CheckCircleOutlined /> {result}
                            </Text>
                        ) : (
                            <Text type="danger">
                                <ExclamationCircleOutlined /> {result}
                            </Text>
                        )}
                    </div>
                )}
            </Spin>
        </div>
    );
};

export default SchoolYearPromotion;
