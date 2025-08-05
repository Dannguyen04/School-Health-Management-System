import {
    HeartOutlined,
    ExclamationCircleOutlined,
    PlusOutlined,
} from "@ant-design/icons";
import {
    Button,
    Select,
    Spin,
    Table,
    Typography,
    Alert,
    Empty,
    message,
    Card,
} from "antd";
import dayjs from "dayjs";
import { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import VaccinationDetailModal from "../components/parent/VaccinationDetailModal";
import { parentAPI } from "../utils/api";

const { Title } = Typography;

// Constants
const PAGINATION_CONFIG = {
    pageSize: 10,
    showSizeChanger: true,
    showQuickJumper: true,
    pageSizeOptions: ["10", "20", "50"],
    showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} bản ghi`,
};

const ERROR_MESSAGES = {
    FETCH_CHILDREN: "Không thể tải danh sách học sinh",
    FETCH_VACCINATIONS: "Không thể tải lịch sử tiêm chủng",
    FETCH_DETAIL: "Không thể tải chi tiết tiêm chủng",
    NO_CHILDREN: "Không tìm thấy học sinh nào",
};

const VaccinationHistory = () => {
    const navigate = useNavigate();

    // State management
    const [vaccinations, setVaccinations] = useState([]);
    const [selected, setSelected] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [children, setChildren] = useState([]);
    const [selectedChild, setSelectedChild] = useState(null);

    // Loading states
    const [childrenLoading, setChildrenLoading] = useState(true);
    const [vaccinationsLoading, setVaccinationsLoading] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);

    // Error states
    const [error, setError] = useState(null);

    // Fetch children data
    const fetchChildren = useCallback(async () => {
        try {
            setChildrenLoading(true);
            setError(null);

            const res = await parentAPI.getChildren();
            const childrenArr = res.data?.data || [];

            if (childrenArr.length === 0) {
                setError(ERROR_MESSAGES.NO_CHILDREN);
                setChildren([]);
                return;
            }

            const formattedChildren = childrenArr.map((child) => ({
                value: child.studentId,
                label: child.fullName,
                class: child.class,
                avatar: child.avatar, // If available
            }));

            setChildren(formattedChildren);
            setSelectedChild(childrenArr[0].studentId);
        } catch (err) {
            console.error("Error fetching children:", err);
            setError(ERROR_MESSAGES.FETCH_CHILDREN);
            setChildren([]);
        } finally {
            setChildrenLoading(false);
        }
    }, []);

    // Fetch vaccination history
    const fetchVaccinationHistory = useCallback(async (childId) => {
        if (!childId) {
            setVaccinations([]);
            return;
        }

        try {
            setVaccinationsLoading(true);
            setError(null);

            const res = await parentAPI.getVaccinationHistory(childId);

            if (res.data.success) {
                setVaccinations(res.data.data || []);
            } else {
                throw new Error(
                    res.data.message || "Failed to fetch vaccinations"
                );
            }
        } catch (err) {
            console.error("Error fetching vaccination history:", err);
            setError(ERROR_MESSAGES.FETCH_VACCINATIONS);
            setVaccinations([]);
            message.error(ERROR_MESSAGES.FETCH_VACCINATIONS);
        } finally {
            setVaccinationsLoading(false);
        }
    }, []);

    // Fetch vaccination detail
    const fetchVaccinationDetail = useCallback(async (campaignId, childId) => {
        try {
            setDetailLoading(true);

            const res = await parentAPI.getVaccinationDetail(
                campaignId,
                childId
            );

            if (res.data.success) {
                setSelected(res.data.data);
                setModalVisible(true);
            } else {
                throw new Error(res.data.message || "Failed to fetch detail");
            }
        } catch (err) {
            console.error("Error fetching vaccination detail:", err);
            message.error(ERROR_MESSAGES.FETCH_DETAIL);
        } finally {
            setDetailLoading(false);
        }
    }, []);

    // Effects
    useEffect(() => {
        fetchChildren();
    }, [fetchChildren]);

    useEffect(() => {
        fetchVaccinationHistory(selectedChild);
    }, [selectedChild, fetchVaccinationHistory]);

    // Memoized table columns
    const columns = useMemo(
        () => [
            {
                title: "Ngày tiêm",
                dataIndex: "administeredDate",
                key: "administeredDate",
                align: "center",
                width: 120,
                render: (date) =>
                    date ? dayjs(date).format("DD/MM/YYYY") : "-",
                sorter: (a, b) =>
                    dayjs(a.administeredDate).unix() -
                    dayjs(b.administeredDate).unix(),
            },
            {
                title: "Tên chiến dịch",
                dataIndex: ["campaign", "name"],
                key: "campaignName",
                width: 200,
                ellipsis: true,
                render: (text) => text || "-",
            },
            {
                title: "Tên vaccine",
                dataIndex: ["vaccine", "name"],
                key: "vaccineName",
                width: 180,
                render: (_, record) => record.vaccine?.name || "-",
            },
            {
                title: "Y tá thực hiện",
                dataIndex: ["nurse", "user", "fullName"],
                key: "nurseName",
                width: 150,
                ellipsis: true,
                render: (text) => text || "-",
            },
            {
                title: "Trạng thái",
                dataIndex: "status",
                key: "status",
                width: 100,
                align: "center",
                render: (status) => {
                    const statusConfig = {
                        completed: { color: "green", text: "Hoàn thành" },
                        pending: { color: "orange", text: "Chờ xử lý" },
                        cancelled: { color: "red", text: "Đã hủy" },
                    };
                    const config = statusConfig[status] || {
                        color: "default",
                        text: status || "-",
                    };
                    return (
                        <span style={{ color: config.color }}>
                            {config.text}
                        </span>
                    );
                },
            },
            {
                title: "Hành động",
                key: "action",
                align: "center",
                width: 120,
                render: (_, record) => (
                    <Button
                        type="primary"
                        size="small"
                        loading={detailLoading}
                        disabled={!record.campaign?.id}
                        onClick={() =>
                            fetchVaccinationDetail(
                                record.campaign.id,
                                selectedChild
                            )
                        }
                    >
                        Xem chi tiết
                    </Button>
                ),
            },
        ],
        [selectedChild, detailLoading, fetchVaccinationDetail]
    );

    // Handle child selection change
    const handleChildChange = useCallback((value) => {
        setSelectedChild(value);
        setError(null); // Clear previous errors
    }, []);

    // Handle modal close
    const handleModalClose = useCallback(() => {
        setModalVisible(false);
        setSelected(null);
    }, []);

    // Retry function
    const handleRetry = useCallback(() => {
        if (selectedChild) {
            fetchVaccinationHistory(selectedChild);
        } else {
            fetchChildren();
        }
    }, [selectedChild, fetchVaccinationHistory, fetchChildren]);

    // Loading state for initial load
    if (childrenLoading) {
        return (
            <div className="min-h-screen bg-[#f6fcfa] flex items-center justify-center">
                <Card className="text-center p-8">
                    <Spin size="large" />
                    <p className="mt-4 text-gray-600">
                        Đang tải danh sách học sinh...
                    </p>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f6fcfa]">
            <div className="w-full max-w-5xl mx-auto px-4 pt-24">
                {/* Header */}
                <div className="text-center mb-6">
                    <div className="inline-flex items-center gap-2 bg-[#d5f2ec] text-[#36ae9a] px-4 py-2 rounded-full text-sm font-medium mb-2">
                        <HeartOutlined className="text-[#36ae9a]" />
                        <span>Quản lý sức khỏe học sinh</span>
                    </div>
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">
                        Lịch sử tiêm chủng
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Xem lại toàn bộ lịch sử tiêm chủng của học sinh để theo
                        dõi quá trình bảo vệ sức khỏe.
                    </p>
                </div>

                {/* Error Alert */}
                {error && (
                    <Alert
                        message="Có lỗi xảy ra"
                        description={error}
                        type="error"
                        icon={<ExclamationCircleOutlined />}
                        action={
                            <Button size="small" onClick={handleRetry}>
                                Thử lại
                            </Button>
                        }
                        className="mb-4"
                        closable
                        onClose={() => setError(null)}
                    />
                )}

                {/* Controls */}
                <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
                    <Title
                        level={2}
                        className="!text-[#36ae9a] !mb-0 text-center md:text-left"
                    >
                        Lịch sử tiêm chủng tại trường
                    </Title>

                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                        {children.length > 0 && (
                            <Select
                                style={{
                                    width: "100%",
                                    minWidth: 220,
                                    maxWidth: 320,
                                }}
                                dropdownStyle={{
                                    borderRadius: 18,
                                    boxShadow:
                                        "0 8px 32px rgba(54, 174, 154, 0.15)",
                                }}
                                dropdownClassName="custom-student-dropdown"
                                value={selectedChild}
                                onChange={handleChildChange}
                                placeholder="Chọn học sinh"
                                size="large"
                                loading={childrenLoading}
                                className="w-full sm:w-auto"
                            >
                                {children.map((child) => (
                                    <Select.Option
                                        key={child.value}
                                        value={child.value}
                                        className="!py-3 !px-5 !text-lg hover:bg-[#e8f5f2]"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="font-semibold text-gray-800 truncate max-w-[140px]">
                                                {child.label}
                                            </span>
                                            <span className="text-gray-500 text-sm">
                                                {child.class}
                                            </span>
                                        </div>
                                    </Select.Option>
                                ))}
                            </Select>
                        )}

                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            size="large"
                            onClick={() =>
                                navigate("/parent/add-vaccination-history")
                            }
                            className="w-full sm:w-auto"
                        >
                            Thêm lịch sử ngoài trường
                        </Button>
                    </div>
                </div>

                {/* Table */}
                <Card className="rounded-xl shadow-sm">
                    {vaccinationsLoading ? (
                        <div className="text-center py-12">
                            <Spin size="large" />
                            <p className="mt-4 text-gray-600">
                                Đang tải lịch sử tiêm chủng...
                            </p>
                        </div>
                    ) : vaccinations.length === 0 ? (
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description={
                                <div className="text-center py-8">
                                    <p className="text-gray-500 text-lg mb-2">
                                        Chưa có lịch sử tiêm chủng
                                    </p>
                                    <p className="text-gray-400">
                                        {selectedChild
                                            ? "Học sinh này chưa có lịch sử tiêm chủng nào tại trường"
                                            : "Vui lòng chọn học sinh để xem lịch sử"}
                                    </p>
                                </div>
                            }
                        />
                    ) : (
                        <Table
                            dataSource={vaccinations}
                            columns={columns}
                            rowKey="id"
                            pagination={PAGINATION_CONFIG}
                            scroll={{ x: 1000 }}
                            className="vaccination-history-table"
                        />
                    )}
                </Card>

                {/* Statistics */}
                {vaccinations.length > 0 && (
                    <Card className="mt-6 rounded-xl shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                            <div>
                                <div className="text-2xl font-bold text-[#36ae9a]">
                                    {vaccinations.length}
                                </div>
                                <div className="text-gray-600">
                                    Tổng số lần tiêm
                                </div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-green-600">
                                    {
                                        vaccinations.filter(
                                            (v) => v.status === "completed"
                                        ).length
                                    }
                                </div>
                                <div className="text-gray-600">
                                    Đã hoàn thành
                                </div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-blue-600">
                                    {
                                        new Set(
                                            vaccinations
                                                .map((v) => v.vaccine?.name)
                                                .filter(Boolean)
                                        ).size
                                    }
                                </div>
                                <div className="text-gray-600">
                                    Loại vaccine
                                </div>
                            </div>
                        </div>
                    </Card>
                )}
            </div>

            {/* Modal */}
            <VaccinationDetailModal
                visible={modalVisible}
                vaccination={selected}
                onClose={handleModalClose}
            />
        </div>
    );
};

export default VaccinationHistory;
