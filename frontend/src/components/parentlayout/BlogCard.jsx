import { useNavigate } from "react-router-dom";
import { Tag, Space } from "antd";
import {
    CalendarOutlined,
    EyeOutlined,
    ClockCircleOutlined,
} from "@ant-design/icons";
import { useState } from "react";

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
    const [imgError, setImgError] = useState(false);

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
            className="group bg-white rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 border border-gray-100 shadow-md animate-fade-in-up flex flex-col h-full"
            onClick={handleClick}
            style={{ minHeight: 420 }}
        >
            {/* Image Container */}
            <div className="relative overflow-hidden min-h-[200px] max-h-[200px] flex items-center justify-center bg-white">
                {/* Nếu có ảnh và không lỗi thì hiển thị ảnh, nếu lỗi thì không hiển thị gì cả */}
                {!imgError && img && (
                    <img
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 rounded-t-3xl"
                        src={img}
                        onError={() => setImgError(true)}
                    />
                )}
                {/* Category Tag */}
                {category && (
                    <div className="absolute top-3 left-3 z-10">
                        <Tag
                            color={getCategoryColor(category)}
                            className="font-medium text-base px-3 py-1 rounded-full shadow-md"
                            style={{ borderRadius: 999 }}
                        >
                            {getCategoryLabel(category)}
                        </Tag>
                    </div>
                )}
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300"></div>
            </div>

            {/* Content - đảm bảo chỉ nằm ngoài ảnh */}
            <div className="flex flex-col flex-1 p-7 min-h-[220px]">
                {/* Title */}
                <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2 group-hover:bg-gradient-to-r group-hover:from-[#36ae9a] group-hover:to-[#4fd1c5] group-hover:text-transparent group-hover:bg-clip-text transition-all duration-300">
                    {headlines}
                </h3>

                {/* Excerpt */}
                <p className="text-gray-600 mb-4 text-base line-clamp-3 leading-relaxed flex-1">
                    {excerpt}
                </p>

                {/* Metadata */}
                <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
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
                        <span>{views?.toLocaleString?.() ?? views}</span>
                    </div>
                </div>

                {/* Read More Button */}
                <div className="mt-auto pt-3 border-t border-gray-100 flex justify-start">
                    <div className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-[#36ae9a] to-[#4fd1c5] text-white font-semibold text-sm shadow-md group-hover:scale-105 group-hover:shadow-lg transition-all duration-300">
                        Đọc thêm →
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BlogCard;
