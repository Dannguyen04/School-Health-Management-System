import React, { useState } from "react";
import {
    Table,
    Button,
    Tag,
    Space,
    Tooltip,
    Popconfirm,
    Typography,
    Input,
    Select,
    Row,
    Col,
    Modal,
    Image,
    message,
} from "antd";
import {
    EditOutlined,
    DeleteOutlined,
    EyeOutlined,
    UserOutlined,
    CalendarOutlined,
    LinkOutlined,
} from "@ant-design/icons";
import "./blog-content-preview.css";

const { Text } = Typography;
const { Option } = Select;

const categoryOptions = {
    health_tips: "Mẹo sức khỏe",
    school_news: "Tin tức trường",
    experience_sharing: "Chia sẻ kinh nghiệm",
};

const BlogList = ({
    blogs,
    onEdit,
    onDelete,
    onView,
    loading,
    filter,
    onFilterChange,
}) => {
    const [previewBlog, setPreviewBlog] = useState(null);

    const handleCopyLink = (id) => {
        const url = window.location.origin + `/blog/${id}`;
        navigator.clipboard.writeText(url);
        message.success("Đã sao chép link!");
    };

    const columns = [
        {
            title: "Ảnh bìa",
            dataIndex: "coverImage",
            key: "coverImage",
            render: (url) =>
                url ? (
                    <img
                        src={url}
                        alt="cover"
                        style={{
                            width: 60,
                            height: 40,
                            objectFit: "cover",
                            borderRadius: 4,
                        }}
                    />
                ) : null,
        },
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
            render: (category) => (
                <Tag color="blue">{categoryOptions[category] || category}</Tag>
            ),
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
                            onClick={() => setPreviewBlog(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Chỉnh sửa">
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => onEdit(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Xóa">
                        <Popconfirm
                            title="Bạn có chắc chắn muốn xóa bài viết này?"
                            onConfirm={() => onDelete(record)}
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
        <>
            <Row gutter={16} className="mb-4">
                <Col span={8}>
                    <Input
                        placeholder="Tìm kiếm tiêu đề..."
                        value={filter?.search || ""}
                        onChange={(e) =>
                            onFilterChange({
                                ...filter,
                                search: e.target.value,
                            })
                        }
                        allowClear
                    />
                </Col>
                <Col span={8}>
                    <Select
                        placeholder="Lọc theo danh mục"
                        value={filter?.category || undefined}
                        onChange={(val) =>
                            onFilterChange({ ...filter, category: val })
                        }
                        allowClear
                        style={{ width: "100%" }}
                    >
                        {Object.entries(categoryOptions).map(
                            ([value, label]) => (
                                <Option key={value} value={value}>
                                    {label}
                                </Option>
                            )
                        )}
                    </Select>
                </Col>
                <Col span={8}>
                    <Select
                        placeholder="Trạng thái"
                        value={filter?.isPublished || undefined}
                        onChange={(val) =>
                            onFilterChange({ ...filter, isPublished: val })
                        }
                        allowClear
                        style={{ width: "100%" }}
                    >
                        <Option value="true">Đã xuất bản</Option>
                        <Option value="false">Bản nháp</Option>
                    </Select>
                </Col>
            </Row>
            <Table
                columns={columns}
                dataSource={blogs}
                rowKey="id"
                loading={loading}
                pagination={false}
            />
            <Modal
                open={!!previewBlog}
                onCancel={() => setPreviewBlog(null)}
                footer={[
                    <Button
                        key="view"
                        type="link"
                        icon={<LinkOutlined />}
                        onClick={() =>
                            window.open(`/blog/${previewBlog?.id}`, "_blank")
                        }
                    >
                        Xem ngoài trang chính
                    </Button>,
                    <Button
                        key="copy"
                        onClick={() => handleCopyLink(previewBlog?.id)}
                    >
                        Sao chép link
                    </Button>,
                    <Button key="close" onClick={() => setPreviewBlog(null)}>
                        Đóng
                    </Button>,
                ]}
                width={800}
                title={null}
            >
                {previewBlog && (
                    <div style={{ padding: 8 }}>
                        <div style={{ marginBottom: 8 }}>
                            <Tag color="blue">
                                {categoryOptions[previewBlog.category] ||
                                    previewBlog.category}
                            </Tag>
                            <Tag
                                color={
                                    previewBlog.isPublished ? "green" : "orange"
                                }
                            >
                                {previewBlog.isPublished
                                    ? "Đã xuất bản"
                                    : "Bản nháp"}
                            </Tag>
                            {previewBlog.tags &&
                                previewBlog.tags.map((tag) => (
                                    <Tag key={tag}>{tag}</Tag>
                                ))}
                        </div>
                        <Typography.Title level={2} style={{ marginBottom: 0 }}>
                            {previewBlog.title}
                        </Typography.Title>
                        <div style={{ color: "#888", marginBottom: 12 }}>
                            <UserOutlined />{" "}
                            {previewBlog.author?.fullName || "Không rõ"} &nbsp;{" "}
                            <CalendarOutlined />{" "}
                            {new Date(previewBlog.createdAt).toLocaleDateString(
                                "vi-VN"
                            )}
                        </div>
                        {previewBlog.coverImage && (
                            <Image
                                src={previewBlog.coverImage}
                                alt="cover"
                                style={{
                                    width: "100%",
                                    maxHeight: 300,
                                    objectFit: "cover",
                                    borderRadius: 8,
                                    marginBottom: 16,
                                }}
                            />
                        )}
                        <div
                            style={{
                                marginBottom: 16,
                                background: "#f6f6f6",
                                borderRadius: 6,
                                padding: 12,
                            }}
                        >
                            <Typography.Text strong>Tóm tắt:</Typography.Text>
                            <div>{previewBlog.excerpt}</div>
                        </div>
                        <Typography.Title level={4}>Nội dung</Typography.Title>
                        <div
                            className="blog-content-preview"
                            style={{
                                background: "#fff",
                                borderRadius: 6,
                                padding: 16,
                                minHeight: 120,
                                fontSize: 16,
                                lineHeight: 1.7,
                            }}
                            dangerouslySetInnerHTML={{
                                __html: previewBlog.content || "",
                            }}
                        />
                    </div>
                )}
            </Modal>
        </>
    );
};

export default BlogList;
