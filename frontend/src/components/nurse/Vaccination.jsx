import { SearchOutlined } from "@ant-design/icons";
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
import { useState } from "react";
import { vaccinations } from "../../mock/nurseData";

const { TextArea } = Input;

const Vaccination = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchForm] = Form.useForm();
  const [vaccinationForm] = Form.useForm();

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
      title: "Tên vắc xin",
      dataIndex: "vaccineName",
      key: "vaccineName",
    },
    {
      title: "Ngày tiêm",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Số lô",
      dataIndex: "batchNumber",
      key: "batchNumber",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "completed" ? "green" : "orange"}>
          {status === "completed" ? "Đã tiêm" : "Đang chờ"}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button onClick={() => handleViewDetails(record)}>Chi tiết</Button>
        </Space>
      ),
    },
  ];

  const handleViewDetails = (record) => {
    Modal.info({
      title: "Chi tiết tiêm chủng",
      content: (
        <div className="space-y-4">
          <p>
            <strong>Học sinh:</strong> {record.studentName}
          </p>
          <p>
            <strong>Vắc xin:</strong> {record.vaccineName}
          </p>
          <p>
            <strong>Ngày tiêm:</strong> {record.date}
          </p>
          <p>
            <strong>Số lô:</strong> {record.batchNumber}
          </p>
          <p>
            <strong>Trạng thái:</strong>{" "}
            {record.status === "completed" ? "Đã tiêm" : "Đang chờ"}
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
    vaccinationForm.validateFields().then((values) => {
      console.log("New vaccination record:", values);
      setIsModalVisible(false);
      vaccinationForm.resetFields();
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Hồ sơ tiêm chủng</h1>
        {/* <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalVisible(true)}
        >
          Thêm hồ sơ
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
              <Form.Item name="vaccineName" label="Vắc xin">
                <Select placeholder="Chọn vắc xin">
                  <Select.Option value="Cúm">Cúm</Select.Option>
                  <Select.Option value="Sởi - Quai bị - Rubella">
                    Sởi - Quai bị - Rubella
                  </Select.Option>
                  <Select.Option value="Bạch hầu - Ho gà - Uốn ván">
                    Bạch hầu - Ho gà - Uốn ván
                  </Select.Option>
                  <Select.Option value="Viêm gan B">Viêm gan B</Select.Option>
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
        <Table dataSource={vaccinations} columns={columns} rowKey="id" />
      </Card>

      <Modal
        title="Thêm hồ sơ tiêm chủng"
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setIsModalVisible(false);
          vaccinationForm.resetFields();
        }}
        width={600}
      >
        <Form form={vaccinationForm} layout="vertical">
          <Form.Item
            name="studentId"
            label="Mã học sinh"
            rules={[{ required: true, message: "Vui lòng nhập mã học sinh" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="vaccineName"
            label="Tên vắc xin"
            rules={[{ required: true, message: "Vui lòng chọn vắc xin" }]}
          >
            <Select>
              <Select.Option value="Cúm">Cúm</Select.Option>
              <Select.Option value="Sởi - Quai bị - Rubella">
                Sởi - Quai bị - Rubella
              </Select.Option>
              <Select.Option value="Bạch hầu - Ho gà - Uốn ván">
                Bạch hầu - Ho gà - Uốn ván
              </Select.Option>
              <Select.Option value="Viêm gan B">Viêm gan B</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="date"
            label="Ngày tiêm"
            rules={[{ required: true, message: "Vui lòng chọn ngày tiêm" }]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="batchNumber"
            label="Số lô"
            rules={[{ required: true, message: "Vui lòng nhập số lô" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="notes" label="Ghi chú">
            <TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Vaccination;
