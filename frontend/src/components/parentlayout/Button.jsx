const Button = ({ title }) => {
    return (
        <div>
            <button className="bg-[#dd8036] text-white px-3 py-1.5 rounded-md text-sm hover:bg-hoverColor transition duration-300 ease-in-out">
                {title}
            </button>
        </div>
    );
};

export default Button;
