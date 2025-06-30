import { useEffect, useState } from "react";
import { Input, Select, Tag, Button } from "antd";
import {
    SearchOutlined,
    CalendarOutlined,
    EyeOutlined,
    BookOutlined,
} from "@ant-design/icons";
import BlogCard from "../parentlayout/BlogCard";
import { publicAPI } from "../../utils/api";

const { Search } = Input;

const Blogs = () => {
    const [blogs, setBlogs] = useState([]);
    const [filteredBlogs, setFilteredBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");

    // Categories for filtering
    const categories = [
        { value: "all", label: "Tất cả", color: "blue" },
        { value: "nutrition", label: "Dinh dưỡng", color: "green" },
        { value: "vaccination", label: "Tiêm chủng", color: "orange" },
        { value: "mental-health", label: "Sức khỏe tâm thần", color: "purple" },
        { value: "exercise", label: "Vận động", color: "red" },
        { value: "sleep", label: "Giấc ngủ", color: "cyan" },
    ];

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                setLoading(true);
                const response = await publicAPI.getPublishedBlogs("limit=6");
                if (response.data.success) {
                    const blogsWithCategories = response.data.data.map(
                        (blog, index) => ({
                            ...blog,
                            category:
                                categories[index % categories.length].value,
                            readTime: Math.floor(Math.random() * 5) + 3, // 3-7 minutes
                            views: Math.floor(Math.random() * 1000) + 100,
                            date: new Date(
                                Date.now() -
                                    Math.random() * 30 * 24 * 60 * 60 * 1000
                            ).toLocaleDateString("vi-VN"),
                        })
                    );
                    setBlogs(blogsWithCategories);
                    setFilteredBlogs(blogsWithCategories);
                }
            } catch (error) {
                console.error("Error fetching blogs:", error);
                // Fallback to default blogs if API fails
                const defaultBlogs = [
                    {
                        id: "1",
                        title: "Khám phá bí ẩn về giấc ngủ",
                        excerpt:
                            "Tìm hiểu về tầm quan trọng của giấc ngủ đối với sự phát triển của trẻ em và cách tạo thói quen ngủ tốt.",
                        coverImage: "/img/blog1.jpg",
                        category: "sleep",
                        readTime: 5,
                        views: 1247,
                        date: "15/12/2024",
                    },
                    {
                        id: "2",
                        title: "Chế độ ăn tốt cho tim mạch",
                        excerpt:
                            "Những thực phẩm tốt cho tim mạch và cách xây dựng chế độ ăn lành mạnh cho học sinh.",
                        coverImage: "/img/blog2.jpg",
                        category: "nutrition",
                        readTime: 4,
                        views: 892,
                        date: "12/12/2024",
                    },
                    {
                        id: "3",
                        title: "Hiểu về tiêm chủng cho trẻ em",
                        excerpt:
                            "Hướng dẫn chi tiết về lịch tiêm chủng và tầm quan trọng của vaccine đối với sức khỏe trẻ em.",
                        coverImage: "/img/blog3.jpg",
                        category: "vaccination",
                        readTime: 6,
                        views: 1563,
                        date: "10/12/2024",
                    },
                    {
                        id: "4",
                        title: "Chăm sóc sức khỏe tâm thần",
                        excerpt:
                            "Cách nhận biết và hỗ trợ sức khỏe tâm thần cho học sinh trong môi trường học đường.",
                        coverImage: "/img/blog4.jpg",
                        category: "mental-health",
                        readTime: 7,
                        views: 734,
                        date: "08/12/2024",
                    },
                    {
                        id: "5",
                        title: "Tầm quan trọng của vận động thường xuyên",
                        excerpt:
                            "Lợi ích của việc tập thể dục và các hoạt động thể chất phù hợp cho từng lứa tuổi.",
                        coverImage: "/img/blog5.jpg",
                        category: "exercise",
                        readTime: 4,
                        views: 1023,
                        date: "05/12/2024",
                    },
                    {
                        id: "6",
                        title: "Kiến thức cơ bản về chăm sóc da",
                        excerpt:
                            "Hướng dẫn chăm sóc da cho học sinh và cách bảo vệ da khỏi các tác nhân gây hại.",
                        coverImage: "/img/blog6.jpg",
                        category: "nutrition",
                        readTime: 5,
                        views: 678,
                        date: "03/12/2024",
                    },
                ];
                setBlogs(defaultBlogs);
                setFilteredBlogs(defaultBlogs);
            } finally {
                setLoading(false);
            }
        };

        fetchBlogs();
    }, []);

    // Filter blogs based on search term and category
    useEffect(() => {
        let filtered = blogs;

        if (searchTerm) {
            filtered = filtered.filter(
                (blog) =>
                    blog.title
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                    blog.excerpt
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase())
            );
        }

        if (selectedCategory !== "all") {
            filtered = filtered.filter(
                (blog) => blog.category === selectedCategory
            );
        }

        setFilteredBlogs(filtered);
    }, [blogs, searchTerm, selectedCategory]);

    const handleSearch = (value) => {
        setSearchTerm(value);
    };

    const handleCategoryChange = (value) => {
        setSelectedCategory(value);
    };

    return (
        <div className="min-h-[60vh] bg-gradient-to-br from-[#f6fcfa] to-[#e8f5f2] py-16 px-5 lg:px-32">
            <div className="text-center max-w-4xl mx-auto mb-10">
                <div className="inline-flex items-center gap-2 bg-[#d5f2ec] text-[#36ae9a] px-4 py-2 rounded-full text-sm font-medium mb-6">
                    <BookOutlined className="text-[#36ae9a]" />
                    <span>Kiến thức sức khỏe</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 leading-tight">
                    Blog sức khỏe
                </h2>
                <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                    Cập nhật kiến thức, chia sẻ kinh nghiệm và thông tin hữu ích
                    về sức khỏe học đường từ các chuyên gia y tế.
                </p>

                {/* Search and Filter */}
                <div className="flex flex-col lg:flex-row gap-4 max-w-2xl mx-auto">
                    <Search
                        placeholder="Tìm kiếm bài viết..."
                        allowClear
                        enterButton={<SearchOutlined />}
                        size="large"
                        onSearch={handleSearch}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1"
                    />
                    <Select
                        value={selectedCategory}
                        onChange={handleCategoryChange}
                        size="large"
                        className="min-w-[150px]"
                        placeholder="Chọn danh mục"
                        options={categories}
                    />
                </div>
            </div>

            {/* Blog Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {loading ? (
                    Array.from({ length: 6 }).map((_, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-2xl p-6 space-y-4 animate-pulse"
                        >
                            <div className="h-48 w-full rounded-xl bg-gray-300"></div>
                            <div className="h-6 bg-gray-300 rounded w-3/4"></div>
                            <div className="h-4 bg-gray-300 rounded w-full"></div>
                            <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                        </div>
                    ))
                ) : filteredBlogs.length > 0 ? (
                    filteredBlogs.map((blog) => (
                        <div
                            key={blog.id}
                            className="transition-transform hover:-translate-y-2 hover:shadow-xl"
                        >
                            <BlogCard
                                id={blog.id}
                                img={blog.coverImage}
                                headlines={blog.title}
                                excerpt={blog.excerpt}
                                category={blog.category}
                                readTime={blog.readTime}
                                views={blog.views}
                                date={blog.date}
                            />
                        </div>
                    ))
                ) : (
                    <div className="col-span-full text-center text-gray-500 py-10">
                        Không tìm thấy bài viết phù hợp.
                    </div>
                )}
            </div>
        </div>
    );
};

export default Blogs;
