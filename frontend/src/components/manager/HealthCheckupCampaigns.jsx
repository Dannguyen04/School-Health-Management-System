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
  Modal,
  Row,
  Select,
  Space,
  Table,
  Tag,
} from "antd";
import React, { useState } from "react";

const { TextArea } = Input;

const HealthCheckupCampaigns = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [searchForm] = Form.useForm();
  const [campaignForm] = Form.useForm();

  // Mock data
  const healthCheckupCampaigns = [
    {
      id: 1,
      name: "Khám sức khỏe đầu năm học 2024",
      type: "Khám tổng quát",
      startDate: "2024-03-01",
      endDate: "2024-03-15",
      status: "completed",
      studentCount: 1200,
      description:
        "Khám sức khỏe tổng quát cho toàn bộ học sinh đầu năm học mới",
    },
    {
      id: 2,
      name: "Khám mắt định kỳ",
      type: "Khám mắt",
      startDate: "2024-03-20",
      endDate: "2024-03-25",
      status: "in_progress",
      studentCount: 800,
      description: "Kiểm tra thị lực và các vấn đề về mắt cho học sinh",
    },
    {
      id: 3,
      name: "Khám răng miệng",
      type: "Khám răng",
      startDate: "2024-04-01",
      endDate: "2024-04-05",
      status: "pending",
      studentCount: 1000,
      description:
        "Kiểm tra sức khỏe răng miệng và hướng dẫn vệ sinh răng miệng",
    },
    {
      id: 4,
      name: "Khám sức khỏe học sinh lớp 1",
      type: "Khám tổng quát",
      startDate: "2024-04-10",
      endDate: "2024-04-12",
      status: "pending",
      studentCount: 200,
      description: "Khám sức khỏe chi tiết cho học sinh lớp 1",
    },
    {
      id: 5,
      name: "Khám mắt cho học sinh cận thị",
      type: "Khám mắt",
      startDate: "2024-04-15",
      endDate: "2024-04-16",
      status: "pending",
      studentCount: 150,
      description:
        "Kiểm tra và cập nhật độ cận cho học sinh đã được chẩn đoán cận thị",
    },
  ];

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
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            Sửa
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  const handleEdit = (record) => {
    setSelectedCampaign(record);
    campaignForm.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: "Xóa chiến dịch",
      content: `Bạn có chắc chắn muốn xóa chiến dịch ${record.name}?`,
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk() {
        console.log("Delete campaign:", record);
      },
    });
  };

  const handleSearch = (values) => {
    console.log("Search values:", values);
  };

  const handleSubmit = () => {
    campaignForm.validateFields().then((values) => {
      console.log("Campaign data:", values);
      setIsModalVisible(false);
      campaignForm.resetFields();
      setSelectedCampaign(null);
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Chiến dịch khám sức khỏe</h1>
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
              <Form.Item name="type" label="Loại khám">
                <Select placeholder="Chọn loại khám">
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
                <Select placeholder="Chọn trạng thái">
                  <Select.Option value="completed">Hoàn thành</Select.Option>
                  <Select.Option value="in_progress">
                    Đang diễn ra
                  </Select.Option>
                  <Select.Option value="pending">Chưa bắt đầu</Select.Option>
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
              >
                Tìm kiếm
              </Button>
            </Col>
          </Row>
        </Form>
      </Card>

      <Card>
        <Table
          dataSource={healthCheckupCampaigns}
          columns={columns}
          rowKey="id"
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
      >
        <Form form={campaignForm} layout="vertical">
          <Form.Item
            name="name"
            label="Tên chiến dịch"
            rules={[
              { required: true, message: "Vui lòng nhập tên chiến dịch" },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="type"
            label="Loại khám"
            rules={[{ required: true, message: "Vui lòng chọn loại khám" }]}
          >
            <Select>
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
                name="startDate"
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
                name="endDate"
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
            <TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default HealthCheckupCampaigns;
