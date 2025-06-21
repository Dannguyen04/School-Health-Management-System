import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
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
import { useEffect, useState } from "react";

const { Option } = Select;

const UserManagement = () => {
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [addEditLoading, setAddEditLoading] = useState(false);
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
        user.email?.toLowerCase().includes(email.toLowerCase())
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

      const response = await axios.get(
        "http://localhost:5000/admin/users/getAllUsers",
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      console.log("API Response:", response.data); // Debug log

      if (response.data.success && response.data.data) {
        const formattedUsers = response.data.data.map((user) => ({
          id: user.id,
          name: user.fullName,
          email: user.email,
          role: user.role,
          status: user.isActive ? "active" : "inactive",
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        }));

        setUsers(formattedUsers);
        setFilteredUsers(formattedUsers);

        // Tính toán thống kê
        const total = formattedUsers.length;
        const active = formattedUsers.filter(
          (user) => user.status === "active"
        ).length;
        const inactive = total - active;

        setStats({ total, active, inactive });
      } else {
        message.error("Dữ liệu không hợp lệ từ server");
      }
    } catch (error) {
      console.error("Chi tiết lỗi:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        message.error(
          error.response.data?.error ||
            error.response.data?.message ||
            "Không thể tải danh sách người dùng"
        );
      } else if (error.request) {
        console.error("Request error:", error.request);
        message.error(
          "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng."
        );
      } else {
        console.error("Error:", error.message);
        message.error("Có lỗi xảy ra khi tải dữ liệu");
      }
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
          <Tooltip title="Sửa">
            <Button
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              type="primary"
              size="small"
            />
          </Tooltip>
          <Popconfirm
            title="Xác nhận xóa người dùng"
            description={`Bạn có chắc chắn muốn xóa người dùng "${record.name}"?`}
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
    setEditingUser(null);
    setShowPassword(false);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setShowPassword(false);
    form.setFieldsValue({
      name: user.name,
      email: user.email,
      role: user.role,
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (userId) => {
    setTableLoading(true);
    try {
      const authToken = localStorage.getItem("token");
      if (!authToken) {
        message.error("Không tìm thấy token xác thực. Vui lòng đăng nhập lại.");
        setTableLoading(false);
        return;
      }
      await axios.delete(`/api/admin/users/${userId}`, {
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
          await axios.post("/api/admin/users", formattedValues, {
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
        <h1 className="text-2xl font-bold text-gray-800">Quản lý người dùng</h1>
        <div className="flex gap-2">
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchUsers}
            loading={tableLoading}
          >
            Làm mới
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Thêm người dùng
          </Button>
        </div>
      </div>

      {/* Thống kê */}
      <Row gutter={16}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Tổng số người dùng"
              value={stats.total}
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Người dùng hoạt động"
              value={stats.active}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Người dùng không hoạt động"
              value={stats.inactive}
              valueStyle={{ color: "#cf1322" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Tìm kiếm */}
      <Card title="Tìm kiếm người dùng" className="shadow-sm">
        <Form form={searchForm} onFinish={handleSearch} layout="vertical">
          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item name="name" label="Tên người dùng">
                <Input placeholder="Nhập tên người dùng" allowClear />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name="email" label="Email">
                <Input placeholder="Nhập email" allowClear />
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
                <Button onClick={handleResetSearch}>Xóa bộ lọc</Button>
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
        pagination={{ pageSize: 5, showQuickJumper: true }}
        loading={tableLoading}
      />

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
