import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setToken } from "../../services/slices/authSlice";
import { toast } from "react-hot-toast";
import logo from '../../assets/images/rns-logo.webp';
import { FiMenu, FiX } from "react-icons/fi";

const DashboardNavbar = ({ setSidebarOpen, menuOpen, setMenuOpen }) => {
    const navigate = useNavigate();
    const { token } = useSelector((state) => state.auth);
    const dispatch = useDispatch();

    const toggleSidebar = () => {
        setMenuOpen(prev => !prev);
        setSidebarOpen(prev => !prev);
    };

    const logOutHandler = () => {
        localStorage.removeItem("token");
        dispatch(setToken(null));
        toast.success("Logged out successfully");
        navigate('/login');
    };

    return (
        <div className="h-[3.5rem] bg-[rgb(252,101,1)] flex items-center px-4 z-50">
            <div className="flex items-center gap-4 flex-1">
                <button
                    className={`md:hidden text-white text-2xl transition-transform duration-300 ${menuOpen ? 'rotate-90' : ''}`}
                    onClick={toggleSidebar}
                >
                    {menuOpen ? <FiX /> : <FiMenu />}
                </button>
                <img src={logo} alt="RNS" className="h-10 mr-3" />
                <div className="text-2xl font-bold salsa text-gray-100">
                    Staff Leave Portal
                </div>
            </div>

            {token && (
                <button
                    className="px-4 py-2 bg-[rgb(20,20,130)] text-white rounded-md hover:bg-[rgb(9,1,95)] transition-colors"
                    onClick={logOutHandler}
                >
                    Log out
                </button>
            )}
        </div>
    );
};

export default DashboardNavbar;
