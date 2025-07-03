import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Card, Spin, Tag, Typography, Space, Divider } from "antd";
import {
    ArrowLeftOutlined,
    CalendarOutlined,
    UserOutlined,
} from "@ant-design/icons";
import { publicAPI } from "../../utils/api";
import "../nurse/blog-content-preview.css";

const { Title, Paragraph, Text } = Typography;

const BlogDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBlog = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await publicAPI.getBlogById(id);
                if (response.data.success) {
                    setBlog(response.data.data);
                } else {
                    setError("Không tìm thấy bài viết");
                }
            } catch (error) {
                console.error("Error fetching blog:", error);
                setError("Lỗi khi tải bài viết");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchBlog();
        }
    }, [id]);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const getCategoryLabel = (category) => {
        const categoryMap = {
            health_tips: "Mẹo sức khỏe",
            school_news: "Tin tức trường",
            experience_sharing: "Chia sẻ kinh nghiệm",
        };
        return categoryMap[category] || category;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex justify-center items-center">
                <Spin size="large" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center">
                <Title level={3} className="text-red-600 mb-4">
                    {error}
                </Title>
                <Button type="primary" onClick={() => navigate(-1)}>
                    Quay lại
                </Button>
            </div>
        );
    }

    if (!blog) {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center">
                <Title level={3} className="text-gray-600 mb-4">
                    Không tìm thấy bài viết
                </Title>
                <Button type="primary" onClick={() => navigate(-1)}>
                    Quay lại
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                {/* Back Button */}
                <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate(-1)}
                    className="mb-6"
                >
                    Quay lại
                </Button>

                <Card className="shadow-lg">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-4 mb-4">
                            <Tag color="blue">
                                {getCategoryLabel(blog.category)}
                            </Tag>
                            {blog.tags && blog.tags.length > 0 && (
                                <div className="flex gap-2">
                                    {blog.tags.map((tag, index) => (
                                        <Tag key={index} color="green">
                                            {tag}
                                        </Tag>
                                    ))}
                                </div>
                            )}
                        </div>

                        <Title level={1} className="mb-4">
                            {blog.title}
                        </Title>

                        <div className="flex items-center gap-6 text-gray-600 mb-6">
                            <Space>
                                <UserOutlined />
                                <Text>
                                    {blog.author?.fullName || "Tác giả"}
                                </Text>
                            </Space>
                            <Space>
                                <CalendarOutlined />
                                <Text>
                                    {blog.publishedAt
                                        ? formatDate(blog.publishedAt)
                                        : formatDate(blog.createdAt)}
                                </Text>
                            </Space>
                        </div>

                        {blog.coverImage && (
                            <div className="mb-6">
                                <img
                                    src={blog.coverImage}
                                    alt={blog.title}
                                    className="w-full h-64 object-cover rounded-lg"
                                />
                            </div>
                        )}
                    </div>

                    <Divider />

                    {/* Content */}
                    <div className="prose max-w-none">
                        {blog.excerpt && (
                            <div className="mb-6">
                                <Title level={4}>Tóm tắt</Title>
                                <Paragraph className="text-lg text-gray-700 bg-gray-50 p-4 rounded-lg">
                                    {blog.excerpt}
                                </Paragraph>
                            </div>
                        )}

                        <div className="mt-8">
                            <Title level={3}>Nội dung</Title>
                            <div
                                className="mt-4 text-gray-800 leading-relaxed blog-content-preview"
                                style={{ whiteSpace: "normal" }}
                                dangerouslySetInnerHTML={{
                                    __html: blog.content || "",
                                }}
                            />
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default BlogDetail;
