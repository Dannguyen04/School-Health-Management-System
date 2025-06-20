const Button = ({ title }) => {
  return (
    <div>
      <button className=" bg-[#dd8036] text-white px-4 py-2 rounded-md hover:bg-hoverColor transition duration-300 ease-in-out">
        {title}
      </button>
    </div>
  );
};

export default Button;
