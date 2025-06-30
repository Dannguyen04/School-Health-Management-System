import { FaFileMedical } from "react-icons/fa";
import { MdHealthAndSafety, MdOutlineMedication } from "react-icons/md";
import { RiMicroscopeLine } from "react-icons/ri";
import { HiOutlineClock } from "react-icons/hi";
import ServicesCard from "../parentlayout/ServicesCard";

const Services = ({ onServiceClick, isHomepage }) => {
    const icon1 = <RiMicroscopeLine size={35} className=" text-[#36ae9a]" />;
    const icon2 = <MdHealthAndSafety size={35} className=" text-[#36ae9a]" />;
    const icon3 = <FaFileMedical size={35} className=" text-[#36ae9a]" />;
    const icon4 = <MdOutlineMedication size={35} className=" text-[#36ae9a]" />;
    const icon5 = <HiOutlineClock size={35} className=" text-[#36ae9a]" />;

    // Nếu là homepage thì truyền onClick, ngược lại không truyền (ServicesCard sẽ tự navigate)
    const getOnClick = () => (isHomepage ? onServiceClick : undefined);

    return (
        <div className=" min-h-screen flex flex-col justify-center lg:px-32 px-5 pt-24 lg:pt-16">
            <div className=" flex flex-col items-center lg:flex-row justify-between">
                <div>
                    <h1 className=" text-4xl font-semibold text-center lg:text-start">
                        Dịch vụ của chúng tôi
                    </h1>
                    <p className=" mt-2 text-center lg:text-start">
                        Chúng tôi cung cấp các dịch vụ y tế học đường toàn diện,
                        đảm bảo sức khỏe cho học sinh.
                    </p>
                </div>
            </div>
            <div className=" flex flex-col lg:flex-row gap-5 pt-14">
                <ServicesCard
                    icon={icon1}
                    title="Lịch tiêm & khám"
                    des="Quản lý lịch tiêm chủng và khám sức khỏe"
                    to="/user/vaccination-schedule"
                    onClick={getOnClick()}
                />
                <ServicesCard
                    icon={icon2}
                    title="Kết quả khám sức khỏe"
                    des="Truy cập kết quả khám sức khỏe"
                    to="/user/health-checkup-results"
                    onClick={getOnClick()}
                />
                <ServicesCard
                    icon={icon3}
                    title="Hồ sơ sức khỏe"
                    des="Cập nhật và xem thông tin sức khỏe của học sinh"
                    to="/user/health-profile"
                    onClick={getOnClick()}
                />
                <ServicesCard
                    icon={icon4}
                    title="Gửi thuốc"
                    des="Gửi thuốc cho học sinh"
                    to="/user/medicine-info"
                    onClick={getOnClick()}
                />
                <ServicesCard
                    icon={icon3}
                    title="Đơn đồng ý"
                    des="Đơn xác nhận tiêm vaccine"
                    to="/user/consent-forms"
                    onClick={getOnClick()}
                />
                <ServicesCard
                    icon={icon5}
                    title="Lịch sử tiêm chủng"
                    des="Xem chi tiết lịch sử tiêm chủng của học sinh"
                    to="/user/vaccination-history"
                    onClick={getOnClick()}
                />
            </div>
        </div>
    );
};

export default Services;
