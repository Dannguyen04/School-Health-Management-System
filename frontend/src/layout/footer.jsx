export const Footer = () => {
  return (
    <footer className="flex flex-wrap items-center justify-between gap-4 pt-4 bg-white text-slate-900 border-t border-slate-200">
      <p className="text-base font-medium">
        © 2024 XD Code All Rights Reserved
      </p>
      <div className="flex flex-wrap gap-x-2">
        <a href="#" className="link">
          Privacy Policy
        </a>
        <a href="#" className="link">
          Terms of Service
        </a>
      </div>
    </footer>
  );
};
