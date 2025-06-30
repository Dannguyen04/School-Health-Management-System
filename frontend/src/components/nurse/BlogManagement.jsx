import React, { useState, useEffect } from "react";
import {
    Button,
    Card,
    Table,
    Modal,
    Form,
    Input,
    Select,
    Switch,
    Space,
    Tag,
    Popconfirm,
    message,
    Pagination,
    Row,
    Col,
    Typography,
    Upload,
    Image,
    Tooltip,
} from "antd";
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    EyeOutlined,
    SearchOutlined,
    FileImageOutlined,
    ReloadOutlined,
    UploadOutlined,
    PictureOutlined,
} from "@ant-design/icons";
import { nurseAPI } from "../../utils/api";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { Dragger } = Upload;

const BlogManagement = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingBlog, setEditingBlog] = useState(null);
    const [form] = Form.useForm();
    const [categories, setCategories] = useState([]);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    const [filters, setFilters] = useState({
        search: "",
        category: "",
        isPublished: "",
    });
    const [coverImagePreview, setCoverImagePreview] = useState(null);
    const [coverImageError, setCoverImageError] = useState("");

    const categoryOptions = [
        { value: "health_tips", label: "Mẹo sức khỏe" },
        { value: "school_news", label: "Tin tức trường" },
        { value: "experience_sharing", label: "Chia sẻ kinh nghiệm" },
    ];

    const fetchBlogs = async (page = 1, pageSize = 100) => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: page.toString(),
                limit: pageSize.toString(),
                ...filters,
            });

            console.log("Fetching blogs with params:", params.toString());
            const response = await nurseAPI.getBlogs(params.toString());
            console.log("Fetch blogs response:", response);

            if (response.data.success) {
                setBlogs(response.data.data.posts);
                setPagination({
                    current: page,
                    pageSize,
                    total: response.data.data.pagination.total,
                });
            }
        } catch (error) {
            console.error("Error fetching blogs:", error);
            console.error("Error response:", error.response);
            message.error("Lỗi khi tải danh sách bài viết");
        } finally {
            setLoading(false);
        }
    };

    const fetchAllBlogs = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                limit: "1000", // Fetch a large number to get all blogs
            });

            // Only add filters if they have values
            if (filters.search) {
                params.append("search", filters.search);
            }
            if (filters.category) {
                params.append("category", filters.category);
            }
            if (filters.isPublished !== "") {
                params.append("isPublished", filters.isPublished);
            }

            console.log("Fetching all blogs with params:", params.toString());
            const response = await nurseAPI.getBlogs(params.toString());
            console.log("Fetch all blogs response:", response);

            if (response.data.success) {
                setBlogs(response.data.data.posts);
                setPagination({
                    current: 1,
                    pageSize: response.data.data.posts.length,
                    total: response.data.data.posts.length,
                });
            }
        } catch (error) {
            console.error("Error fetching all blogs:", error);
            console.error("Error response:", error.response);
            message.error("Lỗi khi tải danh sách bài viết");
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await nurseAPI.getBlogCategories();
            if (response.data.success) {
                setCategories(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    useEffect(() => {
        fetchAllBlogs();
        fetchCategories();
    }, []);

    useEffect(() => {
        const handlePaste = (e) => {
            if (modalVisible) {
                handlePasteImage(e);
            }
        };

        document.addEventListener("paste", handlePaste);
        return () => {
            document.removeEventListener("paste", handlePaste);
        };
    }, [modalVisible]);

    const handleCreate = () => {
        setEditingBlog(null);
        setCoverImagePreview(null);
        form.resetFields();
        setModalVisible(true);
    };

    const handleEdit = (blog) => {
        setEditingBlog(blog);
        setCoverImagePreview(blog.coverImage);
        form.setFieldsValue({
            title: blog.title,
            content: blog.content,
            excerpt: blog.excerpt,
            coverImage: blog.coverImage,
            category: blog.category,
            tags: blog.tags,
            isPublished: blog.isPublished,
        });
        setModalVisible(true);
    };

    const handleDelete = async (id) => {
        try {
            const response = await nurseAPI.deleteBlog(id);
            if (response.data.success) {
                message.success("Xóa bài viết thành công");
                fetchAllBlogs();
            }
        } catch (error) {
            message.error("Lỗi khi xóa bài viết");
            console.error("Error deleting blog:", error);
        }
    };

    const handleSubmit = async (values) => {
        try {
            console.log("Submitting blog data:", values);

            if (editingBlog) {
                const response = await nurseAPI.updateBlog(
                    editingBlog.id,
                    values
                );
                if (response.data.success) {
                    message.success("Cập nhật bài viết thành công");
                }
            } else {
                const response = await nurseAPI.createBlog(values);
                console.log("Create blog response:", response);
                if (response.data.success) {
                    message.success("Tạo bài viết thành công");
                }
            }
            setModalVisible(false);
            fetchAllBlogs();
        } catch (error) {
            console.error("Error saving blog:", error);
            console.error("Error response:", error.response);

            const errorMessage =
                error.response?.data?.error || "Lỗi khi lưu bài viết";
            message.error(errorMessage);
        }
    };

    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        fetchAllBlogs();
    };

    const handleResetFilters = () => {
        setFilters({
            search: "",
            category: "",
            isPublished: "",
        });
        // Fetch all blogs without any filters
        const fetchWithoutFilters = async () => {
            try {
                setLoading(true);
                const params = new URLSearchParams({
                    limit: "1000",
                });

                console.log("Fetching all blogs without filters");
                const response = await nurseAPI.getBlogs(params.toString());
                console.log("Fetch all blogs response:", response);

                if (response.data.success) {
                    setBlogs(response.data.data.posts);
                    setPagination({
                        current: 1,
                        pageSize: response.data.data.posts.length,
                        total: response.data.data.posts.length,
                    });
                }
            } catch (error) {
                console.error("Error fetching all blogs:", error);
                message.error("Lỗi khi tải danh sách bài viết");
            } finally {
                setLoading(false);
            }
        };
        fetchWithoutFilters();
    };

    const handlePasteImage = (e) => {
        const items = e.clipboardData?.items;
        if (!items) {
            message.error("Không thể truy cập clipboard! Vui lòng thử lại.");
            return;
        }

        let imageFound = false;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf("image") !== -1) {
                imageFound = true;
                const file = items[i].getAsFile();
                if (file) {
                    // Kiểm tra định dạng
                    const allowedTypes = [
                        "image/jpeg",
                        "image/jpg",
                        "image/png",
                        "image/gif",
                        "image/webp",
                    ];
                    if (!allowedTypes.includes(file.type)) {
                        message.error(
                            `Định dạng ảnh không được hỗ trợ! Định dạng: ${file.type}. Hỗ trợ: JPG, PNG, GIF, WebP`
                        );
                        return;
                    }

                    // Kiểm tra kích thước
                    const fileSizeInMB = file.size / 1024 / 1024;
                    if (fileSizeInMB >= 8) {
                        message.error(
                            `Ảnh quá lớn! Kích thước: ${fileSizeInMB.toFixed(
                                2
                            )}MB. Giới hạn: 8MB`
                        );
                        return;
                    }

                    // Kiểm tra file trống
                    if (file.size === 0) {
                        message.error("Ảnh trống! Vui lòng copy ảnh khác.");
                        return;
                    }

                    try {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            const imageData = e.target.result;
                            form.setFieldValue("coverImage", imageData);
                            setCoverImagePreview(imageData);
                            message.success(
                                `Paste ảnh thành công! Kích thước: ${fileSizeInMB.toFixed(
                                    2
                                )}MB`
                            );
                        };
                        reader.onerror = () => {
                            message.error(
                                "Lỗi khi đọc ảnh từ clipboard! Vui lòng thử lại."
                            );
                        };
                        reader.readAsDataURL(file);
                    } catch (error) {
                        message.error(
                            "Lỗi không xác định khi xử lý ảnh! Vui lòng thử lại."
                        );
                        console.error("Paste image error:", error);
                    }
                } else {
                    message.error(
                        "Không thể đọc ảnh từ clipboard! Vui lòng thử lại."
                    );
                }
                break;
            }
        }

        if (!imageFound) {
            message.warning(
                "Không tìm thấy ảnh trong clipboard! Vui lòng copy ảnh trước khi paste."
            );
        }
    };

    const handleImageUpload = async (file) => {
        setCoverImageError("");
        // Kiểm tra định dạng file
        const isImage = file.type.startsWith("image/");
        if (!isImage) {
            const errMsg = `File không phải là ảnh! Định dạng hiện tại: ${
                file.type || "Không xác định"
            }`;
            setCoverImageError(errMsg);
            message.error(errMsg);
            return false;
        }
        // Kiểm tra kích thước file
        const fileSizeInMB = file.size / 1024 / 1024;
        const isLt10M = fileSizeInMB < 10;
        if (!isLt10M) {
            const errMsg = `Ảnh quá lớn! Kích thước hiện tại: ${fileSizeInMB.toFixed(
                2
            )}MB. Giới hạn tối đa: 10MB`;
            setCoverImageError(errMsg);
            message.error(errMsg);
            return false;
        }
        // Kiểm tra định dạng cụ thể
        const allowedTypes = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/gif",
            "image/webp",
        ];
        if (!allowedTypes.includes(file.type)) {
            const errMsg = `Định dạng ảnh không được hỗ trợ! Định dạng hiện tại: ${file.type}. Hỗ trợ: JPG, PNG, GIF, WebP`;
            setCoverImageError(errMsg);
            message.error(errMsg);
            return false;
        }
        if (file.size === 0) {
            const errMsg = "File ảnh trống! Vui lòng chọn file khác.";
            setCoverImageError(errMsg);
            message.error(errMsg);
            return false;
        }
        // Upload file lên backend
        const formData = new FormData();
        formData.append("image", file);
        try {
            const res = await nurseAPI.uploadBlogImage(formData);
            if (res.data.success) {
                form.setFieldValue("coverImage", res.data.url);
                setCoverImagePreview(res.data.url);
                setCoverImageError("");
                message.success("Upload ảnh thành công!");
            } else {
                setCoverImageError(res.data.error || "Lỗi upload ảnh");
                message.error(res.data.error || "Lỗi upload ảnh");
            }
        } catch (err) {
            setCoverImageError("Lỗi upload ảnh!");
            message.error("Lỗi upload ảnh!");
        }
        return false; // Ngăn upload mặc định
    };

    const columns = [
        {
            title: "Tiêu đề",
            dataIndex: "title",
            key: "title",
            render: (text) => (
                <Text strong style={{ maxWidth: 200 }} ellipsis>
                    {text}
                </Text>
            ),
        },
        {
            title: "Danh mục",
            dataIndex: "category",
            key: "category",
            render: (category) => {
                const option = categoryOptions.find(
                    (opt) => opt.value === category
                );
                return option ? (
                    <Tag color="blue">{option.label}</Tag>
                ) : (
                    <Tag>{category}</Tag>
                );
            },
        },
        {
            title: "Tác giả",
            dataIndex: ["author", "fullName"],
            key: "author",
        },
        {
            title: "Trạng thái",
            dataIndex: "isPublished",
            key: "isPublished",
            render: (isPublished) => (
                <Tag color={isPublished ? "green" : "orange"}>
                    {isPublished ? "Đã xuất bản" : "Bản nháp"}
                </Tag>
            ),
        },
        {
            title: "Trang chủ",
            dataIndex: "isPublished",
            key: "homepage",
            render: (isPublished) => (
                <Tag color={isPublished ? "green" : "red"}>
                    {isPublished ? "Hiển thị" : "Ẩn"}
                </Tag>
            ),
        },
        {
            title: "Ngày tạo",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (date) => new Date(date).toLocaleDateString("vi-VN"),
        },
        {
            title: "Thao tác",
            key: "actions",
            render: (_, record) => (
                <Space>
                    <Tooltip title="Xem">
                        <Button
                            type="text"
                            icon={<EyeOutlined />}
                            onClick={() =>
                                window.open(`/blog/${record.id}`, "_blank")
                            }
                        />
                    </Tooltip>
                    <Tooltip title="Chỉnh sửa">
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => handleEdit(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Xóa">
                        <Popconfirm
                            title="Bạn có chắc chắn muốn xóa bài viết này?"
                            onConfirm={() => handleDelete(record.id)}
                            okText="Có"
                            cancelText="Không"
                        >
                            <Button
                                type="text"
                                danger
                                icon={<DeleteOutlined />}
                            />
                        </Popconfirm>
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <Title level={2}>Quản lý bài viết</Title>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleCreate}
                >
                    Tạo bài viết mới
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <Row gutter={16} align="middle">
                    <Col span={6}>
                        <Input
                            placeholder="Tìm kiếm bài viết..."
                            prefix={<SearchOutlined />}
                            value={filters.search}
                            onChange={(e) =>
                                handleFilterChange("search", e.target.value)
                            }
                            allowClear
                        />
                    </Col>
                    <Col span={5}>
                        <Select
                            placeholder="Chọn danh mục"
                            style={{ width: "100%" }}
                            value={filters.category}
                            onChange={(value) =>
                                handleFilterChange("category", value)
                            }
                            allowClear
                        >
                            {categoryOptions.map((option) => (
                                <Option key={option.value} value={option.value}>
                                    {option.label}
                                </Option>
                            ))}
                        </Select>
                    </Col>
                    <Col span={5}>
                        <Select
                            placeholder="Trạng thái"
                            style={{ width: "100%" }}
                            value={filters.isPublished}
                            onChange={(value) =>
                                handleFilterChange("isPublished", value)
                            }
                            allowClear
                        >
                            <Option value="true">Đã xuất bản</Option>
                            <Option value="false">Bản nháp</Option>
                        </Select>
                    </Col>
                    <Col span={4}>
                        <Button
                            onClick={handleResetFilters}
                            icon={<ReloadOutlined />}
                        >
                            Hiển thị tất cả
                        </Button>
                    </Col>
                </Row>
            </Card>

            {/* Blog Table */}
            <Card>
                <div className="mb-4 text-gray-600">
                    Tổng cộng: <strong>{blogs.length}</strong> bài viết
                    {!filters.search &&
                    !filters.category &&
                    filters.isPublished === "" ? (
                        " (hiển thị tất cả)"
                    ) : (
                        <>
                            {filters.search &&
                                ` (đã lọc theo "${filters.search}")`}
                            {filters.category &&
                                ` (danh mục: ${
                                    categoryOptions.find(
                                        (opt) => opt.value === filters.category
                                    )?.label || filters.category
                                })`}
                            {filters.isPublished &&
                                ` (trạng thái: ${
                                    filters.isPublished === "true"
                                        ? "Đã xuất bản"
                                        : "Bản nháp"
                                })`}
                        </>
                    )}
                </div>
                <Table
                    columns={columns}
                    dataSource={blogs}
                    rowKey="id"
                    loading={loading}
                    pagination={false}
                />
            </Card>

            {/* Create/Edit Modal */}
            <Modal
                title={editingBlog ? "Chỉnh sửa bài viết" : "Tạo bài viết mới"}
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={null}
                width={800}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={{
                        tags: [],
                        isPublished: false,
                    }}
                >
                    <Form.Item
                        name="title"
                        label="Tiêu đề"
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng nhập tiêu đề",
                            },
                        ]}
                    >
                        <Input placeholder="Nhập tiêu đề bài viết" />
                    </Form.Item>

                    <Form.Item
                        name="excerpt"
                        label="Tóm tắt"
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng nhập tóm tắt",
                            },
                        ]}
                    >
                        <TextArea
                            rows={3}
                            placeholder="Nhập tóm tắt bài viết"
                            maxLength={200}
                            showCount
                        />
                    </Form.Item>

                    <Form.Item
                        name="content"
                        label="Nội dung"
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng nhập nội dung",
                            },
                        ]}
                    >
                        <TextArea
                            rows={10}
                            placeholder="Nhập nội dung bài viết"
                        />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="category"
                                label="Danh mục"
                                rules={[
                                    {
                                        required: true,
                                        message: "Vui lòng chọn danh mục",
                                    },
                                ]}
                            >
                                <Select placeholder="Chọn danh mục">
                                    {categoryOptions.map((option) => (
                                        <Option
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="coverImage" label="Ảnh bìa">
                                <div>
                                    <Dragger
                                        name="coverImage"
                                        maxCount={1}
                                        accept="image/*"
                                        beforeUpload={handleImageUpload}
                                        onRemove={() => {
                                            form.setFieldValue(
                                                "coverImage",
                                                ""
                                            );
                                            setCoverImagePreview(null);
                                            setCoverImageError("");
                                        }}
                                    >
                                        <p className="ant-upload-drag-icon">
                                            <UploadOutlined />
                                        </p>
                                        <p className="ant-upload-text">
                                            Kéo và thả ảnh vào đây hoặc nhấp để
                                            chọn ảnh
                                        </p>
                                        <p className="ant-upload-hint">
                                            Hoặc copy ảnh (Ctrl+V) vào form này
                                        </p>
                                        <p className="ant-upload-hint">
                                            Hỗ trợ: JPG, PNG, GIF, WebP - Kích
                                            thước tối đa 10MB
                                        </p>
                                    </Dragger>
                                    {coverImageError && (
                                        <div
                                            style={{
                                                color: "red",
                                                marginTop: 8,
                                            }}
                                        >
                                            {coverImageError}
                                        </div>
                                    )}
                                    {coverImagePreview && (
                                        <div className="mt-4">
                                            <div className="flex justify-between items-center mb-2">
                                                <Text strong>Preview:</Text>
                                                <Button
                                                    size="small"
                                                    danger
                                                    onClick={() => {
                                                        form.setFieldValue(
                                                            "coverImage",
                                                            ""
                                                        );
                                                        setCoverImagePreview(
                                                            null
                                                        );
                                                    }}
                                                >
                                                    Xóa ảnh
                                                </Button>
                                            </div>
                                            <div className="mt-2">
                                                <Image
                                                    src={coverImagePreview}
                                                    alt="Cover preview"
                                                    style={{
                                                        maxWidth: "100%",
                                                        maxHeight: "200px",
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item name="tags" label="Thẻ">
                        <Select
                            mode="tags"
                            placeholder="Thêm thẻ"
                            style={{ width: "100%" }}
                        />
                    </Form.Item>

                    <Form.Item
                        name="isPublished"
                        label="Xuất bản"
                        valuePropName="checked"
                    >
                        <Switch />
                    </Form.Item>

                    <Form.Item className="mb-0">
                        <Space>
                            <Button type="primary" htmlType="submit">
                                {editingBlog ? "Cập nhật" : "Tạo"}
                            </Button>
                            <Button onClick={() => setModalVisible(false)}>
                                Hủy
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default BlogManagement;
