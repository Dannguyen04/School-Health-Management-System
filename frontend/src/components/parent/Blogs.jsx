import { useEffect, useState } from "react";
import BlogCard from "../parentlayout/BlogCard";
import { publicAPI } from "../../utils/api";

const Blogs = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                setLoading(true);
                const response = await publicAPI.getPublishedBlogs("limit=6");
                if (response.data.success) {
                    setBlogs(response.data.data);
                }
            } catch (error) {
                console.error("Error fetching blogs:", error);
                // Fallback to default blogs if API fails
                setBlogs([
                    {
                        id: "1",
                        title: "Khám phá bí ẩn về giấc ngủ",
                        excerpt:
                            "Lorem ipsum dolor sit amet consectetur adipisicing elit. Vitae, repellendus suscipit. Rerum consequatur magni expedita.",
                        coverImage: "/img/blog1.jpg",
                    },
                    {
                        id: "2",
                        title: "Chế độ ăn tốt cho tim mạch",
                        excerpt:
                            "Lorem ipsum dolor sit amet consectetur adipisicing elit. Vitae, repellendus suscipit. Rerum consequatur magni expedita.",
                        coverImage: "/img/blog2.jpg",
                    },
                    {
                        id: "3",
                        title: "Hiểu về tiêm chủng cho trẻ em",
                        excerpt:
                            "Lorem ipsum dolor sit amet consectetur adipisicing elit. Vitae, repellendus suscipit. Rerum consequatur magni expedita.",
                        coverImage: "/img/blog3.jpg",
                    },
                    {
                        id: "4",
                        title: "Chăm sóc sức khỏe tâm thần",
                        excerpt:
                            "Lorem ipsum dolor sit amet consectetur adipisicing elit. Vitae, repellendus suscipit. Rerum consequatur magni expedita.",
                        coverImage: "/img/blog4.jpg",
                    },
                    {
                        id: "5",
                        title: "Tầm quan trọng của vận động thường xuyên",
                        excerpt:
                            "Lorem ipsum dolor sit amet consectetur adipisicing elit. Vitae, repellendus suscipit. Rerum consequatur magni expedita.",
                        coverImage: "/img/blog5.jpg",
                    },
                    {
                        id: "6",
                        title: "Kiến thức cơ bản về chăm sóc da",
                        excerpt:
                            "Lorem ipsum dolor sit amet consectetur adipisicing elit. Vitae, repellendus suscipit. Rerum consequatur magni expedita.",
                        coverImage: "/img/blog6.jpg",
                    },
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchBlogs();
    }, []);

    return (
        <div className=" min-h-screen flex flex-col justify-center lg:px-32 px-5 pt-24">
            <div className=" flex flex-col items-center lg:flex-row justify-between">
                <div>
                    <h1 className=" text-4xl font-semibold text-center lg:text-start">
                        Bài viết mới nhất
                    </h1>
                    <p className=" mt-2 text-center lg:text-start">
                        Cập nhật kiến thức, chia sẻ kinh nghiệm và thông tin hữu
                        ích về sức khỏe học đường.
                    </p>
                </div>
            </div>
            <div className=" my-8">
                <div className=" flex flex-wrap justify-center gap-5">
                    {loading
                        ? // Loading skeleton
                          Array.from({ length: 6 }).map((_, index) => (
                              <div
                                  key={index}
                                  className="w-full lg:w-1/4 p-2 space-y-2 rounded-lg animate-pulse"
                                  style={{
                                      boxShadow: "0px 3px 8px rgba(0,0,0,0.24)",
                                  }}
                              >
                                  <div className="h-64 md:h-96 lg:h-40 w-full rounded-lg bg-gray-300"></div>
                                  <div className="h-6 bg-gray-300 rounded"></div>
                                  <div className="h-4 bg-gray-300 rounded"></div>
                              </div>
                          ))
                        : blogs.map((blog) => (
                              <BlogCard
                                  key={blog.id}
                                  id={blog.id}
                                  img={blog.coverImage || "/img/blog1.jpg"}
                                  headlines={blog.title}
                                  excerpt={blog.excerpt}
                              />
                          ))}
                </div>
            </div>
        </div>
    );
};

export default Blogs;
