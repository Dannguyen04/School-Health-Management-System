import { FileTextOutlined, SearchOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Space,
  Table,
  Tag,
} from "antd";
import { useState } from "react";
import { healthCheckups } from "../../mock/nurseData";

const { TextArea } = Input;

const HealthCheckups = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchForm] = Form.useForm();
  const [checkupForm] = Form.useForm();

  const columns = [
    {
      title: "Mã học sinh",
      dataIndex: "studentId",
      key: "studentId",
    },
    {
      title: "Tên học sinh",
      dataIndex: "studentName",
      key: "studentName",
    },
    {
      title: "Lớp",
      dataIndex: "grade",
      key: "grade",
    },
    {
      title: "Ngày khám",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "BMI",
      dataIndex: "bmi",
      key: "bmi",
      render: (bmi) => (
        <Tag
          color={
            bmi < 18.5
              ? "blue"
              : bmi < 25
              ? "green"
              : bmi < 30
              ? "orange"
              : "red"
          }
        >
          {bmi}
        </Tag>
      ),
    },
    {
      title: "Thị lực",
      dataIndex: "vision",
      key: "vision",
    },
    {
      title: "Huyết áp",
      dataIndex: "bloodPressure",
      key: "bloodPressure",
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            icon={<FileTextOutlined />}
            onClick={() => handleViewDetails(record)}
          >
            Chi tiết
          </Button>
        </Space>
      ),
    },
  ];

  const handleViewDetails = (record) => {
    Modal.info({
      title: "Chi tiết khám sức khỏe",
      content: (
        <div className="space-y-4">
          <p>
            <strong>Học sinh:</strong> {record.studentName}
          </p>
          <p>
            <strong>Chiều cao:</strong> {record.height} cm
          </p>
          <p>
            <strong>Cân nặng:</strong> {record.weight} kg
          </p>
          <p>
            <strong>BMI:</strong> {record.bmi}
          </p>
          <p>
            <strong>Thị lực:</strong> {record.vision}
          </p>
          <p>
            <strong>Huyết áp:</strong> {record.bloodPressure}
          </p>
          <p>
            <strong>Ghi chú:</strong> {record.notes}
          </p>
        </div>
      ),
    });
  };

  const handleSearch = (values) => {
    console.log("Search values:", values);
  };

  const handleSubmit = () => {
    checkupForm.validateFields().then((values) => {
      console.log("New health checkup record:", values);
      setIsModalVisible(false);
      checkupForm.resetFields();
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Khám sức khỏe</h1>
        {/* <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalVisible(true)}
        >
          Thêm khám
        </Button> */}
      </div>

      <Card>
        <Form form={searchForm} onFinish={handleSearch} layout="vertical">
          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item name="studentId" label="Mã học sinh">
                <Input placeholder="Nhập mã học sinh" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name="grade" label="Lớp">
                <Select placeholder="Chọn lớp">
                  <Select.Option value="Lớp 1">Lớp 1</Select.Option>
                  <Select.Option value="Lớp 2">Lớp 2</Select.Option>
                  <Select.Option value="Lớp 3">Lớp 3</Select.Option>
                  <Select.Option value="Lớp 4">Lớp 4</Select.Option>
                  <Select.Option value="Lớp 5">Lớp 5</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name="date" label="Ngày khám">
                <DatePicker style={{ width: "100%" }} />
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
        <Table dataSource={healthCheckups} columns={columns} rowKey="id" />
      </Card>

      <Modal
        title="Thêm khám sức khỏe"
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setIsModalVisible(false);
          checkupForm.resetFields();
        }}
        width={600}
      >
        <Form form={checkupForm} layout="vertical">
          <Form.Item
            name="studentId"
            label="Mã học sinh"
            rules={[{ required: true, message: "Vui lòng nhập mã học sinh" }]}
          >
            <Input />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="height"
                label="Chiều cao (cm)"
                rules={[{ required: true, message: "Vui lòng nhập chiều cao" }]}
              >
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="weight"
                label="Cân nặng (kg)"
                rules={[{ required: true, message: "Vui lòng nhập cân nặng" }]}
              >
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="vision"
                label="Thị lực"
                rules={[{ required: true, message: "Vui lòng nhập thị lực" }]}
              >
                <Input placeholder="Ví dụ: 10/10" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="bloodPressure"
                label="Huyết áp"
                rules={[{ required: true, message: "Vui lòng nhập huyết áp" }]}
              >
                <Input placeholder="Ví dụ: 120/80" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="notes" label="Ghi chú">
            <TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default HealthCheckups;
