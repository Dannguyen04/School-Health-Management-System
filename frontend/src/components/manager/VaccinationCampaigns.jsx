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

const VaccinationCampaigns = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [searchForm] = Form.useForm();
  const [campaignForm] = Form.useForm();

  // Mock data
  const vaccinationCampaigns = [
    {
      id: 1,
      name: "Tiêm chủng mở rộng đầu năm 2024",
      vaccine: "Vắc xin 5 trong 1",
      startDate: "2024-03-01",
      endDate: "2024-03-15",
      status: "completed",
      studentCount: 1200,
      description: "Tiêm chủng vắc xin 5 trong 1 cho học sinh mới nhập học",
    },
    {
      id: 2,
      name: "Tiêm vắc xin cúm mùa",
      vaccine: "Vắc xin cúm",
      startDate: "2024-03-20",
      endDate: "2024-03-25",
      status: "in_progress",
      studentCount: 800,
      description: "Tiêm vắc xin cúm mùa cho học sinh toàn trường",
    },
    {
      id: 3,
      name: "Tiêm vắc xin 6 trong 1",
      vaccine: "Vắc xin 6 trong 1",
      startDate: "2024-04-01",
      endDate: "2024-04-05",
      status: "pending",
      studentCount: 1000,
      description: "Tiêm vắc xin 6 trong 1 cho học sinh lớp 1",
    },
    {
      id: 4,
      name: "Tiêm vắc xin viêm não Nhật Bản",
      vaccine: "Vắc xin viêm não Nhật Bản",
      startDate: "2024-04-10",
      endDate: "2024-04-12",
      status: "pending",
      studentCount: 200,
      description: "Tiêm vắc xin viêm não Nhật Bản cho học sinh lớp 2",
    },
    {
      id: 5,
      name: "Tiêm vắc xin thủy đậu",
      vaccine: "Vắc xin thủy đậu",
      startDate: "2024-04-15",
      endDate: "2024-04-16",
      status: "pending",
      studentCount: 150,
      description: "Tiêm vắc xin thủy đậu cho học sinh chưa tiêm",
    },
  ];

  const columns = [
    {
      title: "Tên chiến dịch",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Vắc xin",
      dataIndex: "vaccine",
      key: "vaccine",
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
              <Form.Item name="vaccine" label="Vắc xin">
                <Select placeholder="Chọn vắc xin">
                  <Select.Option value="Vắc xin 5 trong 1">
                    Vắc xin 5 trong 1
                  </Select.Option>
                  <Select.Option value="Vắc xin 6 trong 1">
                    Vắc xin 6 trong 1
                  </Select.Option>
                  <Select.Option value="Vắc xin cúm">Vắc xin cúm</Select.Option>
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
          dataSource={vaccinationCampaigns}
          columns={columns}
          rowKey="id"
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
            name="vaccine"
            label="Vắc xin"
            rules={[{ required: true, message: "Vui lòng chọn vắc xin" }]}
          >
            <Select>
              <Select.Option value="Vắc xin 5 trong 1">
                Vắc xin 5 trong 1
              </Select.Option>
              <Select.Option value="Vắc xin 6 trong 1">
                Vắc xin 6 trong 1
              </Select.Option>
              <Select.Option value="Vắc xin cúm">Vắc xin cúm</Select.Option>
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

export default VaccinationCampaigns;
