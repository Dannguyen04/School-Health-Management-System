import { forwardRef } from "react";
import { NavLink } from "react-router-dom";

const logoLight = "/favicon-light.svg";

import { cn } from "../utils/cn";

import PropTypes from "prop-types";

export const Sidebar = forwardRef(({ collapsed, navbarLinks }, ref) => {
  return (
    <aside
      ref={ref}
      className={cn(
        "fixed z-[100] flex h-full w-[240px] flex-col overflow-x-hidden border-r border-slate-200 bg-white text-slate-900",
        collapsed ? "md:w-[70px] md:items-center" : "md:w-[240px]",
        collapsed ? "max-md:-left-full" : "max-md:left-0"
      )}
    >
      <div className="flex gap-x-3 p-3">
        <img src={logoLight} alt="Logoipsum" />
        {!collapsed && (
          <p className="text-lg font-medium text-slate-900 transition-colors">
            Logoipsum
          </p>
        )}
      </div>
      <div className="flex w-full flex-col gap-y-4 overflow-y-auto overflow-x-hidden p-3 [scrollbar-width:_thin]">
        {navbarLinks.map((navbarLink) => (
          <nav
            key={navbarLink.title}
            className={cn("sidebar-group", collapsed && "md:items-center")}
          >
            <p
              className={cn("sidebar-group-title", collapsed && "md:w-[45px]")}
            >
              {navbarLink.title}
            </p>
            {navbarLink.links.map((link) => (
              <NavLink
                key={link.label}
                to={link.path}
                className={({ isActive }) =>
                  cn(
                    "sidebar-item text-slate-900 hover:bg-blue-50 hover:text-blue-600",
                    collapsed && "md:w-[45px]",
                    isActive && "bg-blue-500 text-white"
                  )
                }
              >
                <link.icon size={22} className="flex-shrink-0" />
                {!collapsed && (
                  <p className="whitespace-nowrap">{link.label}</p>
                )}
              </NavLink>
            ))}
          </nav>
        ))}
      </div>
    </aside>
  );
});

Sidebar.displayName = "Sidebar";

Sidebar.propTypes = {
  collapsed: PropTypes.bool,
  navbarLinks: PropTypes.array.isRequired,
};
