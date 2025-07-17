import {
    Button,
    Card,
    Col,
    Descriptions,
    Divider,
    Modal,
    Row,
    Select,
    Spin,
    Statistic,
    Table,
    Tag,
    Typography,
    Checkbox,
} from "antd";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import axios from "axios";
import { useEffect, useState } from "react";

const VaccinationReports = () => {
    const [campaigns, setCampaigns] = useState([]);
    const [selectedCampaign, setSelectedCampaign] = useState(null);
    const [consents, setConsents] = useState([]);
    const [campaignDetail, setCampaignDetail] = useState(null);
    const [loading, setLoading] = useState(false);
    const [modal, setModal] = useState({ visible: false, consent: null });
    const [vaccineRecordDetail, setVaccineRecordDetail] = useState(null);

    // Fetch campaigns
    useEffect(() => {
        const fetchCampaigns = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get(
                    "/api/manager/vaccination-campaigns",
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                setCampaigns(res.data.data || []);
            } catch {
                setCampaigns([]);
            }
        };
        fetchCampaigns();
    }, []);

    // Fetch consents when campaign selected
    useEffect(() => {
        if (!selectedCampaign) return;
        const fetchConsents = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get(
                    `/api/manager/vaccination-campaigns/${selectedCampaign}/consents`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setCampaignDetail(res.data.data.campaign);
                setConsents(res.data.data.consents || []);
            } catch {
                setCampaignDetail(null);
                setConsents([]);
            } finally {
                setLoading(false);
            }
        };
        fetchConsents();
    }, [selectedCampaign]);

    const getConsentStatusTag = (consent) => {
        if (consent === true)
            return (
                <Tag color="green" icon={<CheckOutlined />}>
                    Đã đồng ý
                </Tag>
            );
        if (consent === false)
            return (
                <Tag color="red" icon={<CloseOutlined />}>
                    Đã từ chối
                </Tag>
            );
        return <Tag color="gold">Chưa xác nhận</Tag>;
    };

    const columns = [
        {
            title: "Học sinh",
            dataIndex: "studentName",
            key: "studentName",
            render: (text, record) => (
                <div>
                    <div className="font-semibold">{text}</div>
                    <div className="text-sm text-gray-500">
                        Lớp: {record.studentGrade}
                    </div>
                </div>
            ),
        },
        {
            title: "Phụ huynh",
            dataIndex: "parentName",
            key: "parentName",
        },
        {
            title: "Trạng thái xác nhận",
            dataIndex: "consent",
            key: "consent",
            render: (consent) => getConsentStatusTag(consent),
        },
        {
            title: "Ngày xác nhận",
            dataIndex: "submittedAt",
            key: "submittedAt",
            render: (date) => new Date(date).toLocaleDateString("vi-VN"),
        },
        {
            title: "Ghi chú",
            dataIndex: "notes",
            key: "notes",
            render: (notes, record) => {
                if (record.consent === false) {
                    return (
                        <span className="text-red-600">
                            {notes || "Không có lý do"}
                        </span>
                    );
                }
                return notes || "-";
            },
        },
        {
            title: "Thao tác",
            key: "action",
            render: (_, record) => (
                <Button
                    type="link"
                    onClick={() => setModal({ visible: true, consent: record })}
                >
                    Xem chi tiết
                </Button>
            ),
        },
    ];

    useEffect(() => {
        if (
            modal.visible &&
            modal.consent &&
            modal.consent.campaignId &&
            modal.consent.student?.id
        ) {
            const token = localStorage.getItem("accessToken");
            axios
                .get(
                    `/api/manager/vaccination-campaigns/vaccination-report/${modal.consent.campaignId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                )
                .then((res) => {
                    const data = res.data;
                    if (data.success && Array.isArray(data.data)) {
                        const record = data.data.find(
                            (r) => r.studentId === modal.consent.student.id
                        );
                        setVaccineRecordDetail(record || null);
                    } else {
                        setVaccineRecordDetail(null);
                    }
                })
                .catch(() => setVaccineRecordDetail(null));
        } else {
            setVaccineRecordDetail(null);
        }
    }, [modal.visible, modal.consent]);

    return (
        <div className="min-h-screen bg-[#f6cfa] p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-6">
                    <Typography.Title level={3} className="text-center mb-2">
                        Báo cáo tiêm chủng
                    </Typography.Title>
                    <Typography.Text
                        type="secondary"
                        className="text-center block"
                    >
                        Theo dõi và quản lý các phiếu đồng ý tiêm chủng
                    </Typography.Text>
                </div>

                <Row gutter={[16, 16]} className="mb-6">
                    <Col span={8}>
                        <Card>
                            <Statistic
                                title="Tổng số phiếu"
                                value={consents.length}
                                valueStyle={{ color: "#36ae9a" }}
                            />
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card>
                            <Statistic
                                title="Đã đồng ý"
                                value={
                                    consents.filter((c) => c.consent === true)
                                        .length
                                }
                                valueStyle={{ color: "#52c41a" }}
                            />
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card>
                            <Statistic
                                title="Đã từ chối"
                                value={
                                    consents.filter((c) => c.consent === false)
                                        .length
                                }
                                valueStyle={{ color: "#ff4d4f" }}
                            />
                        </Card>
                    </Col>
                </Row>

                <Card className="mb-6">
                    <div className="mb-4">
                        <Typography.Title level={4}>
                            Chọn chiến dịch
                        </Typography.Title>
                        <Select
                            placeholder="Chọn chiến dịch tiêm chủng"
                            style={{ width: 300 }}
                            value={selectedCampaign}
                            onChange={setSelectedCampaign}
                            options={campaigns.map((campaign) => ({
                                label: campaign.name,
                                value: campaign.id,
                            }))}
                        />
                    </div>

                    {selectedCampaign && campaignDetail && (
                        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                            <Typography.Title level={5}>
                                Thông tin chiến dịch
                            </Typography.Title>
                            <Descriptions column={2} size="small">
                                <Descriptions.Item label="Tên chiến dịch">
                                    {campaignDetail.name}
                                </Descriptions.Item>
                                <Descriptions.Item label="Vắc xin">
                                    {campaignDetail.vaccine?.name || "-"}
                                </Descriptions.Item>
                                <Descriptions.Item label="Thời gian">
                                    {new Date(
                                        campaignDetail.scheduledDate
                                    ).toLocaleDateString("vi-VN")}{" "}
                                    -{" "}
                                    {new Date(
                                        campaignDetail.deadline
                                    ).toLocaleDateString("vi-VN")}
                                </Descriptions.Item>
                                <Descriptions.Item label="Khối lớp">
                                    {campaignDetail.targetGrades?.join(", ") ||
                                        "-"}
                                </Descriptions.Item>
                            </Descriptions>
                        </div>
                    )}

                    {loading ? (
                        <div className="text-center py-8">
                            <Spin size="large" />
                        </div>
                    ) : (
                        consents.length > 0 && (
                            <Table
                                columns={columns}
                                dataSource={consents}
                                rowKey="id"
                                pagination={{
                                    pageSize: 10,
                                    showSizeChanger: true,
                                    showQuickJumper: true,
                                }}
                            />
                        )
                    )}
                </Card>

                {/* Detail Modal */}
                <Modal
                    title="Chi tiết phiếu đồng ý"
                    open={modal.visible}
                    onCancel={() => setModal({ visible: false, consent: null })}
                    footer={null}
                    width={600}
                >
                    {modal.consent && (
                        <div>
                            <Divider orientation="left">
                                Thông tin học sinh
                            </Divider>
                            <Descriptions column={2} size="small">
                                <Descriptions.Item label="Học sinh">
                                    {modal.consent.studentName}
                                </Descriptions.Item>
                                <Descriptions.Item label="Lớp">
                                    {modal.consent.studentGrade}
                                </Descriptions.Item>
                                <Descriptions.Item label="Phụ huynh">
                                    {modal.consent.parentName}
                                </Descriptions.Item>
                                <Descriptions.Item label="Ngày xác nhận">
                                    {new Date(
                                        modal.consent.submittedAt
                                    ).toLocaleDateString("vi-VN")}
                                </Descriptions.Item>
                            </Descriptions>

                            <Divider orientation="left">
                                Trạng thái xác nhận
                            </Divider>
                            <Descriptions column={1} size="small">
                                <Descriptions.Item label="Trạng thái">
                                    {getConsentStatusTag(modal.consent.consent)}
                                </Descriptions.Item>
                                {modal.consent.consent === true && (
                                    <Descriptions.Item label="Xác nhận tiêm chủng">
                                        <Tag
                                            color="green"
                                            icon={<CheckOutlined />}
                                        >
                                            Phụ huynh đã xác nhận đồng ý cho con
                                            em tham gia tiêm chủng
                                        </Tag>
                                    </Descriptions.Item>
                                )}
                                {modal.consent.consent === false && (
                                    <Descriptions.Item label="Lý do từ chối">
                                        <Typography.Text type="danger">
                                            {modal.consent.notes ||
                                                "Không có lý do"}
                                        </Typography.Text>
                                    </Descriptions.Item>
                                )}
                                {modal.consent.notes &&
                                    modal.consent.consent === true && (
                                        <Descriptions.Item label="Ghi chú">
                                            {modal.consent.notes}
                                        </Descriptions.Item>
                                    )}
                            </Descriptions>
                        </div>
                    )}
                </Modal>
            </div>
        </div>
    );
};

export default VaccinationReports;
