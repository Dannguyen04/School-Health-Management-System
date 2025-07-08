import { useNavigate } from "react-router-dom";

const HomepageNavbar = () => {
    const navigate = useNavigate();

    return (
        <div className="hidden md:block fixed top-0 left-0 w-full z-50 text-white">
            <div className="flex flex-row justify-between p-5 md:px-32 px-5 bg-[#36ae9a] shadow-[rgba(0,_0,_0,_0.24)_0px_3px_8px]">
                <div className="flex flex-row items-center cursor-pointer gap-3">
                    <img
                        src="/img/logo.png"
                        alt="School Health Logo"
                        style={{ width: 36, height: 36, objectFit: "contain" }}
                    />
                    <h1 className="text-2xl font-semibold">
                        Sức Khỏe Học Đường
                    </h1>
                </div>
                <button
                    className="ml-4 py-2 px-6 rounded-md bg-white text-[#36ae9a] font-semibold text-base transition-colors hover:bg-[#ade9dc]"
                    onClick={() => navigate("/auth")}
                >
                    Đăng nhập
                </button>
            </div>
        </div>
    );
};

export default HomepageNavbar;
