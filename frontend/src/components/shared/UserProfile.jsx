import { EditOutlined, UserOutlined } from "@ant-design/icons";
import {
  Avatar,
  Button,
  Card,
  Col,
  Divider,
  Form,
  Input,
  Row,
  Space,
  Typography,
} from "antd";
import React from "react";

const { Title, Text } = Typography;

const UserProfile = () => {
  const [isEditingBasicInfo, setIsEditingBasicInfo] = React.useState(false);
  const [isEditingPersonalInfo, setIsEditingPersonalInfo] =
    React.useState(false);
  const [basicInfoForm] = Form.useForm();
  const [personalInfoForm] = Form.useForm();

  const [userData, setUserData] = React.useState({
    firstName: "Musharaf",
    lastName: "Chowdhury",
    role: "Team Manager",
    email: "randomuser@pimjo.com",
    phone: "+09 363 398 46",
    location: "Arizona, United States",
    avatar: "https://i.imgur.com/8Y1H3bK.jpeg", // Replace with an actual avatar URL
    bio: "Team Manager",
  });

  const handleEditBasicInfo = () => {
    setIsEditingBasicInfo(true);
    basicInfoForm.setFieldsValue(userData);
  };

  const handleSaveBasicInfo = async (values) => {
    try {
      // Simulate API call
      console.log("Updated Basic Info:", values);
      setUserData((prev) => ({ ...prev, ...values }));
      setIsEditingBasicInfo(false);
    } catch (error) {
      console.error("Error updating basic profile:", error);
    }
  };

  const handleEditPersonalInfo = () => {
    setIsEditingPersonalInfo(true);
    personalInfoForm.setFieldsValue(userData);
  };

  const handleSavePersonalInfo = async (values) => {
    try {
      // Simulate API call
      console.log("Updated Personal Info:", values);
      setUserData((prev) => ({ ...prev, ...values }));
      setIsEditingPersonalInfo(false);
    } catch (error) {
      console.error("Error updating personal information:", error);
    }
  };

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
                {userData.firstName} {userData.lastName}
              </Title>
              <Text type="secondary" className="block">
                {userData.role} | {userData.location}
              </Text>
            </Col>
            <Col>
              <Space>
                <Button
                  icon={<EditOutlined />}
                  onClick={handleEditBasicInfo}
                  type="default"
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
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Form.Item
                  name="firstName"
                  label="First Name"
                  rules={[
                    {
                      required: true,
                      message: "Please input your first name!",
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="lastName"
                  label="Last Name"
                  rules={[
                    { required: true, message: "Please input your last name!" },
                  ]}
                >
                  <Input />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item
              name="role"
              label="Role"
              rules={[{ required: true, message: "Please input your role!" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="location"
              label="Location"
              rules={[
                { required: true, message: "Please input your location!" },
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
          >
            Edit
          </Button>
        </div>
        <Divider className="my-2" />

        {!isEditingPersonalInfo ? (
          <>
            <Row gutter={[16, 16]} className="mb-4">
              <Col span={12}>
                <Text strong>First Name</Text>
                <br />
                <Text>{userData.firstName}</Text>
              </Col>
              <Col span={12}>
                <Text strong>Last Name</Text>
                <br />
                <Text>{userData.lastName}</Text>
              </Col>
            </Row>
            <Row gutter={[16, 16]} className="mb-4">
              <Col span={12}>
                <Text strong>Email address</Text>
                <br />
                <Text>{userData.email}</Text>
              </Col>
              <Col span={12}>
                <Text strong>Phone</Text>
                <br />
                <Text>{userData.phone}</Text>
              </Col>
            </Row>
            <div className="mb-4">
              <Text strong>Bio</Text>
              <br />
              <Text>{userData.bio}</Text>
            </div>
          </>
        ) : (
          <Form
            form={personalInfoForm}
            layout="vertical"
            onFinish={handleSavePersonalInfo}
            initialValues={userData}
          >
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Form.Item
                  name="firstName"
                  label="First Name"
                  rules={[
                    {
                      required: true,
                      message: "Please input your first name!",
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="lastName"
                  label="Last Name"
                  rules={[
                    { required: true, message: "Please input your last name!" },
                  ]}
                >
                  <Input />
                </Form.Item>
              </Col>
            </Row>
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
            <Form.Item name="bio" label="Bio">
              <Input.TextArea rows={4} />
            </Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                className="bg-blue-900 hover:bg-blue-800"
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
