const Home = () => {
  return (
    <div className=" min-h-screen flex flex-col justify-center lg:px-32 px-5 text-white bg-[url('/img/home.png')] bg-no-repeat bg-cover opacity-90">
      <div className=" w-full lg:w-4/5 space-y-5 mt-10">
        <h1 className="text-5xl font-bold leading-tight">
          Đồng hành cùng sức khỏe học đường – Nơi gửi gắm niềm tin của bạn!
        </h1>
        <p>
          Chúng tôi cam kết mang đến môi trường học đường an toàn, khỏe mạnh và
          phát triển toàn diện cho học sinh.
        </p>
      </div>
    </div>
  );
};

export default Home;
