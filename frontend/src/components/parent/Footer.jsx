import { useLocation, useNavigate } from "react-router-dom";

const contactInfo = [
    {
        icon: (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="#fff"
                className="w-6 h-6"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 6.75c0-1.243 1.007-2.25 2.25-2.25h15a2.25 2.25 0 012.25 2.25v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75z"
                />
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 6.75l9.75 7.5 9.75-7.5"
                />
            </svg>
        ),
        text: "Trường THCS ABC, Quận XYZ, TP.HCM",
    },
    {
        icon: (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="#fff"
                className="w-6 h-6"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15A2.25 2.25 0 002.25 6.75m19.5 0v10.5m-19.5 0A2.25 2.25 0 004.5 19.5h15a2.25 2.25 0 002.25-2.25"
                />
            </svg>
        ),
        text: "Email: phongyte@abc.edu.vn",
    },
    {
        icon: (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="#fff"
                className="w-6 h-6"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 6.75c0-1.243 1.007-2.25 2.25-2.25h15a2.25 2.25 0 012.25 2.25v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75z"
                />
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 6.75l9.75 7.5 9.75-7.5"
                />
            </svg>
        ),
        text: "ĐT: 0123 456 789",
    },
];

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
        <footer className="w-full bg-[#36ae9a] text-white rounded-t-3xl shadow-2xl mt-8 md:mt-0 px-0">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center md:items-start py-10 px-6 gap-8">
                <div className="w-full md:w-1/2 text-center md:text-left mb-6 md:mb-0">
                    <h1 className="font-extrabold text-2xl md:text-3xl pb-2 tracking-wide drop-shadow-sm">
                        Hệ thống Quản lý Y tế Học đường
                    </h1>
                    <p className="text-base md:text-lg opacity-90 font-light">
                        Kết nối nhà trường, phụ huynh và y tế để chăm sóc sức
                        khỏe học sinh toàn diện.
                    </p>
                </div>
                <div className="w-full md:w-1/2 flex flex-col items-start gap-4">
                    <span className="font-bold text-lg mb-2">Liên hệ</span>
                    <nav className="flex flex-col gap-3 w-fit">
                        {contactInfo.map((item, idx) => (
                            <span
                                key={idx}
                                className="flex items-center gap-3 text-base font-medium"
                            >
                                <span className="flex items-center justify-center">
                                    {item.icon}
                                </span>
                                {item.text}
                            </span>
                        ))}
                    </nav>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
