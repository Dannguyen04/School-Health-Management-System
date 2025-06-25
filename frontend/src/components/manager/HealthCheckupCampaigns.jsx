import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Table,
  Tag,
} from "antd";
import axios from "axios";
import dayjs from "dayjs";
import { useEffect, useState } from "react";

const { TextArea } = Input;

const HealthCheckupCampaigns = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [searchForm] = Form.useForm();
  const [campaignForm] = Form.useForm();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [allCampaigns, setAllCampaigns] = useState([]);

  const getAuthToken = () => localStorage.getItem("token");
  const getHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${getAuthToken()}`,
  });

  // Fetch all campaigns
  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/medical-campaigns", {
        headers: getHeaders(),
      });
      if (res.data.success) {
        const mapped = (res.data.data || []).map((c) => ({
          id: c.id,
          name: c.name,
          type: Array.isArray(c.checkTypes)
            ? c.checkTypes.join(", ")
            : c.checkTypes,
          startDate: c.scheduledDate
            ? dayjs(c.scheduledDate).format("YYYY-MM-DD")
            : "",
          endDate: c.deadline ? dayjs(c.deadline).format("YYYY-MM-DD") : "",
          status: getStatusFromDates(c.scheduledDate, c.deadline),
          studentCount: c.studentCount || "-",
          description: c.description,
          raw: c,
        }));
        setCampaigns(mapped);
        setAllCampaigns(mapped);
      } else {
        message.error(res.data.error || "Không thể tải danh sách chiến dịch");
      }
    } catch {
      message.error("Không thể tải danh sách chiến dịch");
    } finally {
      setLoading(false);
    }
  };

  const getStatusFromDates = (start, end) => {
    const now = dayjs();
    if (!start || !end) return "pending";
    const s = dayjs(start);
    const e = dayjs(end);
    if (now.isBefore(s)) return "pending";
    if (now.isAfter(e)) return "completed";
    return "in_progress";
  };

  // Create campaign
  const createCampaign = async (data) => {
    try {
      const res = await axios.post("/api/medical-campaigns", data, {
        headers: getHeaders(),
      });
      if (res.data.success) {
        message.success("Thêm chiến dịch thành công");
        fetchCampaigns();
        return true;
      } else {
        message.error(res.data.error || "Không thể thêm chiến dịch");
        return false;
      }
    } catch (err) {
      message.error(err.response?.data?.error || "Không thể thêm chiến dịch");
      return false;
    }
  };

  // Update campaign
  const updateCampaign = async (id, data) => {
    try {
      const res = await axios.put(`/api/medical-campaigns/${id}`, data, {
        headers: getHeaders(),
      });
      if (res.data.success) {
        message.success("Cập nhật chiến dịch thành công");
        fetchCampaigns();
        return true;
      } else {
        message.error(res.data.error || "Không thể cập nhật chiến dịch");
        return false;
      }
    } catch (err) {
      message.error(
        err.response?.data?.error || "Không thể cập nhật chiến dịch"
      );
      return false;
    }
  };

  // Delete campaign
  const deleteCampaign = async (id) => {
    try {
      const res = await axios.delete(`/api/medical-campaigns/${id}`, {
        headers: getHeaders(),
      });
      if (res.data.success) {
        message.success("Xóa chiến dịch thành công");
        fetchCampaigns();
        return true;
      } else {
        message.error(res.data.error || "Không thể xóa chiến dịch");
        return false;
      }
    } catch (err) {
      message.error(err.response?.data?.error || "Không thể xóa chiến dịch");
      return false;
    }
  };

  // Load data on mount
  useEffect(() => {
    fetchCampaigns();
  }, []);

  const normalizeString = (str) =>
    str.replace(/\s+/g, " ").trim().toLowerCase();

  // Table columns
  const columns = [
    {
      title: "Tên chiến dịch",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Loại khám",
      dataIndex: "type",
      key: "type",
    },
    {
      title: "Ngày bắt đầu",
      dataIndex: "startDate",
      key: "startDate",
    },
    {
      title: "Ngày kết thúc",
      dataIndex: "endDate",
      key: "endDate",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag
          color={
            status === "completed"
              ? "green"
              : status === "in_progress"
              ? "blue"
              : "orange"
          }
        >
          {status === "completed"
            ? "Hoàn thành"
            : status === "in_progress"
            ? "Đang diễn ra"
            : "Chưa bắt đầu"}
        </Tag>
      ),
    },
    {
      title: "Số học sinh",
      dataIndex: "studentCount",
      key: "studentCount",
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          ></Button>
          <Popconfirm
            title="Xóa chiến dịch"
            description={`Bạn có chắc chắn muốn xóa chiến dịch ${record.name}?`}
            onConfirm={() => deleteCampaign(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okType="danger"
          >
            <Button danger icon={<DeleteOutlined />}></Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Edit
  const handleEdit = (record) => {
    setSelectedCampaign(record);
    campaignForm.setFieldsValue({
      name: record.name,
      checkTypes: record.type ? record.type.split(", ") : [],
      scheduledDate: record.startDate ? dayjs(record.startDate) : null,
      deadline: record.endDate ? dayjs(record.endDate) : null,
      description: record.description,
    });
    setIsModalVisible(true);
  };

  // Search
  const handleSearch = (values) => {
    let filtered = allCampaigns;
    if (values.name?.trim()) {
      const searchName = normalizeString(values.name);
      filtered = filtered.filter((c) =>
        normalizeString(c.name).includes(searchName)
      );
    }
    if (values.type) {
      const searchType = normalizeString(values.type);
      filtered = filtered.filter((c) =>
        normalizeString(c.type || "").includes(searchType)
      );
    }
    if (values.status) {
      filtered = filtered.filter((c) => c.status === values.status);
    }
    setCampaigns(filtered);
  };

  // Xóa bộ lọc
  const handleResetFilters = () => {
    searchForm.resetFields();
    setCampaigns(allCampaigns);
  };

  // Submit (add/edit)
  const handleSubmit = async () => {
    try {
      const values = await campaignForm.validateFields();
      const data = {
        name: values.name,
        checkTypes: values.checkTypes,
        scheduledDate: values.scheduledDate
          ? values.scheduledDate.toISOString()
          : null,
        deadline: values.deadline ? values.deadline.toISOString() : null,
        description: values.description,
      };
      let success = false;
      if (selectedCampaign) {
        success = await updateCampaign(selectedCampaign.id, data);
      } else {
        success = await createCampaign(data);
      }
      if (success) {
        setIsModalVisible(false);
        campaignForm.resetFields();
        setSelectedCampaign(null);
      }
    } catch {
      message.error("Có lỗi xảy ra khi gửi dữ liệu!");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Chiến dịch khám sức khỏe</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setSelectedCampaign(null);
            campaignForm.resetFields();
            setIsModalVisible(true);
          }}
        >
          Thêm chiến dịch
        </Button>
      </div>

      <Card>
        <Form form={searchForm} onFinish={handleSearch} layout="vertical">
          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item name="name" label="Tên chiến dịch">
                <Input placeholder="Nhập tên chiến dịch" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name="type" label="Loại khám">
                <Select placeholder="Chọn loại khám" allowClear>
                  <Select.Option value="Khám tổng quát">
                    Khám tổng quát
                  </Select.Option>
                  <Select.Option value="Khám mắt">Khám mắt</Select.Option>
                  <Select.Option value="Khám răng">Khám răng</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name="status" label="Trạng thái">
                <Select placeholder="Chọn trạng thái" allowClear>
                  <Select.Option value="completed">Hoàn thành</Select.Option>
                  <Select.Option value="in_progress">
                    Đang diễn ra
                  </Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={24} className="text-right">
              <Space>
                <Button
                  type="primary"
                  icon={<SearchOutlined />}
                  htmlType="submit"
                >
                  Tìm kiếm
                </Button>
                <Button onClick={handleResetFilters}>Xóa bộ lọc</Button>
              </Space>
            </Col>
          </Row>
        </Form>
      </Card>

      <Card>
        <Table
          dataSource={campaigns}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 5, showQuickJumper: true }}
          scroll={{ x: "max-content" }}
        />
      </Card>

      <Modal
        title={
          selectedCampaign
            ? "Sửa chiến dịch khám sức khỏe"
            : "Thêm chiến dịch khám sức khỏe"
        }
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setIsModalVisible(false);
          campaignForm.resetFields();
          setSelectedCampaign(null);
        }}
        width={600}
        okText={selectedCampaign ? "Cập nhật" : "Thêm"}
        cancelText="Hủy"
      >
        <Form form={campaignForm} layout="vertical">
          <Form.Item
            name="name"
            label="Tên chiến dịch"
            rules={[
              { required: true, message: "Vui lòng nhập tên chiến dịch" },
            ]}
          >
            <Input placeholder="Nhập tên chiến dịch" />
          </Form.Item>

          <Form.Item
            name="checkTypes"
            label="Loại khám"
            rules={[{ required: true, message: "Vui lòng chọn loại khám" }]}
          >
            <Select mode="multiple" placeholder="Chọn loại khám">
              <Select.Option value="Khám tổng quát">
                Khám tổng quát
              </Select.Option>
              <Select.Option value="Khám mắt">Khám mắt</Select.Option>
              <Select.Option value="Khám răng">Khám răng</Select.Option>
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="scheduledDate"
                label="Ngày bắt đầu"
                rules={[
                  { required: true, message: "Vui lòng chọn ngày bắt đầu" },
                ]}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="deadline"
                label="Ngày kết thúc"
                rules={[
                  { required: true, message: "Vui lòng chọn ngày kết thúc" },
                ]}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label="Mô tả">
            <TextArea rows={4} placeholder="Nhập mô tả chiến dịch (nếu có)" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default HealthCheckupCampaigns;
