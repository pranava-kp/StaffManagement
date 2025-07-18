import { useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import { apiConnector } from "../../../services/apiConnector";
import { endpoints } from "../../../services/apis";
import { toast } from "react-hot-toast";

function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 = Email, 2 = OTP
  const [formData, setFormData] = useState({ email: "", otp: "" });
  const [loading, setLoading] = useState(false);

  const { email, otp } = formData;

  const handleOnChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const sendOtp = async () => {
    setLoading(true);
    try {
      const res = await apiConnector("POST", endpoints.GENERATE_OTP, { email });
      if (!res.data.success) throw new Error(res.data.message);
      toast.success("OTP sent to your email 📩");
      setStep(2);
    } catch (err) {
      toast.error(err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    setLoading(true);
    try {
      const res = await apiConnector(
        "POST",
        `${process.env.REACT_APP_BASE_URL}/verify-otp`,
        { email, otp }
      );
      if (!res.data.success) throw new Error(res.data.message);
      toast.success("OTP verified. Check your email for reset link.");
      navigate("/login");
    } catch (err) {
      toast.error(err.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    step === 1 ? sendOtp() : verifyOtp();
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
              readOnly={step === 2}
            />
          </label>

          {step === 2 && (
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
          )}

          <div className="w-full flex justify-end">
            <div className="max-w-max">
              <button
                type="button"
                onClick={() => (step === 1 ? navigate("/login") : setStep(1))}
                className="mt-1 ml-auto max-w-max text-xs text-blue-800 hover:underline"
              >
                {step === 1 ? "Back to Login" : "Change Email"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 rounded-[8px] bg-[rgb(255,101,1)] py-[8px] px-[12px] font-medium text-gray-100"
          >
            {step === 1
              ? loading
                ? "Sending..."
                : "Send OTP"
              : loading
              ? "Verifying..."
              : "Verify Code"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ForgotPassword;