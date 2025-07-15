const Button = ({ title }) => {
    return (
        <div>
            <button className="bg-[#36ae9a] text-white px-3 py-1.5 rounded-md text-sm hover:bg-[#2a8a7a] transition duration-300 ease-in-out">
                {title}
            </button>
        </div>
    );
};

export default Button;
