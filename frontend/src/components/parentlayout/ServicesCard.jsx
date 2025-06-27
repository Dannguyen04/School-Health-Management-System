import { useNavigate } from "react-router-dom";
const ServicesCard = ({ icon, title, des, to, onClick }) => {
  const navigate = useNavigate();
  return (
    <div
      className="group flex flex-col items-center text-center gap-2 w-full lg:w-1/3 p-5 rounded-lg cursor-pointer lg:hover:-translate-y-6 transition duration-300 ease-in-out"
      style={{ boxShadow: "0px 3px 8px rgba(0,0,0,0.24)" }}
      onClick={onClick ? onClick : () => to && navigate(to)}
    >
      <div className=" bg-[#d5f2ec] p-3 rounded-full transition-colors duration-300 ease-in-out group-hover:bg-[#ade9dc]">
        {icon}
      </div>
      <h1 className=" font-semibold text-lg">{title}</h1>
      <p>{des}</p>
      <h3 className=" text-[#36ae9a] cursor-pointer hover:text-[#ade9dc] transition duration-300 ease-in-out">
        Learn more
      </h3>
    </div>
  );
};

export default ServicesCard;
