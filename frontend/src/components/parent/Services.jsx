import { FaFileMedical } from "react-icons/fa";
import { MdHealthAndSafety, MdOutlineMedication } from "react-icons/md";
import { RiMicroscopeLine } from "react-icons/ri";
import ServicesCard from "../parentlayout/ServicesCard";

const Services = () => {
  const icon1 = <RiMicroscopeLine size={35} className=" text-[#36ae9a]" />;
  const icon2 = <MdHealthAndSafety size={35} className=" text-[#36ae9a]" />;
  const icon3 = <FaFileMedical size={35} className=" text-[#36ae9a]" />;
  const icon4 = <MdOutlineMedication size={35} className=" text-[#36ae9a]" />;

  return (
    <div className=" min-h-screen flex flex-col justify-center lg:px-32 px-5 pt-24 lg:pt-16">
      <div className=" flex flex-col items-center lg:flex-row justify-between">
        <div>
          <h1 className=" text-4xl font-semibold text-center lg:text-start">
            Dịch vụ của chúng tôi
          </h1>
          <p className=" mt-2 text-center lg:text-start">
            Chúng tôi cung cấp các dịch vụ y tế học đường toàn diện, đảm bảo sức
            khỏe cho học sinh.
          </p>
        </div>
      </div>
      <div className=" flex flex-col lg:flex-row gap-5 pt-14">
        <ServicesCard
          icon={icon1}
          title="Lịch tiêm & khám"
          des="Quản lý lịch tiêm chủng và khám sức khỏe"
          to="/user/vaccination-schedule"
        />
        <ServicesCard
          icon={icon2}
          title="Kết quả khám sức khỏe"
          des="Truy cập kết quả khám sức khỏe"
          to="/user/health-checkup-results"
        />
        <ServicesCard
          icon={icon3}
          title="Hồ sơ sức khỏe"
          des="Cập nhật và xem thông tin sức khỏe của học sinh"
          to="/user/health-profile"
        />
        <ServicesCard
          icon={icon4}
          title="Gửi thuốc"
          des="Gửi thuốc cho học sinh"
          to="/user/medicine-info"
        />
        <ServicesCard
          icon={icon3}
          title="Đơn đồng ý"
          des="Đơn"
          to="/user/consent-forms"
        />
      </div>
    </div>
  );
};

export default Services;
