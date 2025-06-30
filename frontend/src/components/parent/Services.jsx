import { FaFileMedical } from "react-icons/fa";
import { MdHealthAndSafety, MdOutlineMedication } from "react-icons/md";
import { RiMicroscopeLine } from "react-icons/ri";
import { HiOutlineClock } from "react-icons/hi";
import { FaHeartbeat } from "react-icons/fa";
import ServicesCard from "../parentlayout/ServicesCard";
import { useAuth } from "../../context/authContext";

const Services = ({ onServiceClick, isHomepage }) => {
    const { user } = useAuth();
    const icon1 = <RiMicroscopeLine size={35} className=" text-[#36ae9a]" />;
    const icon2 = <MdHealthAndSafety size={35} className=" text-[#36ae9a]" />;
    const icon3 = <FaFileMedical size={35} className=" text-[#36ae9a]" />;
    const icon4 = <MdOutlineMedication size={35} className=" text-[#36ae9a]" />;
    const icon5 = <HiOutlineClock size={35} className=" text-[#36ae9a]" />;

    // Nếu là homepage thì truyền onClick, ngược lại không truyền (ServicesCard sẽ tự navigate)
    const getOnClick = () => (isHomepage ? onServiceClick : undefined);

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#f6fcfa] to-[#e8f5f2]">
            {/* Quick Access Header */}
            <div className="lg:px-32 px-5 pt-24 pb-12">
                <div className="text-center max-w-4xl mx-auto">
                    <div className="inline-flex items-center gap-2 bg-[#d5f2ec] text-[#36ae9a] px-4 py-2 rounded-full text-sm font-medium mb-6">
                        <FaHeartbeat className="text-[#36ae9a]" />
                        <span>Quản lý sức khỏe học đường</span>
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-4 leading-tight">
                        Tác vụ của tôi
                    </h1>
                    <p className="text-lg text-gray-600 mb-8">
                        Truy cập nhanh các tác vụ quản lý sức khỏe cho con em
                    </p>
                </div>
            </div>

            {/* Tasks Grid */}
            <div className="lg:px-32 px-5 pb-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <ServicesCard
                        icon={icon1}
                        title="Lịch tiêm & khám"
                        des="Quản lý lịch tiêm chủng và khám sức khỏe định kỳ"
                        to="/user/medical-schedule"
                        onClick={getOnClick()}
                    />
                    <ServicesCard
                        icon={icon2}
                        title="Kết quả khám sức khỏe"
                        des="Xem kết quả khám sức khỏe và theo dõi tiến trình"
                        to="/user/health-checkup-results"
                        onClick={getOnClick()}
                    />
                    <ServicesCard
                        icon={icon3}
                        title="Hồ sơ sức khỏe"
                        des="Cập nhật thông tin sức khỏe chi tiết của học sinh"
                        to="/user/health-profile"
                        onClick={getOnClick()}
                    />
                    <ServicesCard
                        icon={icon4}
                        title="Gửi thuốc"
                        des="Gửi thuốc và quản lý thuốc cho học sinh"
                        to="/user/medicine-info"
                        onClick={getOnClick()}
                    />
                    <ServicesCard
                        icon={icon3}
                        title="Đơn đồng ý"
                        des="Xác nhận tiêm vaccine và thủ tục y tế"
                        to="/user/consent-forms"
                        onClick={getOnClick()}
                    />
                    <ServicesCard
                        icon={icon5}
                        title="Lịch sử tiêm chủng"
                        des="Xem lịch sử tiêm chủng và theo dõi lịch tiêm"
                        to="/user/vaccination-history"
                        onClick={getOnClick()}
                    />
                    <ServicesCard
                        icon={
                            <FaHeartbeat size={35} className="text-[#36ae9a]" />
                        }
                        title="Sự kiện y tế"
                        des="Xem các sự kiện y tế liên quan đến học sinh"
                        to="/user/medical-events"
                        onClick={getOnClick()}
                    />
                </div>
            </div>
        </div>
    );
};

export default Services;
