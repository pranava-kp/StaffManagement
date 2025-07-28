import React, { useState, useEffect, useRef } from "react";
import { Outlet } from "react-router-dom";
import SideBar from "./SideBar";
import DashboardNavbar from "../../common/DashboardNavbar";

const DashboardLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const sidebarRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
                setSidebarOpen(false);
                setMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className="flex flex-col min-h-screen">
            <DashboardNavbar
                setSidebarOpen={setSidebarOpen}
                menuOpen={menuOpen}
                setMenuOpen={setMenuOpen}
            />
            <div className="flex flex-1 relative">
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                        onClick={() => {
                            setSidebarOpen(false);
                            setMenuOpen(false);
                        }}
                    />
                )}

                <div
                    ref={sidebarRef}
                    className={`fixed md:relative z-50 h-[calc(100vh-3.5rem)] w-64 transition-all duration-300 ease-in-out ${
                        sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
                    }`}
                >
                    <SideBar onClose={() => {
                        setSidebarOpen(false);
                        setMenuOpen(false);
                    }} />
                </div>

                <div className="flex-1 h-[calc(100vh-3.5rem)] w-full overflow-auto bg-white">
                    <div className="mx-auto w-11/12 max-w-[1000px] py-10">
                        <Outlet />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardLayout;
