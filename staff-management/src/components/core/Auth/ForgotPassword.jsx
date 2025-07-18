import { useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import { apiConnector } from "../../../services/apiConnector";
import { endpoints } from "../../../services/apis";
import { toast } from "react-hot-toast";

function ForgotPassword() {
  const navigate = useNavigate();
  // step: 1 = Email input, 2 = OTP input, 3 = New Password input
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  const { email, otp, newPassword, confirmNewPassword } = formData;

  // Handles input field changes
  const handleOnChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Function to send OTP to the user's email
  const sendOtp = async () => {
    setLoading(true);
    try {
      const res = await apiConnector("POST", endpoints.GENERATE_OTP, { email });
      if (!res.data.success) throw new Error(res.data.message);
      toast.success("OTP sent to your email");
      setStep(2);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to send OTP";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };


  // Function to verify the entered OTP
  const verifyOtp = async () => {
    setLoading(true);
    try {
      // API call to verify OTP
      const res = await apiConnector(
        "POST",
        `${process.env.REACT_APP_BASE_URL}/verify-otp`, // Using the provided endpoint
        { email, otp }
      );
      if (!res.data.success) throw new Error(res.data.message);
      toast.success("OTP verified. You can now set your new password.");
      setStep(3); // Move to the new password step
    } catch (err) {
      toast.error(err.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  // Function to reset the user's password
  const resetPassword = async () => {
    // Client-side validation: check if passwords match
    if (newPassword !== confirmNewPassword) {
      toast.error("New password and confirm password do not match.");
      return;
    }
    setLoading(true);
    try {
      // API call to reset password (placeholder endpoint)
      // Replace with your actual backend endpoint for password reset
      const res = await apiConnector(
        "POST",
        `${process.env.REACT_APP_BASE_URL}/reset-password-with-otp`,
        { email, otp, newPassword, confirmNewPassword }
      );
      if (!res.data.success) throw new Error(res.data.message);
      toast.success("Password reset successfully! Please login.");
      navigate("/login"); // Navigate back to login after successful reset
    } catch (err) {
      toast.error(err.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  // Handles form submission based on the current step
  const handleSubmit = (e) => {
    e.preventDefault();
    if (step === 1) {
      sendOtp();
    } else if (step === 2) {
      verifyOtp();
    } else if (step === 3) {
      resetPassword();
    }
  };

  return (
    <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center patternBackground">
      <div className="mx-auto w-11/12 max-w-[450px] md:mx-0 bg-blue-300 rounded-md bg-clip-padding backdrop-filter backdrop-blur-[9px] bg-opacity-20 border border-gray-100 p-6 relative shadow-2xl">
        <h1 className="text-[1.875rem] text-center font-semibold leading-[2.375rem] text-blue-800 ">
          Forgot Password
        </h1>
        <form
          onSubmit={handleSubmit}
          className="mt-6 flex w-full flex-col gap-y-4"
        >
          {/* Email Input Field */}
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
              readOnly={step === 2 || step === 3}
              className={`w-full rounded-[0.5rem] bg-richblack-800 p-[12px] text-black placeholder:text-gray-500 transition-opacity duration-300 ${step === 2 || step === 3 ? "opacity-70 cursor-not-allowed" : ""
                }`}
              style={{
                boxShadow: "inset 0px -1px 0px rgba(255, 255, 255, 0.18)",
              }}
            />
          </label>

          {/* OTP Input Field (Visible only in step 2) */}
          {step === 2 && (
            <label className="w-full">
              <p className="mb-1 text-[0.875rem] leading-[1.375rem] text-gray-950">
                One Time Password <sup className="text-pink-500">*</sup>
              </p>
              <input
                required
                type="text"
                name="otp"
                value={otp}
                onChange={handleOnChange}
                placeholder="Enter OTP"
                style={{
                  boxShadow: "inset 0px -1px 0px rgba(255, 255, 255, 0.18)",
                }}
                className="w-full rounded-[0.5rem] bg-richblack-800 p-[12px] text-black"
              />
            </label>
          )}

          {/* New Password and Confirm New Password Fields (Visible only in step 3) */}
          {step === 3 && (
            <>
              {/* New Password Input */}
              <label className="relative w-full">
                <p className="mb-1 text-[0.875rem] leading-[1.375rem] text-gray-950">
                  New Password <sup className="text-pink-500">*</sup>
                </p>
                <input
                  required
                  type={showNewPassword ? "text" : "password"}
                  name="newPassword"
                  value={newPassword}
                  onChange={handleOnChange}
                  placeholder="Enter new password"
                  style={{
                    boxShadow: "inset 0px -1px 0px rgba(255, 255, 255, 0.18)",
                  }}
                  className="w-full rounded-[0.5rem] bg-richblack-800 p-[12px] text-black"
                />
                {/* Toggle password visibility */}
                <span
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  className="absolute right-3 top-[38px] z-[10] cursor-pointer"
                >
                  {showNewPassword ? (
                    <AiOutlineEyeInvisible fontSize={24} fill="#AFB2BF" />
                  ) : (
                    <AiOutlineEye fontSize={24} fill="#AFB2BF" />
                  )}
                </span>
              </label>

              {/* Confirm New Password Input */}
              <label className="relative w-full">
                <p className="mb-1 text-[0.875rem] leading-[1.375rem] text-gray-950">
                  Confirm New Password <sup className="text-pink-500">*</sup>
                </p>
                <input
                  required
                  type={showConfirmNewPassword ? "text" : "password"}
                  name="confirmNewPassword"
                  value={confirmNewPassword}
                  onChange={handleOnChange}
                  placeholder="Confirm new password"
                  style={{
                    boxShadow: "inset 0px -1px 0px rgba(255, 255, 255, 0.18)",
                  }}
                  className="w-full rounded-[0.5rem] bg-richblack-800 p-[12px] text-black"
                />
                {/* Toggle password visibility */}
                <span
                  onClick={() => setShowConfirmNewPassword((prev) => !prev)}
                  className="absolute right-3 top-[38px] z-[10] cursor-pointer"
                >
                  {showConfirmNewPassword ? (
                    <AiOutlineEyeInvisible fontSize={24} fill="#AFB2BF" />
                  ) : (
                    <AiOutlineEye fontSize={24} fill="#AFB2BF" />
                  )}
                </span>
              </label>
            </>
          )}

          {/* Back to Login / Change Email Button */}
          <div className="w-full flex justify-end">
            <div className="max-w-max">
              <button
                type="button"
                onClick={() => {
                  if (step === 1) {
                    navigate("/login"); // Go back to login from email step
                  } else if (step === 2) {
                    setStep(1); // Go back to email from OTP step
                  } else if (step === 3) {
                    // Go back to email from password reset step and clear password fields
                    setStep(1);
                    setFormData((prev) => ({
                      ...prev,
                      otp: "",
                      newPassword: "",
                      confirmNewPassword: "",
                    }));
                  }
                }}
                className="mt-1 ml-auto max-w-max text-xs text-blue-800 hover:underline"
              >
                {step === 1 ? "Back to Login" : "Change Email"}
              </button>
            </div>
          </div>

          {/* Main Submit Button (text changes based on step) */}
          <button
            type="submit"
            disabled={loading}
            className="mt-6 rounded-[8px] bg-[rgb(255,101,1)] py-[8px] px-[12px] font-medium text-gray-100"
          >
            {step === 1
              ? loading
                ? "Sending..."
                : "Send OTP"
              : step === 2
                ? loading
                  ? "Verifying..."
                  : "Verify Code"
                : loading
                  ? "Resetting..."
                  : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
export default ForgotPassword;
