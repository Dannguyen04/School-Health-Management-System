import { useLocation, useNavigate } from "react-router-dom";

const Footer = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const isLandingPage = location.pathname === "/parent";

    const handleNav = (section) => {
        if (isLandingPage) {
            document
                .getElementById(section)
                ?.scrollIntoView({ behavior: "smooth" });
        } else {
            navigate("/parent", { state: { scrollTo: section } });
        }
    };

    const handleParentNav = (path) => {
        navigate(`/parent/${path}`);
    };

    return (
        <div className=" bg-[#36ae9a] text-white rounded-t-3xl mt-8 md:mt-0">
            <div className="flex flex-col md:flex-row justify-between p-8 md:px-32 px-5">
                <div className=" w-full md:w-1/4">
                    <h1 className=" font-semibold text-xl pb-4">
                        Hệ thống Quản lý Y tế Học đường
                    </h1>
                    <p className=" text-sm">
                        Kết nối nhà trường, phụ huynh và y tế để chăm sóc sức
                        khỏe học sinh toàn diện.
                    </p>
                </div>
                <div className=" w-full md:w-1/4">
                    <h1 className=" font-medium text-xl pb-4 pt-5 md:pt-0">
                        Liên hệ
                    </h1>
                    <nav className=" flex flex-col gap-2">
                        <span className="text-sm">
                            Trường THCS ABC, Quận XYZ, TP.HCM
                        </span>
                        <span className="text-sm">
                            Email: phongyte@abc.edu.vn
                        </span>
                        <span className="text-sm">ĐT: 0123 456 789</span>
                    </nav>
                </div>
            </div>
        </div>
    );
};

export default Footer;
