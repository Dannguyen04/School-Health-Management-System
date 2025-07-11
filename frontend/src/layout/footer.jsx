export const Footer = () => {
  return (
    <footer className="w-full bg-white text-slate-900 border-t border-slate-200 shadow-lg rounded-t-2xl px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
      <p className="text-base font-semibold tracking-wide">
        © 2024 XD Code All Rights Reserved
      </p>
      <div className="flex flex-wrap gap-4">
        <a href="#" className="transition-colors duration-200 hover:text-[#36ae9a] hover:underline font-medium">
          Privacy Policy
        </a>
        <span className="text-slate-300">|</span>
        <a href="#" className="transition-colors duration-200 hover:text-[#36ae9a] hover:underline font-medium">
          Terms of Service
        </a>
      </div>
    </footer>
  );
};
