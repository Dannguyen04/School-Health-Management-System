import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import {
  Button,
  Form,
  Input,
  message,
  Modal,
  Select,
  Space,
  Spin,
  Table,
  Tag,
} from "antd";
import axios from "axios";
import { useEffect, useState } from "react";

const { Option } = Select;

const UserManagement = () => {
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [addEditLoading, setAddEditLoading] = useState(false);

  const fetchUsers = async () => {
    setTableLoading(true);
    try {
      const authToken = localStorage.getItem("token");
      if (!authToken) {
        message.error("Authentication token not found. Please log in.");
        setTableLoading(false);
        return;
      }

      const response = await axios.get("/api/admin/users/getAllUsers", {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const formattedUsers = response.data.data.map((user) => ({
        id: user.id,
        name: user.fullName,
        email: user.email,
        role: user.role,
        status: user.isActive ? "active" : "inactive",
      }));
      setUsers(formattedUsers);
    } catch (error) {
      message.error(error.response?.data?.message || "Failed to load users");
      console.error("Error fetching users:", error);
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const columns = [
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
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role) => (
        <Tag
          color={
            role === "ADMIN"
              ? "red"
              : role === "SCHOOL_NURSE"
              ? "blue"
              : role === "PARENT"
              ? "green"
              : "default"
          }
        >
          {role}
        </Tag>
      ),
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
    setEditingUser(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    form.setFieldsValue(user);
    setIsModalVisible(true);
  };

  const handleDelete = (userId) => {
    Modal.confirm({
      title: "Are you sure you want to delete this user?",
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
          await axios.delete(
            `http://localhost:5000/api/admin/users/${userId}`,
            {
              headers: {
                Authorization: `Bearer ${authToken}`,
              },
            }
          );
          message.success("User deleted successfully");
          fetchUsers();
        } catch (error) {
          message.error(
            error.response?.data?.message || "Failed to delete user"
          );
          console.error("Error deleting user:", error);
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
        password: values.password,
        role: values.role,
      };

      if (editingUser) {
        message.info("Update user functionality is not yet implemented.");
      } else {
        setAddEditLoading(true);
        try {
          const authToken = localStorage.getItem("token");
          if (!authToken) {
            message.error("Authentication token not found. Please log in.");
            setAddEditLoading(false);
            setIsModalVisible(false);
            return;
          }

          const response = await axios.post(
            "http://localhost:5000/api/admin/users/add",
            formattedValues,
            {
              headers: {
                Authorization: `Bearer ${authToken}`,
              },
            }
          );

          message.success("User added successfully");
          fetchUsers();
        } catch (error) {
          message.error(error.response?.data?.error || "Failed to add user");
          console.error("Error adding user:", error);
        } finally {
          setAddEditLoading(false);
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
        <h1 className="text-2xl font-bold">User Management</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Add User
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={users}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        loading={tableLoading}
      />

      <Modal
        title={editingUser ? "Edit User" : "Add User"}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => setIsModalVisible(false)}
        okText={editingUser ? "Update" : "Add"}
        confirmLoading={addEditLoading}
      >
        <Spin spinning={addEditLoading}>
          <Form form={form} layout="vertical">
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
              name="password"
              label="Password"
              rules={[
                { required: true, message: "Please input the password!" },
              ]}
            >
              <Input.Password />
            </Form.Item>
            <Form.Item
              name="role"
              label="Role"
              rules={[{ required: true, message: "Please select a role!" }]}
            >
              <Select>
                <Option value="ADMIN">Admin</Option>
                <Option value="SCHOOL_NURSE">School Nurse</Option>
                <Option value="PARENT">Parent</Option>
                <Option value="MANAGER">Manager</Option>
              </Select>
            </Form.Item>
          </Form>
        </Spin>
      </Modal>
    </div>
  );
};

export default UserManagement;
