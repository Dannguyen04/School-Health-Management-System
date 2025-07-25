import { EditOutlined, UserOutlined } from "@ant-design/icons";
import {
  Avatar,
  Button,
  Card,
  Divider,
  Form,
  Input,
  message,
  Modal,
  Spin,
  Typography,
} from "antd";
import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import axios, { userAPI } from "../../utils/api";

const { Title, Text } = Typography;

const UserProfile = () => {
  const { user, login } = useAuth();
  const [isEditing, setIsEditing] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [profileForm] = Form.useForm();
  const [showWrongPasswordModal, setShowWrongPasswordModal] = useState(false);

  const [userData, setUserData] = React.useState({
    fullName: "",
    role: "",
    email: "",
    phone: "",
    address: "",
    avatar: "",
  });

  const { addToastNotification } = useOutletContext?.() || {};

  // Fetch user profile data
  React.useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const response = await userAPI.getProfile();
        if (response.data.success) {
          const profileData = response.data.user;
          setUserData({
            fullName: profileData.fullName || "",
            role: profileData.role || "",
            email: profileData.email || "",
            phone: profileData.phone || "",
            address: profileData.address || "",
            avatar: profileData.avatar || "",
          });
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        message.error("Tải hồ sơ người dùng thất bại");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
    profileForm.setFieldsValue(userData);
  };

  const handleSave = async (values) => {
    try {
      setLoading(true);
      const response = await userAPI.updateProfile({
        fullName: values.fullName,
        email: values.email,
        phone: values.phone,
        address: values.address,
        avatar: values.avatar,
      });

      if (response.data.success) {
        setUserData((prev) => ({ ...prev, ...values }));
        setIsEditing(false);
        message.success("Cập nhật hồ sơ thành công");

        // Update auth context with new user data
        if (user) {
          login({ ...user, ...values }, localStorage.getItem("token"));
        }
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      message.error("Cập nhật hồ sơ thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    profileForm.resetFields();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-[#f6fcfa]">
        <div className="w-full max-w-4xl mx-auto px-4">
          <div style={{ padding: "24px", textAlign: "center" }}>
            <Spin size="large" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex justify-center items-center bg-[#f6fcfa]">
      <div className="w-full max-w-4xl mx-auto px-4">
        <Card
          className="w-full rounded-3xl shadow-lg border-0 mt-12"
          style={{
            background: "#fff",
            borderRadius: "1.5rem",
            boxShadow: "0px 3px 16px rgba(0,0,0,0.10)",
            padding: "2rem",
            marginTop: "3rem",
            maxWidth: "100%",
          }}
        >
          <div
            style={{
              marginBottom: 24,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "16px",
            }}
          >
            <div>
              <Title level={2} className="mb-2">
                Hồ sơ cá nhân
              </Title>
              <Text type="secondary">
                Quản lý thông tin cá nhân và cài đặt tài khoản
              </Text>
            </div>
            {!isEditing && (
              <Button
                icon={<EditOutlined />}
                onClick={handleEdit}
                type="primary"
                className="bg-[#36ae9a] hover:bg-[#2a8a7a] border-[#36ae9a]"
              >
                Chỉnh sửa
              </Button>
            )}
          </div>

          {!isEditing ? (
            /* Display Mode */
            <div className="space-y-6">
              {/* Profile Header */}
              <div className="flex items-center gap-6 p-6 bg-gray-50 rounded-xl">
                <Avatar
                  size={100}
                  icon={<UserOutlined />}
                  src={userData.avatar}
                  className="border-2 border-gray-200"
                />
                <div>
                  <Title level={3} className="mb-2">
                    {userData.fullName}
                  </Title>
                  <Text type="secondary" className="text-lg">
                    {userData.role}
                  </Text>
                </div>
              </div>

              {/* Profile Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-white border border-gray-200 rounded-xl">
                  <Text
                    strong
                    className="text-gray-600 text-sm uppercase tracking-wide"
                  >
                    Email
                  </Text>
                  <div className="mt-2">
                    <Text className="text-lg">{userData.email}</Text>
                  </div>
                </div>
                <div className="p-6 bg-white border border-gray-200 rounded-xl">
                  <Text
                    strong
                    className="text-gray-600 text-sm uppercase tracking-wide"
                  >
                    Số điện thoại
                  </Text>
                  <div className="mt-2">
                    <Text className="text-lg">
                      {userData.phone || "Chưa cập nhật"}
                    </Text>
                  </div>
                </div>
                <div className="p-6 bg-white border border-gray-200 rounded-xl md:col-span-2">
                  <Text
                    strong
                    className="text-gray-600 text-sm uppercase tracking-wide"
                  >
                    Địa chỉ
                  </Text>
                  <div className="mt-2">
                    <Text className="text-lg">
                      {userData.address || "Chưa cập nhật"}
                    </Text>
                  </div>
                </div>
              </div>

              {/* Thêm form đổi mật khẩu dưới phần thông tin cá nhân */}
              <Divider />
              <Title level={4}>Đổi mật khẩu</Title>
              <Form
                layout="vertical"
                onFinish={async (values) => {
                  try {
                    const res = await axios.post(
                      "/users/change-password",
                      values
                    );
                    if (addToastNotification) {
                      addToastNotification({
                        title: "Đổi mật khẩu thành công",
                        message:
                          "Bạn đã đổi mật khẩu thành công. Vui lòng đăng nhập lại.",
                        type: "update_password",
                      });
                    }
                    setTimeout(() => {
                      localStorage.removeItem("token");
                      window.location.href = "/auth";
                    }, 1500);
                  } catch (err) {
                    if (
                      err.response?.data?.message === "Mật khẩu cũ không đúng."
                    ) {
                      setShowWrongPasswordModal(true);
                    } else {
                      message.error(
                        err.response?.data?.message || "Có lỗi xảy ra."
                      );
                    }
                  }
                }}
                style={{ maxWidth: 400 }}
              >
                <Form.Item
                  label="Mật khẩu cũ"
                  name="oldPassword"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập mật khẩu cũ",
                    },
                  ]}
                >
                  <Input.Password />
                </Form.Item>
                <Form.Item
                  label="Mật khẩu mới"
                  name="newPassword"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập mật khẩu mới",
                    },
                    {
                      min: 8,
                      message: "Mật khẩu mới phải có ít nhất 8 ký tự",
                    },
                  ]}
                >
                  <Input.Password />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit">
                    Đổi mật khẩu
                  </Button>
                </Form.Item>
              </Form>
            </div>
          ) : (
            /* Edit Mode */
            <Form
              form={profileForm}
              layout="vertical"
              onFinish={handleSave}
              initialValues={userData}
              className="space-y-6"
            >
              {/* Profile Header in Edit Mode */}
              <div className="flex items-center gap-6 p-6 bg-gray-50 rounded-xl">
                <Avatar
                  size={100}
                  icon={<UserOutlined />}
                  src={userData.avatar}
                  className="border-2 border-gray-200"
                />
                <div className="flex-1">
                  <Form.Item
                    name="fullName"
                    label="Họ và tên"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập họ và tên!",
                      },
                    ]}
                  >
                    <Input size="large" />
                  </Form.Item>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Form.Item
                  name="email"
                  label="Email"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập email!",
                    },
                    {
                      type: "email",
                      message: "Email không hợp lệ!",
                    },
                  ]}
                >
                  <Input size="large" />
                </Form.Item>
                <Form.Item name="phone" label="Số điện thoại">
                  <Input size="large" placeholder="Nhập số điện thoại" />
                </Form.Item>
                <Form.Item
                  name="address"
                  label="Địa chỉ"
                  className="md:col-span-2"
                >
                  <Input size="large" placeholder="Nhập địa chỉ" />
                </Form.Item>
                <Form.Item
                  name="avatar"
                  label="Avatar URL"
                  className="md:col-span-2"
                >
                  <Input size="large" placeholder="Nhập URL ảnh đại diện" />
                </Form.Item>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                <Button onClick={handleCancel} size="large">
                  Hủy
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  loading={loading}
                  className="bg-[#36ae9a] hover:bg-[#2a8a7a] border-[#36ae9a]"
                >
                  Lưu thay đổi
                </Button>
              </div>
            </Form>
          )}
        </Card>
        <Modal
          open={showWrongPasswordModal}
          onCancel={() => setShowWrongPasswordModal(false)}
          footer={[
            <Button
              key="close"
              type="primary"
              onClick={() => setShowWrongPasswordModal(false)}
            >
              Đóng
            </Button>,
          ]}
          title="Sai mật khẩu"
        >
          Bạn đã nhập sai mật khẩu cũ. Vui lòng kiểm tra lại!
        </Modal>
      </div>
    </div>
  );
};

export default UserProfile;
