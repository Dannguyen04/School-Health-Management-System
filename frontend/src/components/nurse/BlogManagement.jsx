import React, { useState } from "react";
import {
    Button,
    Form,
    Input,
    Select,
    Switch,
    Typography,
    Upload,
    Image,
    Space,
    message,
    Row,
    Col,
} from "antd";
import { UploadOutlined, PlusOutlined } from "@ant-design/icons";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import BlogList from "./BlogList";
import { nurseAPI } from "../../utils/api";
import { CSSTransition, SwitchTransition } from "react-transition-group";
import "./blog-management-transition.css";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { Dragger } = Upload;

const categoryOptions = [
    { value: "health_tips", label: "Mẹo sức khỏe" },
    { value: "school_news", label: "Tin tức trường" },
    { value: "experience_sharing", label: "Chia sẻ kinh nghiệm" },
];

const BlogManagement = () => {
    const [form] = Form.useForm();
    const [coverImagePreview, setCoverImagePreview] = useState(null);
    const [coverImageError, setCoverImageError] = useState("");
    const [saving, setSaving] = useState(false);
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showEditor, setShowEditor] = useState(false);
    const [editingBlog, setEditingBlog] = useState(null);
    const [filter, setFilter] = useState({
        search: "",
        category: "",
        isPublished: "",
    });

    const fetchBlogs = async (customFilter) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ limit: "1000" });
            const f = customFilter || filter;
            if (f.search) params.append("search", f.search);
            if (f.category) params.append("category", f.category);
            if (f.isPublished) params.append("isPublished", f.isPublished);
            const res = await nurseAPI.getBlogs(params.toString());
            if (res.data.success) {
                setBlogs(res.data.data.posts);
            }
        } catch (err) {
            setBlogs([]);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchBlogs();
    }, [filter]);

    const handleEdit = (blog) => {
        setEditingBlog(blog);
        setShowEditor(true);
        setCoverImagePreview(blog.coverImage);
        form.setFieldsValue({
            ...blog,
            tags: blog.tags || [],
            isPublished: blog.isPublished,
        });
    };

    const handleDelete = async (blog) => {
        try {
            await nurseAPI.deleteBlog(blog.id);
            message.success("Đã xóa bài viết thành công");
            fetchBlogs();
        } catch (err) {
            message.error("Lỗi khi xóa bài viết");
        }
    };

    const handleView = (blog) => {
        window.open(`/blog/${blog.id}`, "_blank");
    };

    const handleCreateNew = () => {
        setEditingBlog(null);
        setShowEditor(true);
        setCoverImagePreview(null);
        form.resetFields();
    };

    const handleSave = async (values) => {
        setSaving(true);
        try {
            if (editingBlog) {
                await nurseAPI.updateBlog(editingBlog.id, values);
                message.success("Cập nhật bài viết thành công");
            } else {
                await nurseAPI.createBlog(values);
                message.success("Tạo bài viết thành công");
            }
            setShowEditor(false);
            setEditingBlog(null);
            form.resetFields();
            setCoverImagePreview(null);
            fetchBlogs();
        } catch (err) {
            message.error("Lỗi khi lưu bài viết");
        } finally {
            setSaving(false);
        }
    };

    const handleImageUpload = async (file) => {
        setCoverImageError("");
        const isImage = file.type.startsWith("image/");
        if (!isImage) {
            setCoverImageError("File không phải là ảnh!");
            message.error("File không phải là ảnh!");
            return false;
        }
        const fileSizeInMB = file.size / 1024 / 1024;
        if (fileSizeInMB >= 10) {
            setCoverImageError("Ảnh quá lớn! Tối đa 10MB");
            message.error("Ảnh quá lớn! Tối đa 10MB");
            return false;
        }
        const allowedTypes = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/gif",
            "image/webp",
        ];
        if (!allowedTypes.includes(file.type)) {
            setCoverImageError("Định dạng ảnh không được hỗ trợ!");
            message.error("Định dạng ảnh không được hỗ trợ!");
            return false;
        }
        if (file.size === 0) {
            setCoverImageError("File ảnh trống!");
            message.error("File ảnh trống!");
            return false;
        }
        // Preview only, upload logic to be added
        const reader = new FileReader();
        reader.onload = (e) => {
            setCoverImagePreview(e.target.result);
            form.setFieldValue("coverImage", e.target.result);
        };
        reader.readAsDataURL(file);
        return false;
    };

    const handleFilterChange = (newFilter) => {
        setFilter(newFilter);
    };

    return (
        <div className="max-w-5xl mx-auto py-8">
            <Typography.Title level={2}>Quản lý bài viết</Typography.Title>
            <SwitchTransition mode="out-in">
                <CSSTransition
                    key={showEditor ? "editor" : "list"}
                    timeout={300}
                    classNames="fade"
                    unmountOnExit
                >
                    {showEditor ? (
                        <div>
                            <div className="mb-8">
                                <Button
                                    onClick={() => {
                                        setShowEditor(false);
                                        setEditingBlog(null);
                                        form.resetFields();
                                        setCoverImagePreview(null);
                                    }}
                                >
                                    Quay lại danh sách
                                </Button>
                            </div>
                            <Form
                                form={form}
                                layout="vertical"
                                onFinish={handleSave}
                                initialValues={{
                                    tags: [],
                                    isPublished: false,
                                }}
                            >
                                <Form.Item
                                    name="title"
                                    label={<Text strong>Tiêu đề</Text>}
                                    rules={[
                                        {
                                            required: true,
                                            message: "Vui lòng nhập tiêu đề",
                                        },
                                    ]}
                                >
                                    <Input
                                        placeholder="Nhập tiêu đề bài viết"
                                        size="large"
                                    />
                                </Form.Item>
                                <Form.Item
                                    name="excerpt"
                                    label={<Text strong>Tóm tắt</Text>}
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
                                    label={<Text strong>Nội dung</Text>}
                                    rules={[
                                        {
                                            required: true,
                                            message: "Vui lòng nhập nội dung",
                                        },
                                    ]}
                                >
                                    <ReactQuill
                                        theme="snow"
                                        style={{ minHeight: 300 }}
                                        value={form.getFieldValue("content")}
                                        onChange={(val) =>
                                            form.setFieldValue("content", val)
                                        }
                                        placeholder="Nhập nội dung bài viết"
                                    />
                                </Form.Item>
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item
                                            name="category"
                                            label={<Text strong>Danh mục</Text>}
                                            rules={[
                                                {
                                                    required: true,
                                                    message:
                                                        "Vui lòng chọn danh mục",
                                                },
                                            ]}
                                        >
                                            <Select placeholder="Chọn danh mục">
                                                {categoryOptions.map(
                                                    (option) => (
                                                        <Option
                                                            key={option.value}
                                                            value={option.value}
                                                        >
                                                            {option.label}
                                                        </Option>
                                                    )
                                                )}
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item
                                            name="coverImage"
                                            label={<Text strong>Ảnh bìa</Text>}
                                        >
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
                                                    Kéo và thả ảnh vào đây hoặc
                                                    nhấp để chọn ảnh
                                                </p>
                                                <p className="ant-upload-hint">
                                                    Hỗ trợ: JPG, PNG, GIF, WebP
                                                    - Tối đa 10MB
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
                                                        <Text strong>
                                                            Preview:
                                                        </Text>
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
                                                            src={
                                                                coverImagePreview
                                                            }
                                                            alt="Cover preview"
                                                            style={{
                                                                maxWidth:
                                                                    "100%",
                                                                maxHeight:
                                                                    "200px",
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Form.Item
                                    name="tags"
                                    label={<Text strong>Thẻ</Text>}
                                >
                                    <Select
                                        mode="tags"
                                        placeholder="Thêm thẻ"
                                        style={{ width: "100%" }}
                                    />
                                </Form.Item>
                                <Form.Item
                                    name="isPublished"
                                    label={<Text strong>Xuất bản</Text>}
                                    valuePropName="checked"
                                >
                                    <Switch />
                                </Form.Item>
                                <Form.Item>
                                    <Space>
                                        <Button
                                            type="primary"
                                            htmlType="submit"
                                            loading={saving}
                                        >
                                            Lưu bài viết
                                        </Button>
                                        <Button
                                            htmlType="button"
                                            onClick={() => form.resetFields()}
                                        >
                                            Hủy
                                        </Button>
                                    </Space>
                                </Form.Item>
                            </Form>
                        </div>
                    ) : (
                        <div>
                            <div className="mb-6">
                                <Button
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    onClick={handleCreateNew}
                                >
                                    Tạo bài viết mới
                                </Button>
                            </div>
                            <BlogList
                                blogs={blogs}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                onView={handleView}
                                loading={loading}
                                filter={filter}
                                onFilterChange={handleFilterChange}
                            />
                        </div>
                    )}
                </CSSTransition>
            </SwitchTransition>
        </div>
    );
};

export default BlogManagement;
