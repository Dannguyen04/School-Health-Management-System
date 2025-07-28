import {
  DeleteOutlined,
  EditOutlined,
  KeyOutlined,
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
  Popconfirm,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
} from "antd";
import axios from "axios";
import { Formik } from "formik";
import { useEffect, useState } from "react";
import * as Yup from "yup";
import UpdatePasswordModal from "./UpdatePasswordModal";

const { Option } = Select;

const UserManagement = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState([]);

  // Password modal states
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const [selectedUserForPassword, setSelectedUserForPassword] = useState(null);

  const [searchForm] = Form.useForm();

  // Validation schema for user form - simplified validation
  const userValidationSchema = Yup.object().shape({
    name: Yup.string()
      .required("Vui lòng nhập tên")
      .min(2, "Tên phải có ít nhất 2 ký tự")
      .max(50, "Tên không được quá 50 ký tự")
      .matches(/^[\p{L}\s]+$/u, "Tên chỉ được chứa chữ cái và khoảng trắng"),
    email: Yup.string()
      .required("Vui lòng nhập email")
      .email("Email không hợp lệ"),
    password: Yup.string().when("$isEditing", {
      is: false,
      then: (schema) =>
        schema
          .required("Vui lòng nhập mật khẩu")
          .min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
      otherwise: (schema) => schema.optional(),
    }),
    role: Yup.string()
      .required("Vui lòng chọn vai trò")
      .oneOf(
        ["ADMIN", "SCHOOL_NURSE", "PARENT", "MANAGER"],
        "Vai trò không hợp lệ"
      ),
  });

  const handleSearch = (values) => {
    const { name, email, role } = values;

    let filtered = [...users];

    if (name?.trim()) {
      filtered = filtered.filter((user) =>
        user.name?.toLowerCase().includes(name.trim().toLowerCase())
      );
    }

    if (email?.trim()) {
      filtered = filtered.filter((user) =>
        user.email?.toLowerCase().includes(email.trim().toLowerCase())
      );
    }

    if (role?.trim()) {
      filtered = filtered.filter((user) =>
        user.role.toLowerCase().includes(role.trim().toLowerCase())
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
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Không thể tải danh sách người dùng";
      message.error(`Lỗi khi tải danh sách người dùng: ${errorMessage}`);
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
              : role === "MANAGER"
              ? "purple"
              : "default"
          }
        >
          {role === "ADMIN"
            ? "Quản trị viên"
            : role === "SCHOOL_NURSE"
            ? "Y tá trường học"
            : role === "MANAGER"
            ? "Quản lý"
            : role}
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
          <Tooltip title="Đổi mật khẩu">
            <Button
              icon={<KeyOutlined />}
              onClick={() => handlePasswordEdit(record)}
              type="default"
              size="small"
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const handleAdd = () => {
    setEditingUser(null);
    setIsModalVisible(true);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setIsModalVisible(true);
  };

  const handlePasswordEdit = (user) => {
    console.log("[DEBUG] user object khi đổi mật khẩu:", user);
    setSelectedUserForPassword(user);
    setIsPasswordModalVisible(true);
  };

  const handlePasswordModalCancel = () => {
    setIsPasswordModalVisible(false);
    setSelectedUserForPassword(null);
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
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Không thể xóa người dùng";
      message.error(`Lỗi khi xóa người dùng: ${errorMessage}`);
      console.error("Lỗi khi xóa người dùng:", error);
    } finally {
      setTableLoading(false);
    }
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      setTableLoading(true);
      const authToken = localStorage.getItem("token");
      if (!authToken) {
        message.error("Không tìm thấy token xác thực. Vui lòng đăng nhập lại.");
        setTableLoading(false);
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
        await axios.post(
          "/api/admin/users/",
          {
            name: values.name,
            email: values.email,
            password: values.password,
            role: values.role,
          },
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );
        message.success("Thêm người dùng thành công");
      }
      fetchUsers();
      setIsModalVisible(false);
      resetForm();
    } catch (error) {
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Không thể thực hiện thao tác";
      const action = editingUser ? "cập nhật" : "thêm";
      message.error(`Lỗi khi ${action} người dùng: ${errorMessage}`);
      console.error("Lỗi:", error);
    } finally {
      setSubmitting(false);
      setTableLoading(false);
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingUser(null);
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

      <Card styles={{ body: {} }}>
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
        pagination={{ pageSize: 5, showQuickJumper: true }}
        loading={tableLoading}
      />

      <Modal
        title={editingUser ? "Sửa người dùng" : "Thêm người dùng"}
        open={isModalVisible}
        onCancel={handleModalCancel}
        footer={null}
        destroyOnHidden
      >
        <Formik
          initialValues={
            editingUser
              ? {
                  name: editingUser.name || "",
                  email: editingUser.email || "",
                  password: "",
                  role: editingUser.role || "ADMIN",
                }
              : {
                  name: "",
                  email: "",
                  password: "",
                  role: "ADMIN",
                }
          }
          validationSchema={userValidationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
          context={{ isEditing: !!editingUser }}
          validateOnMount={false}
          validateOnChange={true}
          validateOnBlur={true}
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            handleSubmit,
            isSubmitting,
            setFieldValue,
          }) => (
            <Form layout="vertical" onFinish={handleSubmit}>
              <Form.Item
                label="Tên"
                validateStatus={touched.name && errors.name ? "error" : ""}
                help={touched.name && errors.name}
              >
                <Input
                  name="name"
                  value={values.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Nhập tên (chỉ chữ cái và khoảng trắng)"
                  maxLength={50}
                />
              </Form.Item>
              <Form.Item
                label="Email"
                validateStatus={touched.email && errors.email ? "error" : ""}
                help={touched.email && errors.email}
              >
                <Input
                  name="email"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Nhập email"
                />
              </Form.Item>
              {!editingUser && (
                <Form.Item
                  label="Mật khẩu"
                  validateStatus={
                    touched.password && errors.password ? "error" : ""
                  }
                  help={touched.password && errors.password}
                >
                  <Input.Password
                    name="password"
                    value={values.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Nhập mật khẩu"
                  />
                </Form.Item>
              )}
              <Form.Item
                label="Vai trò"
                validateStatus={touched.role && errors.role ? "error" : ""}
                help={touched.role && errors.role}
              >
                <Select
                  value={values.role}
                  onChange={(value) => setFieldValue("role", value)}
                  onBlur={handleBlur}
                  disabled={editingUser && editingUser.role === "PARENT"}
                >
                  <Option value="ADMIN">Quản trị viên</Option>
                  <Option value="SCHOOL_NURSE">Y tá trường học</Option>
                  <Option value="PARENT">Phụ huynh</Option>
                  <Option value="MANAGER">Quản lý</Option>
                </Select>
              </Form.Item>
              <div style={{ textAlign: "right", marginTop: 24 }}>
                <Space>
                  <Button onClick={handleModalCancel}>Hủy</Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={isSubmitting}
                  >
                    {editingUser ? "Cập nhật" : "Thêm"}
                  </Button>
                </Space>
              </div>
            </Form>
          )}
        </Formik>
      </Modal>
      <UpdatePasswordModal
        visible={isPasswordModalVisible}
        onCancel={handlePasswordModalCancel}
        user={selectedUserForPassword}
        onSuccess={fetchUsers}
      />
    </div>
  );
};

export default UserManagement;
