import {
  EditOutlined,
  FacebookOutlined,
  InstagramOutlined,
  LinkedinOutlined,
  TwitterOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Button,
  Card,
  Col,
  Divider,
  Form,
  Input,
  message,
  Row,
  Space,
  Spin,
  Typography,
} from "antd";
import React from "react";
import { useAuth } from "../../context/authContext";
import { userAPI } from "../../utils/api";

const { Title, Text } = Typography;

const UserProfile = () => {
  const { user, login } = useAuth();
  const [isEditingBasicInfo, setIsEditingBasicInfo] = React.useState(false);
  const [isEditingPersonalInfo, setIsEditingPersonalInfo] =
    React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [basicInfoForm] = Form.useForm();
  const [personalInfoForm] = Form.useForm();

  const [userData, setUserData] = React.useState({
    fullName: "",
    role: "",
    email: "",
    phone: "",
    address: "",
    avatar: "",
  });

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
        message.error("Failed to load user profile");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleEditBasicInfo = () => {
    setIsEditingBasicInfo(true);
    basicInfoForm.setFieldsValue(userData);
  };

  const handleSaveBasicInfo = async (values) => {
    try {
      setLoading(true);
      const response = await userAPI.updateProfile({
        fullName: values.fullName,
        address: values.address,
        avatar: values.avatar,
      });

      if (response.data.success) {
        setUserData((prev) => ({ ...prev, ...values }));
        setIsEditingBasicInfo(false);
        message.success("Profile updated successfully");

        // Update auth context with new user data
        if (user) {
          login({ ...user, ...values }, localStorage.getItem("token"));
        }
      }
    } catch (error) {
      console.error("Error updating basic profile:", error);
      message.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleEditPersonalInfo = () => {
    setIsEditingPersonalInfo(true);
    personalInfoForm.setFieldsValue(userData);
  };

  const handleSavePersonalInfo = async (values) => {
    try {
      setLoading(true);
      const response = await userAPI.updateProfile({
        fullName: values.fullName,
        email: values.email,
        phone: values.phone,
      });

      if (response.data.success) {
        setUserData((prev) => ({ ...prev, ...values }));
        setIsEditingPersonalInfo(false);
        message.success("Profile updated successfully");

        // Update auth context with new user data
        if (user) {
          login({ ...user, ...values }, localStorage.getItem("token"));
        }
      }
    } catch (error) {
      console.error("Error updating personal information:", error);
      message.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  // Split full name into first and last name for display
  const getFirstName = () => {
    const names = userData.fullName.split(" ");
    return names[0] || "";
  };

  const getLastName = () => {
    const names = userData.fullName.split(" ");
    return names.slice(1).join(" ") || "";
  };

  if (loading && !userData.fullName) {
    return (
      <div className="p-6 flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <Title level={2} className="mb-6">
        Profile
      </Title>

      {/* Basic Profile Information Card */}
      <Card className="shadow-lg mb-6">
        {!isEditingBasicInfo ? (
          <Row align="middle" gutter={[24, 24]}>
            <Col>
              <Avatar
                size={100}
                icon={<UserOutlined />}
                src={userData.avatar}
              />
            </Col>
            <Col flex="auto">
              <Title level={3} className="mb-0">
                {userData.fullName}
              </Title>
              <Text type="secondary" className="block">
                {userData.role} | {userData.address || "No location set"}
              </Text>
            </Col>
            <Col>
              <Space>
                <Button
                  shape="circle"
                  icon={<FacebookOutlined />}
                  type="default"
                />
                <Button
                  shape="circle"
                  icon={<TwitterOutlined />}
                  type="default"
                />
                <Button
                  shape="circle"
                  icon={<LinkedinOutlined />}
                  type="default"
                />
                <Button
                  shape="circle"
                  icon={<InstagramOutlined />}
                  type="default"
                />
                <Button
                  icon={<EditOutlined />}
                  onClick={handleEditBasicInfo}
                  type="default"
                  loading={loading}
                >
                  Edit
                </Button>
              </Space>
            </Col>
          </Row>
        ) : (
          <Form
            form={basicInfoForm}
            layout="vertical"
            onFinish={handleSaveBasicInfo}
            initialValues={userData}
          >
            <Form.Item
              name="fullName"
              label="Full Name"
              rules={[
                {
                  required: true,
                  message: "Please input your full name!",
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="address"
              label="Location"
              rules={[
                {
                  required: true,
                  message: "Please input your location!",
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item name="avatar" label="Avatar URL">
              <Input placeholder="Enter avatar image URL" />
            </Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                className="bg-blue-900 hover:bg-blue-800"
                loading={loading}
              >
                Save
              </Button>
              <Button onClick={() => setIsEditingBasicInfo(false)}>
                Cancel
              </Button>
            </Space>
          </Form>
        )}
      </Card>

      {/* Personal Information Card */}
      <Card className="shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <Title level={4} className="mb-0">
            Personal Information
          </Title>
          <Button
            icon={<EditOutlined />}
            onClick={handleEditPersonalInfo}
            type="default"
            loading={loading}
          >
            Edit
          </Button>
        </div>
        <Divider className="my-2" />

        {!isEditingPersonalInfo ? (
          <>
            <Row gutter={[16, 16]} className="mb-4">
              <Col span={12}>
                <Text strong>Full Name</Text>
                <br />
                <Text>{userData.fullName || "Not set"}</Text>
              </Col>
              <Col span={12}>
                <Text strong>Role</Text>
                <br />
                <Text>{userData.role || "Not set"}</Text>
              </Col>
            </Row>
            <Row gutter={[16, 16]} className="mb-4">
              <Col span={12}>
                <Text strong>Email address</Text>
                <br />
                <Text>{userData.email || "Not set"}</Text>
              </Col>
              <Col span={12}>
                <Text strong>Phone</Text>
                <br />
                <Text>{userData.phone || "Not set"}</Text>
              </Col>
            </Row>
            <div className="mb-4">
              <Text strong>Location</Text>
              <br />
              <Text>{userData.address || "Not set"}</Text>
            </div>
          </>
        ) : (
          <Form
            form={personalInfoForm}
            layout="vertical"
            onFinish={handleSavePersonalInfo}
            initialValues={userData}
          >
            <Form.Item
              name="fullName"
              label="Full Name"
              rules={[
                {
                  required: true,
                  message: "Please input your full name!",
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="email"
              label="Email address"
              rules={[
                {
                  required: true,
                  type: "email",
                  message: "Please enter a valid email!",
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item name="phone" label="Phone">
              <Input />
            </Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                className="bg-blue-900 hover:bg-blue-800"
                loading={loading}
              >
                Save
              </Button>
              <Button onClick={() => setIsEditingPersonalInfo(false)}>
                Cancel
              </Button>
            </Space>
          </Form>
        )}
      </Card>
    </div>
  );
};

export default UserProfile;
