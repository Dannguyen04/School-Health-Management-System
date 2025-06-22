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
import { useEffect, useState } from "react";

const { TextArea } = Input;

const VaccineManagement = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedVaccine, setSelectedVaccine] = useState(null);
  const [vaccines, setVaccines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchForm] = Form.useForm();
  const [vaccineForm] = Form.useForm();

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem("token");
  };

  // API headers
  const getHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${getAuthToken()}`,
  });

  // Fetch all vaccines
  const fetchVaccines = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/manager/vaccination/optional", {
        headers: getHeaders(),
      });
      if (response.data.success) {
        setVaccines(response.data.data || []);
      } else {
        message.error(response.data.error || "Không thể tải danh sách vaccine");
      }
    } catch (error) {
      console.error("Error fetching vaccines:", error);
      message.error("Không thể tải danh sách vaccine");
    } finally {
      setLoading(false);
    }
  };

  // Create vaccine
  const createVaccine = async (data) => {
    try {
      const response = await axios.post("/api/manager/vaccination", data, {
        headers: getHeaders(),
      });
      if (response.data.success) {
        message.success("Thêm vaccine thành công");
        fetchVaccines();
        return true;
      } else {
        message.error(response.data.error || "Không thể thêm vaccine");
        return false;
      }
    } catch (error) {
      console.error("Error creating vaccine:", error);
      message.error(error.response?.data?.error || "Không thể thêm vaccine");
      return false;
    }
  };

  // Update vaccine
  const updateVaccine = async (id, data) => {
    try {
      const response = await axios.put(`/api/manager/vaccination/${id}`, data, {
        headers: getHeaders(),
      });
      if (response.data.success) {
        message.success("Cập nhật vaccine thành công");
        fetchVaccines();
        return true;
      } else {
        message.error(response.data.error || "Không thể cập nhật vaccine");
        return false;
      }
    } catch (error) {
      console.error("Error updating vaccine:", error);
      message.error(
        error.response?.data?.error || "Không thể cập nhật vaccine"
      );
      return false;
    }
  };

  // Delete vaccine
  const deleteVaccine = async (id) => {
    try {
      const response = await axios.delete(`/api/manager/vaccination/${id}`, {
        headers: getHeaders(),
      });
      if (response.data.success) {
        message.success("Xóa vaccine thành công");
        fetchVaccines();
        return true;
      } else {
        message.error(response.data.error || "Không thể xóa vaccine");
        return false;
      }
    } catch (error) {
      console.error("Error deleting vaccine:", error);
      message.error(error.response?.data?.error || "Không thể xóa vaccine");
      return false;
    }
  };

  // Load vaccines on component mount
  useEffect(() => {
    fetchVaccines();
  }, []);

  const columns = [
    {
      title: "Tên vaccine",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Yêu cầu",
      dataIndex: "requirement",
      key: "requirement",
      render: (requirement) => (
        <Tag color={requirement === "REQUIRED" ? "red" : "blue"}>
          {requirement === "REQUIRED" ? "Bắt buộc" : "Tùy chọn"}
        </Tag>
      ),
    },
    {
      title: "Liều lượng",
      dataIndex: "dose",
      key: "dose",
    },
    {
      title: "Ngày hết hạn",
      dataIndex: "expiredDate",
      key: "expiredDate",
      render: (date) => new Date(date).toLocaleDateString("vi-VN"),
    },
    {
      title: "Tác dụng phụ",
      dataIndex: "sideEffects",
      key: "sideEffects",
      render: (sideEffects) => sideEffects || "Không có",
    },
    {
      title: "Ghi chú",
      dataIndex: "notes",
      key: "notes",
      render: (notes) => notes || "Không có",
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            Sửa
          </Button>
          <Popconfirm
            title="Xóa vaccine"
            description={`Bạn có chắc chắn muốn xóa vaccine ${record.name}?`}
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okType="danger"
          >
            <Button danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleEdit = (record) => {
    setSelectedVaccine(record);
    vaccineForm.setFieldsValue({
      ...record,
      expiredDate: record.expiredDate ? new Date(record.expiredDate) : null,
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
    await deleteVaccine(id);
  };

  const handleSearch = (values) => {
    console.log("Search values:", values);
    // Implement search functionality if needed
  };

  const handleSubmit = async () => {
    try {
      const values = await vaccineForm.validateFields();

      // Format the data
      const vaccineData = {
        ...values,
        expiredDate: values.expiredDate
          ? values.expiredDate.toISOString()
          : null,
      };

      let success = false;
      if (selectedVaccine) {
        success = await updateVaccine(selectedVaccine.id, vaccineData);
      } else {
        success = await createVaccine(vaccineData);
      }

      if (success) {
        setIsModalVisible(false);
        vaccineForm.resetFields();
        setSelectedVaccine(null);
      }
    } catch (error) {
      console.error("Form validation error:", error);
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    vaccineForm.resetFields();
    setSelectedVaccine(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Quản lý vaccine</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalVisible(true)}
        >
          Thêm vaccine
        </Button>
      </div>

      <Card>
        <Form form={searchForm} onFinish={handleSearch} layout="vertical">
          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item name="name" label="Tên vaccine">
                <Input placeholder="Nhập tên vaccine" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name="requirement" label="Yêu cầu">
                <Select placeholder="Chọn yêu cầu">
                  <Select.Option value="REQUIRED">Bắt buộc</Select.Option>
                  <Select.Option value="OPTIONAL">Tùy chọn</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name="dose" label="Liều lượng">
                <Input placeholder="Nhập liều lượng" />
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={24} className="text-right">
              <Button
                type="primary"
                icon={<SearchOutlined />}
                htmlType="submit"
              >
                Tìm kiếm
              </Button>
            </Col>
          </Row>
        </Form>
      </Card>

      <Card>
        <Table
          dataSource={vaccines}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} vaccine`,
          }}
        />
      </Card>

      <Modal
        title={selectedVaccine ? "Sửa vaccine" : "Thêm vaccine"}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={handleModalCancel}
        width={600}
        okText={selectedVaccine ? "Cập nhật" : "Thêm"}
        cancelText="Hủy"
      >
        <Form form={vaccineForm} layout="vertical">
          <Form.Item
            name="name"
            label="Tên vaccine"
            rules={[{ required: true, message: "Vui lòng nhập tên vaccine" }]}
          >
            <Input placeholder="Nhập tên vaccine" />
          </Form.Item>

          <Form.Item
            name="requirement"
            label="Yêu cầu"
            rules={[{ required: true, message: "Vui lòng chọn yêu cầu" }]}
          >
            <Select placeholder="Chọn yêu cầu">
              <Select.Option value="REQUIRED">Bắt buộc</Select.Option>
              <Select.Option value="OPTIONAL">Tùy chọn</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="dose"
            label="Liều lượng"
            rules={[{ required: true, message: "Vui lòng nhập liều lượng" }]}
          >
            <Input placeholder="Nhập liều lượng" />
          </Form.Item>

          <Form.Item
            name="expiredDate"
            label="Ngày hết hạn"
            rules={[{ required: true, message: "Vui lòng chọn ngày hết hạn" }]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="sideEffects" label="Tác dụng phụ">
            <TextArea rows={3} placeholder="Nhập tác dụng phụ (nếu có)" />
          </Form.Item>

          <Form.Item name="notes" label="Ghi chú">
            <TextArea rows={3} placeholder="Nhập ghi chú (nếu có)" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default VaccineManagement;
