import React from "react";
import logo from '../../assets/images/rns-logo.webp';

const Navbar = () => {
    return (
        <div className="h-[3.5rem] bg-[rgb(252,101,1)] flex items-center px-4 z-50">
            <div className="flex items-center gap-4">
                <img src={logo} alt="RNS" className="h-10 mr-3" />
                <div className="text-2xl font-bold salsa text-gray-100">
                    Staff Leave Portal
                </div>
            </div>
        </div>
    );
};

export default Navbar;
