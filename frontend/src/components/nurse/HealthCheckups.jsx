import {
  BarChartOutlined,
  EditOutlined,
  FileTextOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
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
  Space,
  Spin,
  Statistic,
  Table,
  Tag,
} from "antd";
import axios from "axios";
import { useEffect, useState } from "react";

const { TextArea } = Input;
const { Option } = Select;

const HealthCheckups = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState(null);
  const [detailModal, setDetailModal] = useState(false);
  const [createModal, setCreateModal] = useState(false);
  const [updateModal, setUpdateModal] = useState(false);
  const [updateRecord, setUpdateRecord] = useState(null);
  const [form] = Form.useForm();
  const [updateForm] = Form.useForm();
  const [campaignId, setCampaignId] = useState("");
  const [stats, setStats] = useState(null);
  const [statsModal, setStatsModal] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const [students, setStudents] = useState([]);

  // Fetch danh sách campaign khi vào trang
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const res = await axios.get("/api/medical-campaigns", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setCampaigns(res.data.data || []);
      } catch {
        setCampaigns([]);
      }
    };
    fetchCampaigns();
  }, []);

  // Fetch danh sách học sinh khi mở modal tạo lịch (nếu chưa có)
  const fetchStudents = async () => {
    if (students.length > 0) return;
    try {
      const res = await axios.get("/api/admin/students-for-nurse", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setStudents(res.data.data || []);
    } catch {
      setStudents([]);
    }
  };

  // Lấy danh sách kiểm tra theo campaign
  const fetchCheckups = async (cid = campaignId, params = {}) => {
    if (!cid) return;
    setLoading(true);
    try {
      const res = await axios.get(`/api/medical-checks/campaign/${cid}`, {
        params,
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setData(res.data.data || []);
    } catch {
      message.error("Không thể tải danh sách kiểm tra");
    }
    setLoading(false);
  };

  // Lấy thống kê
  const fetchStats = async (cid = campaignId) => {
    if (!cid) return;
    try {
      const res = await axios.get(`/api/medical-checks/statistics/${cid}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setStats(res.data.data);
    } catch {
      message.error("Không thể tải thống kê");
    }
  };

  // Xem chi tiết
  const handleViewDetail = async (record) => {
    try {
      const res = await axios.get(`/api/medical-checks/${record.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setDetail(res.data.data);
      setDetailModal(true);
    } catch {
      message.error("Không thể tải chi tiết kiểm tra");
    }
  };

  // Tạo lịch kiểm tra
  const handleCreate = async (values) => {
    try {
      await axios.post(
        `/api/medical-checks`,
        { ...values, campaignId },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      message.success("Tạo lịch kiểm tra thành công");
      setCreateModal(false);
      form.resetFields();
      fetchCheckups();
    } catch (err) {
      message.error(err.response?.data?.error || "Tạo lịch kiểm tra thất bại");
    }
  };

  // Cập nhật kết quả kiểm tra
  const handleUpdate = async (values) => {
    try {
      await axios.put(`/api/medical-checks/${updateRecord.id}`, values, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      message.success("Cập nhật kết quả thành công");
      setUpdateModal(false);
      updateForm.resetFields();
      fetchCheckups();
    } catch (err) {
      message.error(err.response?.data?.error || "Cập nhật thất bại");
    }
  };

  // Khi chọn campaign
  useEffect(() => {
    if (campaignId) {
      fetchCheckups();
      fetchStats();
    }
    // eslint-disable-next-line
  }, [campaignId]);

  // Khi mở modal tạo lịch kiểm tra
  useEffect(() => {
    if (createModal) {
      fetchStudents();
    }
    // eslint-disable-next-line
  }, [createModal]);

  // Tìm kiếm/filter
  const handleSearch = (values) => {
    fetchCheckups(campaignId, values);
  };

  const columns = [
    {
      title: "Mã học sinh",
      dataIndex: ["student", "studentCode"],
      key: "studentCode",
    },
    {
      title: "Tên học sinh",
      key: "studentName",
      render: (_, record) => record.student?.user?.fullName || "-",
    },
    {
      title: "Lớp",
      dataIndex: ["student", "class"],
      key: "class",
    },
    {
      title: "Ngày khám",
      dataIndex: "scheduledDate",
      key: "scheduledDate",
      render: (date) => date && new Date(date).toLocaleDateString(),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "COMPLETED" ? "green" : "orange"}>{status}</Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            icon={<FileTextOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            Chi tiết
          </Button>
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setUpdateRecord(record);
              updateForm.setFieldsValue(record);
              setUpdateModal(true);
            }}
            disabled={record.status === "COMPLETED"}
          >
            Cập nhật
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="font-semibold">Chọn chiến dịch:</span>
          <Select
            style={{ minWidth: 220 }}
            placeholder="Chọn chiến dịch kiểm tra"
            value={campaignId || undefined}
            onChange={(v) => setCampaignId(v)}
            showSearch
            optionFilterProp="children"
          >
            {campaigns.map((c) => (
              <Option key={c.id} value={c.id}>
                {c.name}
              </Option>
            ))}
          </Select>
        </div>
        {campaignId && (
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setCreateModal(true)}
            >
              Tạo lịch kiểm tra
            </Button>
            <Button
              icon={<BarChartOutlined />}
              onClick={() => setStatsModal(true)}
              type="default"
            >
              Thống kê
            </Button>
          </Space>
        )}
      </div>

      {campaignId ? (
        <>
          <Card>
            <Form form={form} onFinish={handleSearch} layout="inline">
              <Form.Item name="studentId" label="Mã học sinh">
                <Input placeholder="Nhập mã học sinh" />
              </Form.Item>
              <Form.Item name="grade" label="Khối">
                <Select placeholder="Chọn khối" style={{ width: 120 }}>
                  <Option value="1">1</Option>
                  <Option value="2">2</Option>
                  <Option value="3">3</Option>
                  <Option value="4">4</Option>
                  <Option value="5">5</Option>
                </Select>
              </Form.Item>
              <Form.Item name="status" label="Trạng thái">
                <Select placeholder="Chọn trạng thái" style={{ width: 140 }}>
                  <Option value="COMPLETED">Hoàn thành</Option>
                  <Option value="IN_PROGRESS">Đang thực hiện</Option>
                </Select>
              </Form.Item>
              <Form.Item>
                <Button
                  type="primary"
                  icon={<SearchOutlined />}
                  htmlType="submit"
                >
                  Tìm kiếm
                </Button>
              </Form.Item>
            </Form>
          </Card>

          <Card>
            <Table
              dataSource={data}
              columns={columns}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </>
      ) : (
        <Card className="text-center text-gray-500">
          Vui lòng chọn chiến dịch kiểm tra để xem danh sách.
        </Card>
      )}

      {/* Modal chi tiết */}
      <Modal
        title="Chi tiết kiểm tra sức khỏe"
        open={detailModal}
        onCancel={() => setDetailModal(false)}
        footer={<Button onClick={() => setDetailModal(false)}>Đóng</Button>}
        width={600}
      >
        {detail ? (
          <Card
            bordered={false}
            style={{ boxShadow: "0 2px 8px #f0f1f2", borderRadius: 12 }}
          >
            <Descriptions
              title={
                <span style={{ fontWeight: 700, fontSize: 18 }}>
                  Thông tin kiểm tra
                </span>
              }
              column={1}
              size="middle"
              labelStyle={{ fontWeight: 600, minWidth: 120 }}
              contentStyle={{ fontSize: 16 }}
            >
              <Descriptions.Item label="Học sinh">
                {detail.student?.name || detail.student?.user?.fullName || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Lớp">
                {detail.student?.class || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày khám">
                {detail.scheduledDate
                  ? new Date(detail.scheduledDate).toLocaleDateString()
                  : "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag
                  color={detail.status === "COMPLETED" ? "green" : "orange"}
                  style={{ fontSize: 14, padding: "2px 12px" }}
                >
                  {detail.status === "COMPLETED" ? "Hoàn thành" : detail.status}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
            <Divider />
            <Descriptions
              title={
                <span style={{ fontWeight: 700, fontSize: 18 }}>
                  Kết quả kiểm tra
                </span>
              }
              column={1}
              size="middle"
              labelStyle={{ fontWeight: 600, minWidth: 120 }}
              contentStyle={{ fontSize: 16 }}
            >
              <Descriptions.Item label="Thị lực">
                {detail.visionResult || (
                  <span style={{ color: "#aaa" }}>-</span>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Thính lực">
                {detail.hearingResult || (
                  <span style={{ color: "#aaa" }}>-</span>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Răng miệng">
                {detail.dentalResult || (
                  <span style={{ color: "#aaa" }}>-</span>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Chiều cao / Cân nặng">
                {detail.heightWeight ? (
                  `${detail.heightWeight.height} cm / ${detail.heightWeight.weight} kg`
                ) : (
                  <span style={{ color: "#aaa" }}>-</span>
                )}
              </Descriptions.Item>
            </Descriptions>
            <Divider />
            <Descriptions
              title={
                <span style={{ fontWeight: 700, fontSize: 18 }}>Ghi chú</span>
              }
              column={1}
              size="middle"
              labelStyle={{ fontWeight: 600, minWidth: 120 }}
              contentStyle={{ fontSize: 16 }}
            >
              <Descriptions.Item label="">
                {detail.notes ? (
                  <span style={{ whiteSpace: "pre-line" }}>{detail.notes}</span>
                ) : (
                  <span style={{ color: "#aaa" }}>Không có ghi chú</span>
                )}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        ) : (
          <Spin />
        )}
      </Modal>

      {/* Modal tạo lịch kiểm tra */}
      <Modal
        title="Tạo lịch kiểm tra sức khỏe"
        open={createModal}
        onCancel={() => setCreateModal(false)}
        footer={null}
        width={500}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item
            name="studentId"
            label="Học sinh"
            rules={[{ required: true, message: "Vui lòng chọn học sinh" }]}
          >
            <Select
              showSearch
              placeholder="Chọn học sinh"
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.children ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            >
              {students.map((student) => (
                <Option key={student.id} value={student.id}>
                  {student.studentCode} - {student.fullName}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="scheduledDate"
            label="Ngày khám"
            rules={[{ required: true, message: "Vui lòng chọn ngày" }]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="notes" label="Ghi chú">
            <TextArea rows={3} />
          </Form.Item>
          <div className="flex justify-end">
            <Button
              onClick={() => setCreateModal(false)}
              style={{ marginRight: 8 }}
            >
              Hủy
            </Button>
            <Button type="primary" htmlType="submit">
              Tạo lịch
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Modal cập nhật kết quả */}
      <Modal
        title="Cập nhật kết quả kiểm tra"
        open={updateModal}
        onCancel={() => setUpdateModal(false)}
        footer={null}
        width={500}
      >
        <Form form={updateForm} layout="vertical" onFinish={handleUpdate}>
          <Form.Item name="visionResult" label="Thị lực">
            <Select allowClear>
              <Option value="normal">Bình thường</Option>
              <Option value="needs_glasses">Cần kính</Option>
              <Option value="refer_specialist">Chuyển chuyên khoa</Option>
            </Select>
          </Form.Item>
          <Form.Item name="hearingResult" label="Thính lực">
            <Select allowClear>
              <Option value="normal">Bình thường</Option>
              <Option value="impaired">Suy giảm</Option>
              <Option value="refer_specialist">Chuyển chuyên khoa</Option>
            </Select>
          </Form.Item>
          <Form.Item name="dentalResult" label="Răng miệng">
            <Select allowClear>
              <Option value="good">Tốt</Option>
              <Option value="needs_treatment">Cần điều trị</Option>
              <Option value="refer_dentist">Chuyển nha sĩ</Option>
            </Select>
          </Form.Item>
          <Form.Item name={["heightWeight", "height"]} label="Chiều cao (cm)">
            <InputNumber min={50} max={250} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name={["heightWeight", "weight"]} label="Cân nặng (kg)">
            <InputNumber min={10} max={150} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="notes" label="Ghi chú">
            <TextArea rows={3} />
          </Form.Item>
          <div className="flex justify-end">
            <Button
              onClick={() => setUpdateModal(false)}
              style={{ marginRight: 8 }}
            >
              Hủy
            </Button>
            <Button type="primary" htmlType="submit">
              Cập nhật
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Modal thống kê */}
      <Modal
        title="Thống kê kiểm tra sức khỏe"
        open={statsModal}
        onCancel={() => setStatsModal(false)}
        footer={<Button onClick={() => setStatsModal(false)}>Đóng</Button>}
        width={600}
      >
        {stats ? (
          <Row gutter={16}>
            <Col span={8}>
              <Statistic
                title="Hoàn thành"
                value={
                  stats.statusStats?.find((s) => s.status === "COMPLETED")
                    ?._count?.status || 0
                }
                valueStyle={{ color: "#3f8600" }}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="Đang thực hiện"
                value={
                  stats.statusStats?.find((s) => s.status === "IN_PROGRESS")
                    ?._count?.status || 0
                }
                valueStyle={{ color: "#faad14" }}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="Cần theo dõi"
                value={stats.followUpCount || 0}
                valueStyle={{ color: "#cf1322" }}
              />
            </Col>
          </Row>
        ) : (
          <Spin />
        )}
      </Modal>
    </div>
  );
};

export default HealthCheckups;
