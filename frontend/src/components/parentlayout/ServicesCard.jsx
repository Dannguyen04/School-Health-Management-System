import { useNavigate } from "react-router-dom";
import { useRef, useEffect } from "react";
// Nếu đã cài framer-motion thì import, nếu chưa thì dùng CSS animation
// import { motion, useAnimation } from "framer-motion";

const ServicesCard = ({ icon, title, des, to, onClick }) => {
    const navigate = useNavigate();
    const cardRef = useRef(null);

    // Hiệu ứng xuất hiện bằng CSS nếu không dùng framer-motion
    useEffect(() => {
        const el = cardRef.current;
        if (el) {
            const onScroll = () => {
                const rect = el.getBoundingClientRect();
                if (rect.top < window.innerHeight - 40) {
                    el.classList.add("fade-in-up");
                }
            };
            window.addEventListener("scroll", onScroll);
            onScroll();
            return () => window.removeEventListener("scroll", onScroll);
        }
    }, []);

    // Cắt mô tả nếu quá dài
    const shortDes = des && des.length > 90 ? des.slice(0, 90) + "..." : des;

    return (
        <div
            ref={cardRef}
            tabIndex={0}
            aria-label={title + (des ? ". " + des : "")}
            className="group relative bg-white rounded-2xl p-6 sm:p-8 cursor-pointer transition-all duration-500 ease-in-out border border-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#36ae9a] fade-init"
            onClick={onClick ? onClick : () => to && navigate(to)}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    onClick ? onClick() : to && navigate(to);
                }
            }}
        >
            {/* Background gradient on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#36ae9a]/5 to-[#ade9dc]/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            {/* Content */}
            <div className="relative z-10">
                {/* Icon */}
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-[#d5f2ec] to-[#ade9dc] rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    <div className="group-hover:scale-110 transition-transform duration-300 text-lg">
                        {icon}
                    </div>
                </div>

                {/* Title */}
                <h3 className="text-base font-semibold text-gray-800 mb-2 group-hover:text-[#36ae9a] transition-colors duration-300">
                    {title}
                </h3>

                {/* Description */}
                <p
                    className="text-gray-700 mb-4 text-sm leading-relaxed group-hover:text-gray-800 transition-colors duration-300"
                    title={des && des.length > 90 ? des : undefined}
                >
                    {shortDes}
                </p>
            </div>

            {/* Hover border effect */}
            <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-[#36ae9a]/40 group-hover:shadow-2xl group-hover:bg-[#f6fcfa]/40 transition-all duration-300"></div>
        </div>
    );
};

// CSS animation cho hiệu ứng xuất hiện
// Thêm vào file global css hoặc App.css nếu chưa có
// .fade-init { opacity: 0; transform: translateY(30px); transition: opacity 0.6s, transform 0.6s; }
// .fade-in-up { opacity: 1 !important; transform: translateY(0) !important; }

export default ServicesCard;
