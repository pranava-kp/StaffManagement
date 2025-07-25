import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import SideBar from "../components/core/Dashboard/SideBar";
import LoadingSpinner from "../components/common/LoadingSpinner";

const Dashboard = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex flex-1 relative">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" 
                    onClick={() => setSidebarOpen(false)}
                />
            )}
            
            {/* Sidebar */}
            <div className={`fixed md:relative z-50 h-[calc(100vh-3.5rem)] transition-all duration-300 ease-in-out ${
                sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
            }`}>
                <SideBar onClose={() => setSidebarOpen(false)} />
            </div>
            
            {/* Main content */}
            <div className="flex-1 h-[calc(100vh-3.5rem)] w-full overflow-auto bg-white">
                <div className="mx-auto w-11/12 max-w-[1000px] py-10">
                    <Outlet/>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;