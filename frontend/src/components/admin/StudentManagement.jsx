import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import {
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Select,
  Space,
  Spin,
  Table,
  Tag,
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
  const [tableLoading, setTableLoading] = useState(false); // Loading for table

  // Function to fetch students
  const fetchStudents = async () => {
    setTableLoading(true);
    try {
      const authToken = localStorage.getItem("token");
      if (!authToken) {
        message.error("Authentication token not found. Please log in.");
        setTableLoading(false);
        return;
      }

      const response = await axios.get("/api/admin/students/all", {
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
        status: user.isActive ? "active" : "inactive", // Assuming isActive maps to status
      }));
      setStudents(formattedStudents);
    } catch (error) {
      message.error(error.response?.data?.error || "Failed to load students");
      console.error("Error fetching students:", error);
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
      title: "Student Code",
      dataIndex: "studentCode",
      key: "studentCode",
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Class",
      dataIndex: "class",
      key: "class",
    },
    {
      title: "Grade",
      dataIndex: "grade",
      key: "grade",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "active" ? "green" : "red"}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            Edit
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            Delete
          </Button>
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
      ...student,
      dateOfBirth: dayjs(student.dateOfBirth),
      grade: Number(student.grade),
    });
    setIsModalVisible(true);
  };

  const handleDelete = (studentId) => {
    Modal.confirm({
      title: "Are you sure you want to delete this student?",
      content: "This action cannot be undone.",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        try {
          const authToken = localStorage.getItem("token");
          if (!authToken) {
            message.error("Authentication token not found. Please log in.");
            return;
          }
          await axios.delete(`/api/admin/students/${studentId}`, {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          });
          message.success("Student deleted successfully");
          fetchStudents(); // Refresh data after deletion
        } catch (error) {
          message.error(
            error.response?.data?.error || "Failed to delete student"
          );
          console.error("Error deleting student:", error);
        }
      },
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const formattedValues = {
        fullName: values.name,
        email: values.email,
        phone: values.emergencyPhone,
        password: "defaultPassword123",
        studentCode: values.studentCode,
        dateOfBirth: values.dateOfBirth.toISOString(),
        gender: values.gender,
        grade: parseInt(values.grade),
        class: values.class,
        emergencyContact: values.emergencyContact,
        emergencyPhone: values.emergencyPhone,
        parentName: values.parentName,
      };

      if (editingStudent) {
        message.info("Update student functionality is not yet implemented.");
      } else {
        setLoading(true);
        try {
          const authToken = localStorage.getItem("token");
          if (!authToken) {
            message.error("Authentication token not found. Please log in.");
            setLoading(false);
            setIsModalVisible(false);
            return;
          }

          const response = await axios.post(
            "http://localhost:5000/api/admin/students",
            formattedValues,
            {
              headers: {
                Authorization: `Bearer ${authToken}`,
              },
            }
          );

          message.success("Student added successfully");
          fetchStudents(); // Refresh data after adding a new student
        } catch (error) {
          message.error(error.response?.data?.error || "Failed to add student");
          console.error("Error adding student:", error);
        } finally {
          setLoading(false);
        }
      }
      setIsModalVisible(false);
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Student Management</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Add Student
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={students}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        loading={tableLoading}
      />

      <Modal
        title={editingStudent ? "Edit Student" : "Add Student"}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => setIsModalVisible(false)}
        okText={editingStudent ? "Update" : "Add"}
        width={800}
        confirmLoading={loading}
      >
        <Spin spinning={loading}>
          <Form form={form} layout="vertical">
            <div className="grid grid-cols-2 gap-4">
              <Form.Item
                name="studentCode"
                label="Student Code"
                rules={[
                  { required: true, message: "Please input the student code!" },
                  {
                    pattern: /^[A-Z0-9]+$/,
                    message:
                      "Student code must contain only uppercase letters and numbers!",
                  },
                ]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                name="name"
                label="Name"
                rules={[
                  { required: true, message: "Please input the name!" },
                  { min: 2, message: "Name must be at least 2 characters!" },
                ]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: "Please input the email!" },
                  { type: "email", message: "Please enter a valid email!" },
                ]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                name="dateOfBirth"
                label="Date of Birth"
                rules={[
                  { required: true, message: "Please select date of birth!" },
                  {
                    validator: (_, value) => {
                      if (value && dayjs().diff(value, "year") < 3) {
                        return Promise.reject(
                          "Student must be at least 3 years old!"
                        );
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <DatePicker className="w-full" />
              </Form.Item>

              <Form.Item
                name="gender"
                label="Gender"
                rules={[{ required: true, message: "Please select gender!" }]}
              >
                <Select>
                  <Option value="MALE">Male</Option>
                  <Option value="FEMALE">Female</Option>
                  <Option value="OTHER">Other</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="class"
                label="Class"
                rules={[
                  { required: true, message: "Please input the class!" },
                  {
                    pattern: /^[0-9]+[A-Z]$/,
                    message:
                      "Class must be in format: number + letter (e.g., 1A)!",
                  },
                ]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                name="grade"
                label="Grade"
                rules={[
                  { required: true, message: "Please input the grade!" },
                  {
                    validator: (_, value) => {
                      if (value === null || value === undefined) {
                        return Promise.reject("Please input the grade!");
                      }
                      const numValue = Number(value);
                      if (isNaN(numValue)) {
                        return Promise.reject("Grade must be a number!");
                      }
                      if (numValue < 1 || numValue > 5) {
                        return Promise.reject("Grade must be between 1 and 5!");
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <InputNumber className="w-full" />
              </Form.Item>

              <Form.Item
                name="parentName"
                label="Parent Name"
                rules={[
                  { required: true, message: "Please input parent name!" },
                  {
                    min: 2,
                    message: "Parent name must be at least 2 characters!",
                  },
                ]}
              >
                <Input />
              </Form.Item>

              <Form.Item name="bloodType" label="Blood Type">
                <Select allowClear>
                  <Option value="A+">A+</Option>
                  <Option value="A-">A-</Option>
                  <Option value="B+">B+</Option>
                  <Option value="B-">B-</Option>
                  <Option value="AB+">AB+</Option>
                  <Option value="AB-">AB-</Option>
                  <Option value="O+">O+</Option>
                  <Option value="O-">O-</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="emergencyContact"
                label="Emergency Contact Name"
                rules={[
                  {
                    required: true,
                    message: "Please input emergency contact name!",
                  },
                  {
                    min: 2,
                    message:
                      "Emergency contact name must be at least 2 characters!",
                  },
                ]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                name="emergencyPhone"
                label="Emergency Contact Phone"
                rules={[
                  {
                    required: true,
                    message: "Please input emergency contact phone!",
                  },
                  {
                    pattern: /^[0-9]{10}$/,
                    message: "Phone number must be 10 digits!",
                  },
                ]}
              >
                <Input />
              </Form.Item>
            </div>
          </Form>
        </Spin>
      </Modal>
    </div>
  );
};

export default StudentManagement;
