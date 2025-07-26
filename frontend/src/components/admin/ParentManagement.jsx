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
  Space,
  Spin,
  Table,
  Tooltip,
} from "antd";
import axios from "axios";
import { Formik } from "formik";
import { useEffect, useState } from "react";
import UpdatePasswordModal from "./UpdatePasswordModal";

const ParentManagement = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingParent, setEditingParent] = useState(null);
  const [parents, setParents] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [filteredParents, setFilteredParents] = useState([]);
  const [searchForm] = Form.useForm();
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);

  // Validation schema for parent form (bỏ Yup, dùng validate thủ công)
  const validateParent = (values) => {
    const errors = {};
    if (!values.name) {
      errors.name = "Vui lòng nhập tên phụ huynh";
    } else if (values.name.length < 2) {
      errors.name = "Tên phải có ít nhất 2 ký tự";
    } else if (values.name.length > 50) {
      errors.name = "Tên không được quá 50 ký tự";
    } else if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(values.name)) {
      errors.name = "Tên chỉ được chứa chữ cái và khoảng trắng";
    }
    if (!values.email) {
      errors.email = "Vui lòng nhập email";
    } else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(values.email)) {
      errors.email = "Email không hợp lệ";
    }
    if (!values.phone) {
      errors.phone = "Vui lòng nhập số điện thoại";
    } else {
      // Loại bỏ tất cả ký tự không phải số
      const cleanPhone = values.phone.replace(/\D/g, "");

      // Kiểm tra format số điện thoại Việt Nam
      const vietnamPhoneRegex =
        /^(0|\+84)(3[2-9]|5[689]|7[06-9]|8[1-689]|9[0-46-9])[0-9]{7}$/;

      if (!vietnamPhoneRegex.test(cleanPhone)) {
        errors.phone = "Số điện thoại không đúng định dạng Việt Nam";
      }
    }
    return errors;
  };

  const fetchParents = async () => {
    setTableLoading(true);
    try {
      const authToken = localStorage.getItem("token");
      if (!authToken) {
        message.error("Không tìm thấy token xác thực. Vui lòng đăng nhập lại.");
        setTableLoading(false);
        return;
      }
      const response = await axios.get("/api/admin/parents", {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      const formattedParents = response.data.data.map((parent) => ({
        id: parent.id,
        userId: parent.userId || parent.user?.id, // fallback nếu backend trả về user object
        name: parent.fullName,
        email: parent.email,
        phone: parent.phone,
        status: parent.isActive ? "active" : "inactive",
      }));
      setParents(formattedParents);
      setFilteredParents(formattedParents);
    } catch (error) {
      message.error(
        error.response?.data?.message || "Không thể tải danh sách phụ huynh"
      );
      console.error("Lỗi khi tải danh sách phụ huynh:", error);
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    fetchParents();
  }, []);

  const handleSearch = (values) => {
    const { name = "", email = "", phone = "" } = values;
    let filtered = [...parents];

    if (name.trim()) {
      filtered = filtered.filter((parent) =>
        parent.name?.toLowerCase().includes(name.trim().toLowerCase())
      );
    }
    if (email.trim()) {
      filtered = filtered.filter((parent) =>
        parent.email?.toLowerCase().includes(email.trim().toLowerCase())
      );
    }
    if (phone.trim()) {
      filtered = filtered.filter((parent) =>
        parent.phone?.toLowerCase().includes(phone.trim().toLowerCase())
      );
    }
    setFilteredParents(filtered);
  };

  const handleResetFilter = () => {
    searchForm.resetFields();
    setFilteredParents(parents);
  };

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
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
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
            title="Xác nhận xóa phụ huynh"
            description={`Bạn có chắc chắn muốn xóa phụ huynh "${record.name}"?`}
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
    setEditingParent(null);
    setIsModalVisible(true);
  };

  const handleEdit = (parent) => {
    setEditingParent(parent);
    setIsModalVisible(true);
  };

  const handlePasswordEdit = (parent) => {
    console.log("[DEBUG] parent object khi đổi mật khẩu:", parent);
    setEditingParent(parent);
    setIsPasswordModalVisible(true);
  };

  const handleDelete = async (parentId) => {
    setTableLoading(true);
    try {
      const authToken = localStorage.getItem("token");
      // TODO: Đổi endpoint khi backend sẵn sàng
      await axios.delete(`/api/admin/parents/${parentId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      message.success("Xóa phụ huynh thành công");
      fetchParents();
    } catch (error) {
      message.error(error.response?.data?.message || "Không thể xóa phụ huynh");
    } finally {
      setTableLoading(false);
    }
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const authToken = localStorage.getItem("token");
      if (editingParent) {
        // Sửa phụ huynh
        // TODO: Đổi endpoint khi backend sẵn sàng
        await axios.put(`/api/admin/parents/${editingParent.id}`, values, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        message.success("Cập nhật phụ huynh thành công");
      } else {
        // Thêm phụ huynh
        // TODO: Đổi endpoint khi backend sẵn sàng
        await axios.post("/api/admin/parents", values, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        message.success("Thêm phụ huynh thành công");
      }
      setIsModalVisible(false);
      resetForm();
      fetchParents();
    } catch (error) {
      message.error(
        error.response?.data?.message || "Không thể lưu thông tin phụ huynh"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingParent(null);
  };

  const handlePasswordModalCancel = () => {
    setIsPasswordModalVisible(false);
    setEditingParent(null);
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <h2 style={{ fontWeight: 700, fontSize: 24, margin: 0 }}>
          Quản lý phụ huynh
        </h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Thêm phụ huynh
        </Button>
      </div>
      <Card
        style={{ marginBottom: 16, background: "#fafafa" }}
        styles={{ body: { padding: 20 } }}
      >
        <Form
          form={searchForm}
          layout="vertical"
          onFinish={handleSearch}
          style={{ marginBottom: 0 }}
        >
          <Row gutter={16} align="bottom">
            <Col xs={24} sm={8} md={8} lg={8} xl={8}>
              <Form.Item name="name" label="Tên phụ huynh">
                <Input placeholder="Nhập tên phụ huynh" allowClear />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8} md={8} lg={8} xl={8}>
              <Form.Item name="email" label="Email">
                <Input placeholder="Nhập email" allowClear />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8} md={8} lg={8} xl={8}>
              <Form.Item name="phone" label="Số điện thoại">
                <Input placeholder="Nhập số điện thoại" allowClear />
              </Form.Item>
            </Col>
            <Col
              xs={24}
              sm={24}
              md={24}
              lg={24}
              xl={24}
              style={{ textAlign: "right" }}
            >
              <Space>
                <Button onClick={handleResetFilter}>Xóa bộ lọc</Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SearchOutlined />}
                >
                  Tìm kiếm
                </Button>
              </Space>
            </Col>
          </Row>
        </Form>
      </Card>
      <Spin spinning={tableLoading} tip="Đang tải...">
        <Table
          columns={columns}
          dataSource={filteredParents}
          rowKey="id"
          pagination={{ pageSize: 5 }}
          style={{ marginTop: 16 }}
        />
        {filteredParents.length === 0 && <div>Không có dữ liệu phụ huynh</div>}
      </Spin>
      <Modal
        title={editingParent ? "Sửa phụ huynh" : "Thêm phụ huynh"}
        open={isModalVisible}
        onCancel={handleModalCancel}
        footer={null}
        destroyOnHidden
        styles={{ body: { padding: 20 } }}
      >
        <Formik
          initialValues={
            editingParent || {
              name: "",
              email: "",
              phone: "",
            }
          }
          validate={validateParent}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            handleSubmit,
            isSubmitting,
          }) => (
            <Form layout="vertical" onFinish={handleSubmit}>
              <Form.Item
                label="Tên phụ huynh"
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
                  onKeyPress={(e) => {
                    // Chỉ cho phép nhập chữ cái, khoảng trắng và dấu tiếng Việt
                    const allowedChars = /[a-zA-ZÀ-ỹ\s]/;
                    if (!allowedChars.test(e.key)) {
                      e.preventDefault();
                    }
                  }}
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
              <Form.Item
                label="Số điện thoại"
                validateStatus={touched.phone && errors.phone ? "error" : ""}
                help={touched.phone && errors.phone}
              >
                <Input
                  name="phone"
                  value={values.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="VD: 0901234567 hoặc +84901234567"
                  maxLength={12}
                  onKeyPress={(e) => {
                    // Chỉ cho phép nhập số, dấu + và dấu cách
                    const allowedChars = /[0-9+\s]/;
                    if (!allowedChars.test(e.key)) {
                      e.preventDefault();
                    }
                  }}
                />
              </Form.Item>
              <div style={{ textAlign: "right", marginTop: 24 }}>
                <Space>
                  <Button onClick={handleModalCancel}>Hủy</Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={isSubmitting}
                  >
                    {editingParent ? "Cập nhật" : "Thêm mới"}
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
        user={editingParent}
        onSuccess={fetchParents}
      />
    </div>
  );
};

export default ParentManagement;
