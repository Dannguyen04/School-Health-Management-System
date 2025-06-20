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
  Form,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Table,
} from "antd";
import { useState } from "react";

const StudentList = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchForm] = Form.useForm();
  const [studentForm] = Form.useForm();

  // Mock data
  const students = [
    {
      studentId: "HS001",
      fullName: "Nguyễn Văn A",
      class: "Lớp 1",
      allergies: "Không có",
      chronicDiseases: "Không có",
    },
    {
      studentId: "HS002",
      fullName: "Trần Thị B",
      class: "Lớp 1",
      allergies: "Dị ứng sữa",
      chronicDiseases: "Hen suyễn",
    },
    {
      studentId: "HS003",
      fullName: "Lê Văn C",
      class: "Lớp 2",
      allergies: "Không có",
      chronicDiseases: "Không có",
    },
    {
      studentId: "HS004",
      fullName: "Phạm Thị D",
      class: "Lớp 2",
      allergies: "Dị ứng hải sản",
      chronicDiseases: "Không có",
    },
    {
      studentId: "HS005",
      fullName: "Hoàng Văn E",
      class: "Lớp 3",
      allergies: "Không có",
      chronicDiseases: "Tiểu đường",
    },
    {
      studentId: "HS006",
      fullName: "Đỗ Thị F",
      class: "Lớp 3",
      allergies: "Dị ứng phấn hoa",
      chronicDiseases: "Không có",
    },
    {
      studentId: "HS007",
      fullName: "Vũ Văn G",
      class: "Lớp 4",
      allergies: "Không có",
      chronicDiseases: "Không có",
    },
    {
      studentId: "HS008",
      fullName: "Đặng Thị H",
      class: "Lớp 4",
      allergies: "Dị ứng thuốc",
      chronicDiseases: "Không có",
    },
    {
      studentId: "HS009",
      fullName: "Bùi Văn I",
      class: "Lớp 5",
      allergies: "Không có",
      chronicDiseases: "Không có",
    },
    {
      studentId: "HS010",
      fullName: "Ngô Thị K",
      class: "Lớp 5",
      allergies: "Dị ứng thời tiết",
      chronicDiseases: "Không có",
    },
  ];

  const columns = [
    {
      title: "Mã học sinh",
      dataIndex: "studentId",
      key: "studentId",
    },
    {
      title: "Họ và tên",
      dataIndex: "fullName",
      key: "fullName",
    },
    {
      title: "Lớp",
      dataIndex: "class",
      key: "class",
    },
    {
      title: "Dị ứng",
      dataIndex: "allergies",
      key: "allergies",
    },
    {
      title: "Bệnh mãn tính",
      dataIndex: "chronicDiseases",
      key: "chronicDiseases",
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
    setSelectedStudent(record);
    studentForm.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: "Xóa học sinh",
      content: `Bạn có chắc chắn muốn xóa học sinh ${record.fullName}?`,
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk() {
        console.log("Delete student:", record);
      },
    });
  };

  const handleSearch = (values) => {
    console.log("Search values:", values);
  };

  const handleSubmit = () => {
    studentForm.validateFields().then((values) => {
      console.log("Student data:", values);
      setIsModalVisible(false);
      studentForm.resetFields();
      setSelectedStudent(null);
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Danh sách học sinh</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalVisible(true)}
        >
          Thêm học sinh
        </Button>
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
              <Form.Item name="class" label="Lớp">
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
              <Form.Item name="name" label="Tên học sinh">
                <Input placeholder="Nhập tên học sinh" />
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
        <Table dataSource={students} columns={columns} rowKey="studentId" />
      </Card>

      <Modal
        title={selectedStudent ? "Sửa thông tin học sinh" : "Thêm học sinh mới"}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setIsModalVisible(false);
          studentForm.resetFields();
          setSelectedStudent(null);
        }}
        width={600}
      >
        <Form form={studentForm} layout="vertical">
          <Form.Item
            name="studentId"
            label="Mã học sinh"
            rules={[{ required: true, message: "Vui lòng nhập mã học sinh" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="fullName"
            label="Họ và tên"
            rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="class"
            label="Lớp"
            rules={[{ required: true, message: "Vui lòng chọn lớp" }]}
          >
            <Select>
              <Select.Option value="Lớp 1">Lớp 1</Select.Option>
              <Select.Option value="Lớp 2">Lớp 2</Select.Option>
              <Select.Option value="Lớp 3">Lớp 3</Select.Option>
              <Select.Option value="Lớp 4">Lớp 4</Select.Option>
              <Select.Option value="Lớp 5">Lớp 5</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="allergies" label="Dị ứng">
            <Input.TextArea rows={2} />
          </Form.Item>

          <Form.Item name="chronicDiseases" label="Bệnh mãn tính">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default StudentList;
