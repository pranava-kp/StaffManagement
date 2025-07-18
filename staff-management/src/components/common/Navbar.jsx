import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { setToken } from "../../services/slices/authSlice";
import { toast } from "react-hot-toast";
import logo from '../../assets/images/rns-logo.webp'


const Navbar = () => {
    const navigate = useNavigate();
    const {token} = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const logOutHandler = () => {
        localStorage.removeItem("token");
        dispatch(setToken(null));
        toast.success("Logged out successfully");
        navigate('/login');
    };

    return (
        <div className="h-[3.5rem] bg-[rgb(252,101,1)] border-b border-[rgb(242,90,0)]">
            <div className="h-full w-11/12 mx-auto flex justify-between items-center">
                <img src={logo} alt="RNS"/>
                <div className="text-2xl font-bold salsa text-gray-100">
                    Staff Leave Portal
                </div>
                <div>
                    {token ? (
                        <div className="flex gap-4">
                            <div
                                className="px-4 py-2 rounded-md border border-[rgb(20,20,130)] max-w-max hover:bg-[rgb(9,1,95)] cursor-pointer bg-[rgb(20,20,130)] text-white duration-100"
                                onClick={() => logOutHandler()}
                            >
                                Log out
                            </div>
                        </div>
                    ) : (
                        <div className="flex gap-4">
                            <div
                                className="px-4 py-2 rounded-md border border-[rgb(20,20,130)] max-w-max hover:bg-[rgb(9,1,95)] cursor-pointer bg-[rgb(20,20,130)] text-white duration-100"
                                onClick={() => navigate("/login")}
                            >
                                Log in
                            </div>
                            <div
                                className="px-4 py-2 rounded-md border border-[rgb(20,20,130)] max-w-max hover:bg-[rgb(9,1,95)] cursor-pointer bg-[rgb(20,20,130)] text-white duration-100"
                                onClick={() => navigate("/signup")}
                            >
                                Sign Up
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Navbar;
