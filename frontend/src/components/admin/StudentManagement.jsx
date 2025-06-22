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
  Spin,
  Table,
  Tag,
  Tooltip,
} from "antd";
import axios from "axios";
import dayjs from "dayjs";
import { useEffect, useState } from "react";

const { Option } = Select;

const StudentManagement = () => {
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]); // State for real student data
  const [filteredStudents, setFilteredStudents] = useState([]); // State for filtered students
  const [tableLoading, setTableLoading] = useState(false); // Loading for table

  const [searchForm] = Form.useForm();

  // Function to search
  const handleSearch = (values) => {
    const { studentCode, name, class: studentClass } = values;

    let filtered = [...students];

    if (studentCode) {
      filtered = filtered.filter((student) =>
        student.studentCode?.toLowerCase().includes(studentCode.toLowerCase())
      );
    }

    if (name) {
      filtered = filtered.filter((student) =>
        student.name?.toLowerCase().includes(name.toLowerCase())
      );
    }

    if (studentClass) {
      filtered = filtered.filter((student) =>
        student.class?.toLowerCase().includes(studentClass.toLowerCase())
      );
    }

    setFilteredStudents(filtered);
  };

  // Function to fetch students
  const fetchStudents = async () => {
    setTableLoading(true);
    try {
      const authToken = localStorage.getItem("token");
      if (!authToken) {
        message.error("Không tìm thấy token xác thực. Vui lòng đăng nhập lại.");
        setTableLoading(false);
        return;
      }

      const response = await axios.get("/api/admin/students", {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      // Map the fetched data to match the table's expected structure
      const formattedStudents = response.data.data.map((user) => ({
        id: user.id,
        studentCode: user.studentProfile?.studentCode,
        name: user.fullName,
        email: user.email,
        dateOfBirth: user.studentProfile?.dateOfBirth,
        gender: user.studentProfile?.gender,
        class: user.studentProfile?.class,
        grade: user.studentProfile?.grade,
        bloodType: user.studentProfile?.bloodType,
        emergencyContact: user.studentProfile?.emergencyContact,
        emergencyPhone: user.studentProfile?.emergencyPhone,
        status: user.isActive ? "active" : "inactive",
      }));
      setStudents(formattedStudents);
      setFilteredStudents(formattedStudents); // Initialize filtered students with all students
    } catch (error) {
      message.error(
        error.response?.data?.error || "Không thể tải danh sách học sinh"
      );
      console.error("Lỗi khi tải danh sách học sinh:", error);
    } finally {
      setTableLoading(false);
    }
  };

  // Fetch students on component mount
  useEffect(() => {
    fetchStudents();
  }, []);

  const columns = [
    {
      title: "Mã học sinh",
      dataIndex: "studentCode",
      key: "studentCode",
    },
    {
      title: "Tên",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Lớp",
      dataIndex: "class",
      key: "class",
    },
    {
      title: "Khối",
      dataIndex: "grade",
      key: "grade",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "active" ? "green" : "red"}>
          {status === "active" ? "Hoạt động" : "Không hoạt động"}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Tooltip title="Sửa">
            <Button
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              type="primary"
              size="small"
            />
          </Tooltip>
          <Popconfirm
            title="Xác nhận xóa học sinh"
            description={`Bạn có chắc chắn muốn xóa học sinh "${record.name}"?`}
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okType="danger"
          >
            <Tooltip title="Xóa">
              <Button danger icon={<DeleteOutlined />} size="small" />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleAdd = () => {
    setEditingStudent(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    form.setFieldsValue({
      studentCode: student.studentCode,
      name: student.name,
      email: student.email,
      dateOfBirth: dayjs(student.dateOfBirth),
      gender: student.gender,
      grade: Number(student.grade),
      class: student.class,
      emergencyContact: student.emergencyContact,
      emergencyPhone: student.emergencyPhone,
    });
    setIsModalVisible(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const formattedValues = editingStudent
        ? {
            studentCode: values.studentCode,
            fullName: values.name,
            email: values.email,
            phone: values.emergencyPhone,
            password: "defaultPassword123",
            dateOfBirth: values.dateOfBirth.toISOString(),
            gender: values.gender,
            grade: parseInt(values.grade),
            class: values.class,
            emergencyContact: values.emergencyContact,
            emergencyPhone: values.emergencyPhone,
            parentName: values.parentName,
          }
        : {
            fullName: values.name,
            email: values.email,
            phone: values.emergencyPhone,
            password: "defaultPassword123",
            dateOfBirth: values.dateOfBirth.toISOString(),
            gender: values.gender,
            grade: parseInt(values.grade),
            class: values.class,
            emergencyContact: values.emergencyContact,
            emergencyPhone: values.emergencyPhone,
            parentName: values.parentName,
          };

      if (editingStudent) {
        // Update student
        setLoading(true);
        try {
          const authToken = localStorage.getItem("token");
          if (!authToken) {
            message.error(
              "Không tìm thấy token xác thực. Vui lòng đăng nhập lại."
            );
            setLoading(false);
            setIsModalVisible(false);
            return;
          }

          const updateValues = {
            studentCode: values.studentCode,
            fullName: values.name,
            email: values.email,
            phone: values.emergencyPhone,
            dateOfBirth: values.dateOfBirth.toISOString(),
            gender: values.gender,
            grade: parseInt(values.grade),
            class: values.class,
            emergencyContact: values.emergencyContact,
            emergencyPhone: values.emergencyPhone,
          };

          await axios.put(
            `/api/admin/students/${editingStudent.id}`,
            updateValues,
            {
              headers: {
                Authorization: `Bearer ${authToken}`,
              },
            }
          );
          message.success("Cập nhật học sinh thành công");
          fetchStudents();
        } catch (error) {
          message.error(
            error.response?.data?.error || "Không thể cập nhật học sinh"
          );
          console.error("Lỗi khi cập nhật học sinh:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(true);
        try {
          const authToken = localStorage.getItem("token");
          if (!authToken) {
            message.error(
              "Không tìm thấy token xác thực. Vui lòng đăng nhập lại."
            );
            setLoading(false);
            setIsModalVisible(false);
            return;
          }

          await axios.post("/api/admin/students", formattedValues, {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          });

          message.success("Thêm học sinh thành công");
          fetchStudents();
        } catch (error) {
          message.error(
            error.response?.data?.error || "Không thể thêm học sinh"
          );
          console.error("Lỗi khi thêm học sinh:", error);
        } finally {
          setLoading(false);
        }
      }
      setIsModalVisible(false);
    } catch (error) {
      console.error("Lỗi xác thực:", error);
    }
  };

  const handleDelete = async (studentId) => {
    setTableLoading(true);
    try {
      const authToken = localStorage.getItem("token");
      if (!authToken) {
        message.error("Không tìm thấy token xác thực. Vui lòng đăng nhập lại.");
        setTableLoading(false);
        return;
      }
      // Call deleteUser endpoint for students
      await axios.delete(`/api/admin/users/${studentId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      message.success("Xóa học sinh thành công");
      fetchStudents(); // Refresh data after deletion
    } catch (error) {
      message.error(error.response?.data?.error || "Không thể xóa học sinh");
      console.error("Lỗi khi xóa học sinh:", error);
    } finally {
      setTableLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Quản lý học sinh</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Thêm học sinh
        </Button>
      </div>

      <Card>
        <Form form={searchForm} onFinish={handleSearch} layout="vertical">
          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item name="studentCode" label="Mã học sinh">
                <Input placeholder="Nhập mã học sinh" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name="name" label="Tên học sinh">
                <Input placeholder="Nhập tên học sinh" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name="class" label="Lớp">
                <Input placeholder="Nhập lớp" />
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={24} className="text-right">
              <Space>
                <Button
                  onClick={() => {
                    searchForm.resetFields();
                    setFilteredStudents(students);
                  }}
                >
                  Xóa bộ lọc
                </Button>
                <Button
                  type="primary"
                  icon={<SearchOutlined />}
                  htmlType="submit"
                >
                  Tìm kiếm
                </Button>
              </Space>
            </Col>
          </Row>
        </Form>
      </Card>

      <Table
        columns={columns}
        dataSource={filteredStudents}
        rowKey="id"
        pagination={{ pageSize: 5, showQuickJumper: true }}
        loading={tableLoading}
      />

      <Modal
        title={editingStudent ? "Sửa thông tin học sinh" : "Thêm học sinh mới"}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => setIsModalVisible(false)}
        okText={editingStudent ? "Cập nhật" : "Thêm"}
        confirmLoading={loading}
      >
        <Spin spinning={loading}>
          <Form form={form} layout="vertical">
            {editingStudent && (
              <Form.Item
                name="studentCode"
                label="Mã học sinh"
                rules={[
                  { required: true, message: "Vui lòng nhập mã học sinh!" },
                ]}
              >
                <Input disabled />
              </Form.Item>
            )}
            <Form.Item
              name="name"
              label="Họ và tên"
              rules={[{ required: true, message: "Vui lòng nhập họ và tên!" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: "Vui lòng nhập email!" },
                { type: "email", message: "Email không hợp lệ!" },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="dateOfBirth"
              label="Ngày sinh"
              rules={[{ required: true, message: "Vui lòng chọn ngày sinh!" }]}
            >
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item
              name="gender"
              label="Giới tính"
              rules={[{ required: true, message: "Vui lòng chọn giới tính!" }]}
            >
              <Select>
                <Option value="Nam">Nam</Option>
                <Option value="Nữ">Nữ</Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="grade"
              label="Khối"
              rules={[{ required: true, message: "Vui lòng nhập khối!" }]}
            >
              <Select>
                <Option value="1">1</Option>
                <Option value="2">2</Option>
                <Option value="3">3</Option>
                <Option value="4">4</Option>
                <Option value="5">5</Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="class"
              label="Lớp"
              rules={[{ required: true, message: "Vui lòng nhập lớp!" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="emergencyContact"
              label="Người liên hệ khẩn cấp"
              rules={[
                { required: true, message: "Vui lòng nhập tên người liên hệ!" },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="emergencyPhone"
              label="Số điện thoại liên hệ khẩn cấp"
              rules={[
                { required: true, message: "Vui lòng nhập số điện thoại!" },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="parentName"
              label="Tên phụ huynh"
              rules={[
                { required: true, message: "Vui lòng nhập tên phụ huynh!" },
              ]}
            >
              <Input />
            </Form.Item>
          </Form>
        </Spin>
      </Modal>
    </div>
  );
};

export default StudentManagement;
