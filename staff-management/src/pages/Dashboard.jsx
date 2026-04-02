import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import SideBar from "../components/core/Dashboard/SideBar";

const Dashboard = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex flex-1 relative min-h-screen bg-[#F8FAFC]">
            {/* Soft Background Accent */}
            <div className="absolute top-0 right-0 w-full h-64 bg-gradient-to-b from-orange-500/5 to-transparent pointer-events-none" />
            
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden" 
                    onClick={() => setSidebarOpen(false)}
                />
            )}
            
            {/* Sidebar with enhanced shadow */}
            <div className={`fixed md:relative z-50 h-[calc(100vh-3.5rem)] transition-all duration-500 ease-in-out ${
                sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
            }`}>
                <SideBar onClose={() => setSidebarOpen(false)} />
            </div>
            
            {/* Main content area with "Floating" feel */}
            <div className="flex-1 h-[calc(100vh-3.5rem)] w-full overflow-auto relative">
                <div className="mx-auto w-11/12 max-w-[1100px] py-10">
                    <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/20 min-h-[80vh]">
                        <Outlet/>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;