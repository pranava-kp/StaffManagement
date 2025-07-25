import React from "react";
import * as Icons from "react-icons/vsc";
import { NavLink, useLocation } from "react-router-dom";
import { matchPath } from "react-router-dom";

const SidebarLink = ({ link, iconName, onClick }) => {
    const Icon = Icons[iconName];
    const location = useLocation();

    const matchRoute = (route) => {
        return matchPath({ path: route }, location.pathname);
    };

    return (
        <NavLink
            to={link.path}
            onClick={onClick}
            className={`relative px-8 py-2 text-sm font-medium text-gray-100 ${
                matchRoute(link.path)
                    ? "text-orange-500 bg-orange-950 border-l border-l-orange-500"
                    : "bg-transparent"
            }`}
        >
            <span
                className={`absolute left-0 top-0 h-full w-[0.2rem] bg-yellow-50 ${
                    matchRoute(link.path) ? "opacity-100" : "opacity-0"
                }`}
            ></span>
            <div className="flex items-center gap-x-2">
                <Icon />
                <span>{link.name}</span>
            </div>
        </NavLink>
    );
};

export default SidebarLink;