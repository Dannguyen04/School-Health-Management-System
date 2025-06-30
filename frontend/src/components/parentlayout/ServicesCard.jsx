import { useNavigate } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";

const ServicesCard = ({ icon, title, des, to, onClick }) => {
    const navigate = useNavigate();

    return (
        <div
            className="group relative bg-white rounded-2xl p-8 cursor-pointer transition-all duration-500 ease-in-out hover:shadow-2xl hover:-translate-y-2 border border-gray-100"
            onClick={onClick ? onClick : () => to && navigate(to)}
        >
            {/* Background gradient on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#36ae9a]/5 to-[#ade9dc]/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            {/* Content */}
            <div className="relative z-10">
                {/* Icon */}
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#d5f2ec] to-[#ade9dc] rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                    <div className="group-hover:scale-110 transition-transform duration-300">
                        {icon}
                    </div>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-800 mb-4 group-hover:text-[#36ae9a] transition-colors duration-300">
                    {title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 mb-6 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                    {des}
                </p>

                {/* Learn More Button */}
                <div className="flex items-center text-[#36ae9a] font-semibold group-hover:text-[#2a8a7a] transition-colors duration-300">
                    <span className="mr-2">Tìm hiểu thêm</span>
                    <FaArrowRight className="group-hover:translate-x-1 transition-transform duration-300" />
                </div>
            </div>

            {/* Hover border effect */}
            <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-[#36ae9a]/20 transition-colors duration-300"></div>
        </div>
    );
};

export default ServicesCard;
