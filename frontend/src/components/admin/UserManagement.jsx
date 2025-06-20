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
  message,
  Modal,
  Row,
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
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [filteredUsers, setFilteredUsers] = useState([]);

  const [searchForm] = Form.useForm();

  const handleSearch = (values) => {
    const { name, email, role } = values;

    let filtered = [...users];

    if (name) {
      filtered = filtered.filter((user) =>
        user.name?.toLowerCase().includes(name.toLowerCase())
      );
    }

    if (email) {
      filtered = filtered.filter((user) =>
        user.email?.toLowerCase().includes(email)
      );
    }

    if (role) {
      filtered = filtered.filter((user) =>
        user.role.toLowerCase().includes(role.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  };

  const fetchUsers = async () => {
    setTableLoading(true);
    try {
      const authToken = localStorage.getItem("token");
      if (!authToken) {
        message.error("Không tìm thấy token xác thực. Vui lòng đăng nhập lại.");
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
      setFilteredUsers(formattedUsers);
    } catch (error) {
      message.error(
        error.response?.data?.message || "Không thể tải danh sách người dùng"
      );
      console.error("Lỗi khi tải danh sách người dùng:", error);
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const columns = [
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
      title: "Vai trò",
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
              : role === "MANAGER"
              ? "purple"
              : "default"
          }
        >
          {role === "ADMIN"
            ? "Quản trị viên"
            : role === "SCHOOL_NURSE"
            ? "Y tá trường học"
            : role === "PARENT"
            ? "Phụ huynh"
            : role === "MANAGER"
            ? "Quản lý"
            : role}
        </Tag>
      ),
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
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            Sửa
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            Xóa
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
    setUserToDelete(userId);
    setIsDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    setTableLoading(true);
    try {
      const authToken = localStorage.getItem("token");
      if (!authToken) {
        message.error("Không tìm thấy token xác thực. Vui lòng đăng nhập lại.");
        setTableLoading(false);
        setIsDeleteModalVisible(false);
        return;
      }
      await axios.delete(`/api/admin/users/${userToDelete}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      message.success("Xóa người dùng thành công");
      fetchUsers();
    } catch (error) {
      message.error(error.response?.data?.error || "Không thể xóa người dùng");
      console.error("Lỗi khi xóa người dùng:", error);
    } finally {
      setTableLoading(false);
      setIsDeleteModalVisible(false);
      setUserToDelete(null);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const formattedValues = {
        name: values.name,
        email: values.email,
        password: values.password,
        role: values.role,
      };

      setAddEditLoading(true);
      try {
        const authToken = localStorage.getItem("token");
        if (!authToken) {
          message.error(
            "Không tìm thấy token xác thực. Vui lòng đăng nhập lại."
          );
          setAddEditLoading(false);
          setIsModalVisible(false);
          return;
        }

        if (editingUser) {
          // Update user
          await axios.put(
            `/api/admin/users/${editingUser.id}`,
            {
              fullName: values.name,
              email: values.email,
              role: values.role,
              isActive: true,
            },
            {
              headers: {
                Authorization: `Bearer ${authToken}`,
              },
            }
          );
          message.success("Cập nhật người dùng thành công");
        } else {
          // Add new user
          await axios.post("/api/admin/users/addRole", formattedValues, {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          });
          message.success("Thêm người dùng thành công");
        }
        fetchUsers();
        setIsModalVisible(false);
      } catch (error) {
        message.error(
          error.response?.data?.error || "Không thể thực hiện thao tác"
        );
        console.error("Lỗi:", error);
      } finally {
        setAddEditLoading(false);
      }
    } catch (error) {
      console.error("Lỗi xác thực:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Quản lý người dùng</h1>
        <div>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Thêm người dùng
          </Button>
        </div>
      </div>

      <Card>
        <Form form={searchForm} onFinish={handleSearch} layout="vertical">
          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item name="name" label="Tên người dùng">
                <Input placeholder="Nhập tên người dùng" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name="email" label="Email">
                <Input placeholder="Nhập email" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name="role" label="Vai trò">
                <Select placeholder="Chọn vai trò" allowClear>
                  <Option value="ADMIN">Quản trị viên</Option>
                  <Option value="SCHOOL_NURSE">Y tá trường học</Option>
                  <Option value="PARENT">Phụ huynh</Option>
                  <Option value="MANAGER">Quản lý</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={24} className="text-right">
              <Space>
                <Button
                  onClick={() => {
                    searchForm.resetFields();
                    setFilteredUsers(users);
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
        dataSource={filteredUsers}
        rowKey="id"
        pagination={{ pageSize: 5 }}
        loading={tableLoading}
      />

      <Modal
        title="Xác nhận xóa người dùng"
        open={isDeleteModalVisible}
        onOk={confirmDelete}
        onCancel={() => {
          setIsDeleteModalVisible(false);
          setUserToDelete(null);
        }}
        okText="Xóa"
        okType="danger"
        cancelText="Hủy"
        confirmLoading={tableLoading} // Use tableLoading for delete confirmation as well
      >
        <p>Bạn có chắc chắn muốn xóa người dùng này?</p>
      </Modal>

      <Modal
        title={editingUser ? "Sửa người dùng" : "Thêm người dùng"}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => setIsModalVisible(false)}
        okText={editingUser ? "Cập nhật" : "Thêm"}
        confirmLoading={addEditLoading}
      >
        <Spin spinning={addEditLoading}>
          <Form form={form} layout="vertical">
            <Form.Item
              name="name"
              label="Tên"
              rules={[{ required: true, message: "Vui lòng nhập tên!" }]}
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
            {!editingUser && (
              <Form.Item
                name="password"
                label="Mật khẩu"
                rules={[
                  { required: true, message: "Vui lòng nhập mật khẩu!" },
                  { min: 8, message: "Mật khẩu phải có ít nhất 8 ký tự!" },
                ]}
              >
                <Input.Password />
              </Form.Item>
            )}
            <Form.Item
              name="role"
              label="Vai trò"
              rules={[{ required: true, message: "Vui lòng chọn vai trò!" }]}
            >
              <Select>
                <Option value="ADMIN">Quản trị viên</Option>
                <Option value="SCHOOL_NURSE">Y tá trường học</Option>
                <Option value="PARENT">Phụ huynh</Option>
                <Option value="MANAGER">Quản lý</Option>
              </Select>
            </Form.Item>
          </Form>
        </Spin>
      </Modal>
    </div>
  );
};

export default UserManagement;
