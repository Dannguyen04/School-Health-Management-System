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
  Tooltip,
} from "antd";
import axios from "axios";
import dayjs from "dayjs";
import { useEffect, useState } from "react";

const { TextArea } = Input;

const VaccinationCampaigns = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [allCampaigns, setAllCampaigns] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [vaccines, setVaccines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchForm] = Form.useForm();
  const [campaignForm] = Form.useForm();

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem("token");
  };

  // API headers
  const getHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${getAuthToken()}`,
  });

  // Fetch all vaccines for dropdown
  const fetchVaccines = async () => {
    try {
      const response = await axios.get(
        "/api/manager/vaccination-campaigns/vaccines",
        {
          headers: getHeaders(),
        }
      );
      if (response.data.success && Array.isArray(response.data.data)) {
        setVaccines(response.data.data);
      } else if (
        response.data.success &&
        Array.isArray(response.data.vaccines)
      ) {
        setVaccines(response.data.vaccines);
      } else {
        setVaccines([]);
      }
    } catch (error) {
      console.error("Error fetching vaccines:", error);
      setVaccines([]);
    }
  };

  // Fetch campaigns
  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/manager/vaccination-campaigns", {
        headers: getHeaders(),
      });
      if (response.data.success) {
        // Không cần map vaccine nữa, backend đã trả về luôn vaccine
        setAllCampaigns(response.data.data || []);
        setCampaigns(response.data.data || []);
      } else {
        message.error(
          response.data.error || "Không thể tải danh sách chiến dịch"
        );
      }
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      message.error("Không thể tải danh sách chiến dịch");
    } finally {
      setLoading(false);
    }
  };

  // Create campaign
  const createCampaign = async (data) => {
    try {
      const response = await axios.post(
        "/api/manager/vaccination-campaigns",
        data,
        {
          headers: getHeaders(),
        }
      );
      if (response.data.success) {
        message.success("Thêm chiến dịch thành công");
        fetchCampaigns();
        return true;
      } else {
        message.error(response.data.error || "Không thể thêm chiến dịch");
        return false;
      }
    } catch (error) {
      console.error("Error creating campaign:", error);
      message.error(error.response?.data?.error || "Không thể thêm chiến dịch");
      return false;
    }
  };

  // Update campaign
  const updateCampaign = async (id, data) => {
    try {
      const response = await axios.put(
        `/api/manager/vaccination-campaigns/${id}`,
        data,
        {
          headers: getHeaders(),
        }
      );
      if (response.data.success) {
        message.success("Cập nhật chiến dịch thành công");
        fetchCampaigns();
        return true;
      } else {
        message.error(response.data.error || "Không thể cập nhật chiến dịch");
        return false;
      }
    } catch (error) {
      console.error("Error updating campaign:", error);
      message.error(
        error.response?.data?.error || "Không thể cập nhật chiến dịch"
      );
      return false;
    }
  };

  // Delete campaign
  const deleteCampaign = async (id) => {
    try {
      const response = await axios.delete(
        `/api/manager/vaccination-campaigns/${id}`,
        {
          headers: getHeaders(),
        }
      );
      if (response.data.success) {
        message.success("Xóa chiến dịch thành công");
        fetchCampaigns();
        return true;
      } else {
        message.error(response.data.error || "Không thể xóa chiến dịch");
        return false;
      }
    } catch (error) {
      console.error("Error deleting campaign:", error);
      message.error(error.response?.data?.error || "Không thể xóa chiến dịch");
      return false;
    }
  };

  // Load data on component mount
  useEffect(() => {
    const fetchAll = async () => {
      await fetchVaccines();
      await fetchCampaigns();
    };
    fetchAll();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "ACTIVE":
        return "blue";
      case "FINISHED":
        return "green";
      case "CANCELLED":
        return "red";
      default:
        return "default";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "ACTIVE":
        return "Đang diễn ra";
      case "FINISHED":
        return "Hoàn thành";
      case "CANCELLED":
        return "Đã hủy";
      default:
        return status;
    }
  };

  const columns = [
    {
      title: "Tên chiến dịch",
      dataIndex: "name",
      key: "name",
      width: 220,
      ellipsis: { showTitle: false },
      render: (name) => (
        <Tooltip placement="topLeft" title={name}>
          {name}
        </Tooltip>
      ),
    },
    {
      title: "Vắc xin",
      dataIndex: ["vaccine", "name"],
      key: "vaccineName",
      width: 120,
      align: "center",
    },
    {
      title: "Ngày bắt đầu",
      dataIndex: "scheduledDate",
      key: "scheduledDate",
      render: (date) => new Date(date).toLocaleDateString("vi-VN"),
      width: 120,
      align: "center",
    },
    {
      title: "Ngày kết thúc",
      dataIndex: "deadline",
      key: "deadline",
      render: (date) => new Date(date).toLocaleDateString("vi-VN"),
      width: 120,
      align: "center",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
      width: 110,
      align: "center",
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      width: 200,
      ellipsis: { showTitle: false },
      render: (description) => (
        <Tooltip placement="topLeft" title={description || "Không có"}>
          {description || "Không có"}
        </Tooltip>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 120,
      align: "center",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          ></Button>
          <Popconfirm
            title="Xóa chiến dịch"
            description={`Bạn có chắc chắn muốn xóa chiến dịch ${record.name}?`}
            onConfirm={() => handleDelete(record.id)}
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

  const handleEdit = (record) => {
    setSelectedCampaign(record);
    campaignForm.setFieldsValue({
      ...record,
      startDate: record.scheduledDate ? dayjs(record.scheduledDate) : null,
      endDate: record.deadline ? dayjs(record.deadline) : null,
      vaccineName: record.vaccine?.name,
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
    await deleteCampaign(id);
  };

  const handleSearch = (values) => {
    let filtered = allCampaigns;
    if (values.name?.trim()) {
      filtered = filtered.filter((c) =>
        c.name.trim().toLowerCase().includes(values.name.trim().toLowerCase())
      );
    }
    if (values.vaccineName) {
      filtered = filtered.filter((c) => c.vaccine?.name === values.vaccineName);
    }
    if (values.status) {
      filtered = filtered.filter((c) => c.status === values.status);
    }
    setCampaigns(filtered);
  };

  const handleReset = () => {
    searchForm.resetFields();
    setCampaigns(allCampaigns);
  };

  const handleSubmit = async () => {
    try {
      const values = await campaignForm.validateFields();
      let success = false;
      if (selectedCampaign) {
        // Chỉ gửi các trường hợp lệ khi update
        const updateData = {
          name: values.name,
          description: values.description,
          status: values.status,
        };
        success = await updateCampaign(selectedCampaign.id, updateData);
      } else {
        // Khi tạo mới, gửi đầy đủ
        const campaignData = {
          ...values,
          startDate: values.startDate ? values.startDate.toISOString() : null,
          endDate: values.endDate ? values.endDate.toISOString() : null,
        };
        success = await createCampaign(campaignData);
      }
      if (success) {
        setIsModalVisible(false);
        campaignForm.resetFields();
        setSelectedCampaign(null);
      }
    } catch (error) {
      console.error("Form validation error:", error);
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    campaignForm.resetFields();
    setSelectedCampaign(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Chiến dịch tiêm chủng</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalVisible(true)}
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
              <Form.Item name="vaccineName" label="Vắc xin">
                <Select placeholder="Chọn vắc xin">
                  {vaccines.map((vaccine) => (
                    <Select.Option key={vaccine.id} value={vaccine.name}>
                      {vaccine.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name="status" label="Trạng thái">
                <Select placeholder="Chọn trạng thái">
                  <Select.Option value="ACTIVE">Đang diễn ra</Select.Option>
                  <Select.Option value="FINISHED">Hoàn thành</Select.Option>
                  <Select.Option value="CANCELLED">Đã hủy</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={24} className="text-right">
              <Button
                type="primary"
                icon={<SearchOutlined />}
                htmlType="submit"
                style={{ marginRight: 8 }}
              >
                Tìm kiếm
              </Button>
              <Button onClick={handleReset}>Xóa bộ lọc</Button>
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
          pagination={{
            pageSize: 5,
            showQuickJumper: true,
          }}
          scroll={{ x: "max-content" }}
        />
      </Card>

      <Modal
        title={
          selectedCampaign
            ? "Sửa chiến dịch tiêm chủng"
            : "Thêm chiến dịch tiêm chủng"
        }
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={handleModalCancel}
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
            name="vaccineName"
            label="Vắc xin"
            rules={[{ required: true, message: "Vui lòng chọn vắc xin" }]}
          >
            <Select placeholder="Chọn vắc xin" disabled={!!selectedCampaign}>
              {vaccines.map((vaccine) => (
                <Select.Option key={vaccine.id} value={vaccine.name}>
                  {vaccine.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="startDate"
                label="Ngày bắt đầu"
                rules={[
                  { required: true, message: "Vui lòng chọn ngày bắt đầu" },
                ]}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  disabled={!!selectedCampaign}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="endDate"
                label="Ngày kết thúc"
                rules={[
                  { required: true, message: "Vui lòng chọn ngày kết thúc" },
                ]}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  disabled={!!selectedCampaign}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label="Mô tả">
            <TextArea rows={4} placeholder="Nhập mô tả chiến dịch" />
          </Form.Item>

          {selectedCampaign && (
            <Form.Item name="status" label="Trạng thái">
              <Select placeholder="Chọn trạng thái">
                <Select.Option value="ACTIVE">Đang diễn ra</Select.Option>
                <Select.Option value="FINISHED">Hoàn thành</Select.Option>
                <Select.Option value="CANCELLED">Đã hủy</Select.Option>
              </Select>
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default VaccinationCampaigns;
