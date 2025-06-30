import { useNavigate } from "react-router-dom";
import { Tag, Space } from "antd";
import {
    CalendarOutlined,
    EyeOutlined,
    ClockCircleOutlined,
} from "@ant-design/icons";

const BlogCard = ({
    img,
    headlines,
    excerpt,
    id,
    category,
    readTime,
    views,
    date,
}) => {
    const navigate = useNavigate();

    const handleClick = () => {
        if (id) {
            navigate(`/blog/${id}`);
        }
    };

    const getCategoryColor = (cat) => {
        const colors = {
            nutrition: "green",
            vaccination: "orange",
            "mental-health": "purple",
            exercise: "red",
            sleep: "cyan",
        };
        return colors[cat] || "blue";
    };

    const getCategoryLabel = (cat) => {
        const labels = {
            nutrition: "Dinh dưỡng",
            vaccination: "Tiêm chủng",
            "mental-health": "Sức khỏe tâm thần",
            exercise: "Vận động",
            sleep: "Giấc ngủ",
        };
        return labels[cat] || "Khác";
    };

    return (
        <div
            className="group bg-white rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 border border-gray-100"
            onClick={handleClick}
        >
            {/* Image Container */}
            <div className="relative overflow-hidden">
                <img
                    className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                    src={img}
                    alt={headlines}
                />
                {/* Category Tag */}
                {category && (
                    <div className="absolute top-3 left-3">
                        <Tag
                            color={getCategoryColor(category)}
                            className="font-medium"
                        >
                            {getCategoryLabel(category)}
                        </Tag>
                    </div>
                )}
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300"></div>
            </div>

            {/* Content */}
            <div className="p-6">
                {/* Title */}
                <h3 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2 group-hover:text-[#36ae9a] transition-colors duration-300">
                    {headlines}
                </h3>

                {/* Excerpt */}
                <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                    {excerpt}
                </p>

                {/* Metadata */}
                <div className="flex items-center justify-between text-sm text-gray-500">
                    <Space size="small">
                        <div className="flex items-center gap-1">
                            <CalendarOutlined />
                            <span>{date}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <ClockCircleOutlined />
                            <span>{readTime} phút</span>
                        </div>
                    </Space>
                    <div className="flex items-center gap-1">
                        <EyeOutlined />
                        <span>{views.toLocaleString()}</span>
                    </div>
                </div>

                {/* Read More Button */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="text-[#36ae9a] font-medium group-hover:text-[#2a8a7a] transition-colors duration-300">
                        Đọc thêm →
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BlogCard;
