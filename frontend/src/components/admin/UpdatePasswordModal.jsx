import { EyeInvisibleOutlined, EyeOutlined } from "@ant-design/icons";
import { Form, Input, message, Modal, Spin } from "antd";
import axios from "axios";
import { useEffect, useState } from "react";

const UpdatePasswordModal = ({ visible, onCancel, user, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [fetching, setFetching] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const userId = user?.userId || user?.id;
    if (visible && userId) {
      setFetching(true);
      const authToken = localStorage.getItem("token");
      axios
        .get(`/api/admin/user/password/${userId}`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        })
        .then((res) => {
          setOldPassword(res.data?.data?.password || "");
        })
        .catch((error) => {
          console.error("Lỗi khi lấy password:", error);
          setOldPassword("");
          message.error("Không thể lấy thông tin mật khẩu hiện tại");
        })
        .finally(() => setFetching(false));
    } else {
      setOldPassword("");
    }
  }, [visible, user]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      const authToken = localStorage.getItem("token");
      const userId = user?.userId || user?.id;
      await axios.put(
        `/api/admin/user/password/${userId}`,
        {
          password: values.password,
          cfPassword: values.confirmPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      message.success("Đổi mật khẩu thành công");
      form.resetFields();
      onCancel();
      if (onSuccess) onSuccess();
    } catch (error) {
      if (error.errorFields) return; // AntD validate lỗi
      message.error(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "Không thể đổi mật khẩu"
      );
    } finally {
      setLoading(false);
    }
  };

  // Get user type for display
  const getUserType = () => {
    if (user?.role) {
      switch (user.role) {
        case "STUDENT":
          return "học sinh";
        case "PARENT":
          return "phụ huynh";
        case "SCHOOL_NURSE":
          return "y tá";
        case "MANAGER":
          return "quản lý";
        case "ADMIN":
          return "quản trị viên";
        default:
          return "người dùng";
      }
    }
    return "người dùng";
  };

  // Get user name for display
  const getUserName = () => {
    return user?.name || user?.fullName || "Không xác định";
  };

  return (
    <Modal
      title={`Đổi mật khẩu cho ${getUserType()}${
        user ? `: ${getUserName()}` : ""
      }`}
      open={visible}
      onCancel={() => {
        form.resetFields();
        setShowPassword(false);
        onCancel();
      }}
      onOk={handleOk}
      okText="Lưu"
      cancelText="Hủy"
      confirmLoading={loading}
      destroyOnHidden
    >
      <Spin spinning={loading || fetching} tip="Đang xử lý...">
        <Form
          form={form}
          layout="vertical"
          initialValues={{ password: "", confirmPassword: "" }}
        >
          <Form.Item label="Mật khẩu hiện tại">
            <Input
              value={showPassword ? oldPassword : "••••••••"}
              disabled
              suffix={
                <span
                  style={{ cursor: "pointer", color: "#1890ff" }}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                </span>
              }
            />
          </Form.Item>
          <Form.Item
            label="Mật khẩu mới"
            name="password"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập mật khẩu mới",
              },
              {
                min: 8,
                message: "Mật khẩu phải có ít nhất 8 ký tự",
              },
            ]}
          >
            <Input.Password placeholder="Nhập mật khẩu mới" />
          </Form.Item>
          <Form.Item
            label="Xác nhận mật khẩu"
            name="confirmPassword"
            dependencies={["password"]}
            rules={[
              {
                required: true,
                message: "Vui lòng xác nhận mật khẩu",
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error("Mật khẩu xác nhận không khớp")
                  );
                },
              }),
            ]}
          >
            <Input.Password placeholder="Nhập lại mật khẩu mới" />
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
};

export default UpdatePasswordModal;
