import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import {
  Button,
  DatePicker,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  message,
} from "antd";
import dayjs from "dayjs";
import { useState } from "react";

const { Option } = Select;

const StudentManagement = () => {
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  // Mock data - replace with real data from API
  const [students, setStudents] = useState([
    {
      id: 1,
      studentCode: "STU001",
      name: "John Doe",
      email: "john@example.com",
      dateOfBirth: "2010-05-15",
      gender: "MALE",
      class: "10A",
      grade: "10",
      bloodType: "A+",
      emergencyContact: "Jane Doe",
      emergencyPhone: "1234567890",
      status: "active",
    },
  ]);

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
      onOk: () => {
        setStudents(students.filter((student) => student.id !== studentId));
        message.success("Student deleted successfully");
      },
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const formattedValues = {
        ...values,
        dateOfBirth: values.dateOfBirth.toISOString(),
        role: "STUDENT", // Default role for students
      };

      if (editingStudent) {
        // Update existing student
        setStudents(
          students.map((student) =>
            student.id === editingStudent.id
              ? { ...student, ...formattedValues }
              : student
          )
        );
        message.success("Student updated successfully");
      } else {
        // Add new student
        const newStudent = {
          id: students.length + 1,
          ...formattedValues,
          status: "active",
        };
        setStudents([...students, newStudent]);
        message.success("Student added successfully");
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
      />

      <Modal
        title={editingStudent ? "Edit Student" : "Add Student"}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => setIsModalVisible(false)}
        okText={editingStudent ? "Update" : "Add"}
        width={800}
      >
        <Form form={form} layout="vertical">
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="studentCode"
              label="Student Code"
              rules={[
                { required: true, message: "Please input the student code!" },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="name"
              label="Name"
              rules={[{ required: true, message: "Please input the name!" }]}
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
              rules={[{ required: true, message: "Please input the class!" }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="grade"
              label="Grade"
              rules={[{ required: true, message: "Please input the grade!" }]}
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
              ]}
            >
              <Input />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default StudentManagement;
