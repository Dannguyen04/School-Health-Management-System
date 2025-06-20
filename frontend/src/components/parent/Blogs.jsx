import BlogCard from "../parentlayout/BlogCard";

const Blogs = () => {
  return (
    <div className=" min-h-screen flex flex-col justify-center lg:px-32 px-5 pt-24">
      <div className=" flex flex-col items-center lg:flex-row justify-between">
        <div>
          <h1 className=" text-4xl font-semibold text-center lg:text-start">
            Bài viết mới nhất
          </h1>
          <p className=" mt-2 text-center lg:text-start">
            Cập nhật kiến thức, chia sẻ kinh nghiệm và thông tin hữu ích về sức
            khỏe học đường.
          </p>
        </div>
      </div>
      <div className=" my-8">
        <div className=" flex flex-wrap justify-center gap-5">
          <BlogCard
            img={"/img/blog1.jpg"}
            headlines="Khám phá bí ẩn về giấc ngủ"
          />
          <BlogCard
            img={"/img/blog2.jpg"}
            headlines="Chế độ ăn tốt cho tim mạch"
          />
          <BlogCard
            img={"/img/blog3.jpg"}
            headlines="Hiểu về tiêm chủng cho trẻ em"
          />
          <BlogCard
            img={"/img/blog4.jpg"}
            headlines="Chăm sóc sức khỏe tâm thần"
          />
          <BlogCard
            img={"/img/blog5.jpg"}
            headlines="Tầm quan trọng của vận động thường xuyên"
          />
          <BlogCard
            img={"/img/blog6.jpg"}
            headlines="Kiến thức cơ bản về chăm sóc da"
          />
        </div>
      </div>
    </div>
  );
};

export default Blogs;
