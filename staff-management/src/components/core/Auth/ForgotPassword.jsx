import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiConnector } from "../../../services/apiConnector";
import { endpoints } from "../../../services/apis";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";

function ForgotPassword() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: email, 2: OTP
    const [formData, setFormData] = useState({
        email: "",
        otp: "",
    });
    const [loading, setLoading] = useState(false);

    const { email, otp } = formData;

    const handleOnChange = (e) => {
        setFormData((prevData) => ({
            ...prevData,
            [e.target.name]: e.target.value,
        }));
    };

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await apiConnector("POST", endpoints.SIGNUP_API + "/generateOTP", { email });
            
            if (!response.data.success) {
                throw new Error(response.data.message);
            }
            
            toast.success("Password reset link sent to your email");
            setStep(2);
        } catch (error) {
            toast.error(error.message || "Failed to send reset link");
            console.error(error);
        }
        setLoading(false);
    };

    const handleOTPSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await apiConnector("POST", endpoints.SIGNUP_API + "/verifyOTP", { email, otp });
            
            if (!response.data.success) {
                throw new Error(response.data.message);
            }
            
            toast.success("OTP verified. Please check your email for password reset instructions.");
            navigate("/login");
        } catch (error) {
            toast.error(error.message || "Invalid OTP");
            console.error(error);
        }
        setLoading(false);
    };

    return (
        <div className="flex flex-col gap-y-4 w-full">
            {/* Step 1: Email */}
            {step === 1 && (
                <>
                    <label className="w-full">
                        <p className="mb-1 text-[0.875rem] leading-[1.375rem] text-gray-950">
                            Email Address <sup className="text-pink-500">*</sup>
                        </p>
                        <input
                            required
                            type="email"
                            name="email"
                            value={email}
                            onChange={handleOnChange}
                            placeholder="Enter your registered email"
                            style={{
                                boxShadow: "inset 0px -1px 0px rgba(255, 255, 255, 0.18)",
                            }}
                            className="w-full rounded-[0.5rem] bg-richblack-800 p-[12px] text-black"
                        />
                    </label>
                    <button
                        onClick={handleEmailSubmit}
                        disabled={loading}
                        className="mt-6 rounded-[8px] bg-[rgb(255,101,1)] py-[8px] px-[12px] font-medium text-gray-100"
                    >
                        {loading ? "Sending..." : "Send OTP"}
                    </button>
                </>
            )}

            {/* Step 2: OTP Verification */}
            {step === 2 && (
                <>
                    <label className="w-full">
                        <p className="mb-1 text-[0.875rem] leading-[1.375rem] text-gray-950">
                            Email
                        </p>
                        <input
                            type="email"
                            value={email}
                            readOnly
                            style={{
                                boxShadow: "inset 0px -1px 0px rgba(255, 255, 255, 0.18)",
                            }}
                            className="w-full rounded-[0.5rem] bg-richblack-800 p-[12px] text-black cursor-not-allowed"
                        />
                    </label>
                    <label className="w-full">
                        <p className="mb-1 text-[0.875rem] leading-[1.375rem] text-gray-950">
                            Verification Code <sup className="text-pink-500">*</sup>
                        </p>
                        <input
                            required
                            type="text"
                            name="otp"
                            value={otp}
                            onChange={handleOnChange}
                            placeholder="Enter verification code"
                            style={{
                                boxShadow: "inset 0px -1px 0px rgba(255, 255, 255, 0.18)",
                            }}
                            className="w-full rounded-[0.5rem] bg-richblack-800 p-[12px] text-black"
                        />
                    </label>
                    <button
                        onClick={handleOTPSubmit}
                        disabled={loading}
                        className="mt-6 rounded-[8px] bg-[rgb(255,101,1)] py-[8px] px-[12px] font-medium text-gray-100"
                    >
                        {loading ? "Verifying..." : "Verify Code"}
                    </button>
                </>
            )}

            <div className="flex justify-between mt-4">
                <button
                    type="button"
                    onClick={() => navigate("/login")}
                    className="text-blue-600 hover:underline text-sm"
                >
                    Back to Login
                </button>
                {step === 2 && (
                    <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="text-blue-600 hover:underline text-sm"
                    >
                        Change Email
                    </button>
                )}
            </div>
        </div>
    );
}

export default ForgotPassword;