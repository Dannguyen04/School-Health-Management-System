import { useRef } from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import Slider from "react-slick";
import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";
import "./Doctors.css";

const Doctors = () => {
  const data = [
    {
      img: "/img/doc1.jpg",
      name: "BS. Serena Mitchell",
      specialties: "Bác sĩ Chỉnh hình",
    },
    {
      img: "/img/doc2.jpg",
      name: "BS. Julian Bennett",
      specialties: "Bác sĩ Tim mạch",
    },
    {
      img: "/img/doc3.jpg",
      name: "BS. Camila Rodriguez",
      specialties: "Bác sĩ Nhi khoa",
    },
    {
      img: "/img/doc4.jpg",
      name: "BS. Victor Nguyễn",
      specialties: "Bác sĩ Thần kinh",
    },
    {
      img: "/img/doc5.jpg",
      name: "BS. Ethan Carter",
      specialties: "Bác sĩ Da liễu",
    },
    {
      img: "/img/doc6.jpg",
      name: "BS. Olivia Martinez",
      specialties: "Bác sĩ Mắt",
    },
  ];

  const slider = useRef(null);

  const settings = {
    accessibility: true,
    dots: true,
    infinite: true,
    speed: 500,
    arrows: false,
    slidesToShow: 3,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1023,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
          infinite: true,
          dots: true,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
          initialSlide: 2,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          initialSlide: 2,
        },
      },
    ],
  };

  return (
    <div className=" min-h-screen flex flex-col justify-center lg:px-32 px-5 pt-16">
      <div className=" flex flex-col items-center lg:flex-row justify-between mb-10 lg:mb-0">
        <div>
          <h1 className=" text-4xl font-semibold text-center lg:text-start">
            Đội ngũ bác sĩ
          </h1>
          <p className=" mt-2 text-center lg:text-start">
            Đội ngũ bác sĩ chuyên môn cao, tận tâm chăm sóc sức khỏe học sinh.
          </p>
        </div>
        <div className="flex gap-5 mt-4 lg:mt-0">
          <button
            className=" bg-[#d5f2ec] text-[#36ae9a] px-4 py-2 rounded-lg active:bg-[#ade9dc]"
            onClick={() => slider.current.slickPrev()}
          >
            <FaArrowLeft size={25} />
          </button>
          <button
            className=" bg-[#d5f2ec] text-[#36ae9a] px-4 py-2 rounded-lg active:bg-[#ade9dc]"
            onClick={() => slider.current.slickNext()}
          >
            <FaArrowRight size={25} />
          </button>
        </div>
      </div>
      <div className=" mt-5">
        <Slider ref={slider} {...settings}>
          {data.map((e, index) => (
            <div
              className="h-[350px] text-black rounded-xl mb-2 cursor-pointer custom-shadow"
              key={index}
            >
              <div>
                <img
                  src={e.img}
                  alt="img"
                  className=" h-56 rounded-t-xl w-full"
                />
              </div>

              <div className=" flex flex-col justify-center items-center">
                <h1 className=" font-semibold text-xl pt-4">{e.name}</h1>
                <h3 className=" pt-2">{e.specialties}</h3>
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
};

export default Doctors;
