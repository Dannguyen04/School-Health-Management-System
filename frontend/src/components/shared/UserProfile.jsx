import {
    EditOutlined,
    UserOutlined,
    UploadOutlined,
    CameraOutlined,
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
    Upload,
} from "antd";
import React from "react";
import { useAuth } from "../../context/authContext";
import { userAPI } from "../../utils/api";

const { Title, Text } = Typography;
const { Dragger } = Upload;

const UserProfile = () => {
    const { user, login } = useAuth();
    const [isEditingBasicInfo, setIsEditingBasicInfo] = React.useState(false);
    const [isEditingPersonalInfo, setIsEditingPersonalInfo] =
        React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [uploadingPhoto, setUploadingPhoto] = React.useState(false);
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

    // Handle photo upload
    const handlePhotoUpload = async (file) => {
        // Validate file type
        const isImage = file.type.startsWith("image/");
        if (!isImage) {
            message.error("Chỉ chấp nhận file ảnh!");
            return false;
        }

        // Validate file size (8MB limit)
        const fileSizeInMB = file.size / 1024 / 1024;
        const isLt8M = fileSizeInMB < 8;
        if (!isLt8M) {
            message.error("Ảnh quá lớn! Kích thước tối đa 8MB.");
            return false;
        }

        // Validate specific formats
        const allowedTypes = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/gif",
            "image/webp",
        ];
        if (!allowedTypes.includes(file.type)) {
            message.error(
                "Định dạng ảnh không được hỗ trợ! Hỗ trợ: JPG, PNG, GIF, WebP"
            );
            return false;
        }

        try {
            setUploadingPhoto(true);
            const formData = new FormData();
            formData.append("profilePhoto", file);

            const response = await userAPI.uploadProfilePhoto(formData);

            if (response.data.success) {
                setUserData((prev) => ({
                    ...prev,
                    avatar: response.data.avatar,
                }));

                // Update auth context
                if (user) {
                    login(
                        { ...user, avatar: response.data.avatar },
                        localStorage.getItem("token")
                    );
                }

                message.success("Cập nhật ảnh đại diện thành công!");
            }
        } catch (error) {
            console.error("Error uploading photo:", error);
            message.error("Lỗi khi tải ảnh lên. Vui lòng thử lại.");
        } finally {
            setUploadingPhoto(false);
        }

        return false; // Prevent default upload
    };

    // Handle paste image
    const handlePasteImage = (e) => {
        const items = e.clipboardData?.items;
        if (!items) {
            message.error("Không thể truy cập clipboard!");
            return;
        }

        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf("image") !== -1) {
                const file = items[i].getAsFile();
                if (file) {
                    handlePhotoUpload(file);
                }
                break;
            }
        }
    };

    // Add paste event listener
    React.useEffect(() => {
        const handlePaste = (e) => {
            if (
                e.target.tagName === "INPUT" ||
                e.target.tagName === "TEXTAREA"
            ) {
                return; // Don't handle paste in form inputs
            }
            handlePasteImage(e);
        };

        document.addEventListener("paste", handlePaste);
        return () => document.removeEventListener("paste", handlePaste);
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
                    login(
                        { ...user, ...values },
                        localStorage.getItem("token")
                    );
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
                    login(
                        { ...user, ...values },
                        localStorage.getItem("token")
                    );
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
    // const getFirstName = () => {
    //   const names = userData.fullName.split(" ");
    //   return names[0] || "";
    // };

    // const getLastName = () => {
    //   const names = userData.fullName.split(" ");
    //   return names.slice(1).join(" ") || "";
    // };

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
                            <div className="relative">
                                <Avatar
                                    size={100}
                                    icon={<UserOutlined />}
                                    src={userData.avatar}
                                    className="border-2 border-gray-200"
                                />
                                <div className="absolute -bottom-2 -right-2">
                                    <Dragger
                                        name="profilePhoto"
                                        maxCount={1}
                                        accept="image/*"
                                        beforeUpload={handlePhotoUpload}
                                        showUploadList={false}
                                        disabled={uploadingPhoto}
                                    >
                                        <Button
                                            type="primary"
                                            shape="circle"
                                            size="small"
                                            icon={<CameraOutlined />}
                                            loading={uploadingPhoto}
                                            className="bg-blue-600 hover:bg-blue-700"
                                        />
                                    </Dragger>
                                </div>
                            </div>
                        </Col>
                        <Col flex="auto">
                            <Title level={3} className="mb-0">
                                {userData.fullName}
                            </Title>
                            <Text type="secondary" className="block">
                                {userData.role} |{" "}
                                {userData.address || "No location set"}
                            </Text>
                        </Col>
                        <Col>
                            <Space>
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
                            <Button
                                onClick={() => setIsEditingBasicInfo(false)}
                            >
                                Cancel
                            </Button>
                        </Space>
                    </Form>
                )}
            </Card>

            {/* Photo Upload Section */}
            <Card className="shadow-lg mb-6">
                <Title level={4} className="mb-4">
                    Cập nhật ảnh đại diện
                </Title>
                <Dragger
                    name="profilePhoto"
                    maxCount={1}
                    accept="image/*"
                    beforeUpload={handlePhotoUpload}
                    onRemove={() => {
                        // Handle remove if needed
                    }}
                    disabled={uploadingPhoto}
                >
                    <p className="ant-upload-drag-icon">
                        <UploadOutlined />
                    </p>
                    <p className="ant-upload-text">
                        Kéo và thả ảnh vào đây hoặc nhấp để chọn ảnh
                    </p>
                    <p className="ant-upload-hint">
                        Hoặc copy ảnh (Ctrl+V) vào trang này
                    </p>
                    <p className="ant-upload-hint">
                        Hỗ trợ: JPG, PNG, GIF, WebP - Kích thước tối đa 8MB
                    </p>
                </Dragger>
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
                    <Row gutter={[16, 16]}>
                        <Col span={12}>
                            <div>
                                <Text strong>Full Name:</Text>
                                <br />
                                <Text>{userData.fullName}</Text>
                            </div>
                        </Col>
                        <Col span={12}>
                            <div>
                                <Text strong>Email:</Text>
                                <br />
                                <Text>{userData.email}</Text>
                            </div>
                        </Col>
                        <Col span={12}>
                            <div>
                                <Text strong>Phone:</Text>
                                <br />
                                <Text>{userData.phone || "Not provided"}</Text>
                            </div>
                        </Col>
                        <Col span={12}>
                            <div>
                                <Text strong>Role:</Text>
                                <br />
                                <Text>{userData.role}</Text>
                            </div>
                        </Col>
                    </Row>
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
                            <Button
                                onClick={() => setIsEditingPersonalInfo(false)}
                            >
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
