import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

const Setting = () => {
  const { token } = useSelector(state => state.auth);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const getEmailFromToken = (token) => {
    try {
      if (!token) return null;
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const decodedToken = JSON.parse(window.atob(base64));
      return decodedToken.email || null;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    
    setPasswordErrors(prev => ({
      ...prev,
      [name]: ''
    }));
  };

  const validatePasswordForm = () => {
    let isValid = true;
    const newErrors = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
      isValid = false;
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required';
      isValid = false;
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
      isValid = false;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setPasswordErrors(newErrors);
    return isValid;
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!validatePasswordForm()) return;

    const userEmail = getEmailFromToken(token);
    if (!userEmail) {
      toast.error('Could not determine user email. Please log in again.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:2000/api/v1/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          email: userEmail,
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to change password');
      }

      toast.success('Password changed successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      toast.error(error.message || 'Error changing password');
      console.error('Password change error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col border bg-gray-100 gap-8 w-full rounded-md p-6 relative">
      <div className="flex justify-between items-center border-b-2 w-full p-3 border-gray-300">
        <p className="text-xl font-semibold">Change Password</p>
      </div>

      <div className="flex flex-col gap-4 pb-4">
        <form onSubmit={handlePasswordSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 mx-[10%]">
          <div className="flex flex-col gap-1 relative">
            <label htmlFor="currentPassword" className="text-sm font-medium uppercase text-gray-600">
              Current Password
            </label>
            <input
              id="currentPassword"
              name="currentPassword"
              type={showCurrentPassword ? "text" : "password"}
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              className={`px-4 py-2 w-full bg-white border ${passwordErrors.currentPassword ? 'border-red-500' : 'border-gray-300'} rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            <span
              onClick={() => setShowCurrentPassword((prev) => !prev)}
              className="absolute right-3 top-[38px] z-[10] cursor-pointer"
            >
              {showCurrentPassword ? (
                <AiOutlineEyeInvisible fontSize={24} fill="#AFB2BF" />
              ) : (
                <AiOutlineEye fontSize={24} fill="#AFB2BF" />
              )}
            </span>
            {passwordErrors.currentPassword && (
              <p className="text-red-500 text-xs mt-1">{passwordErrors.currentPassword}</p>
            )}
          </div>

          <div className="flex flex-col gap-1 relative">
            <label htmlFor="newPassword" className="text-sm font-medium uppercase text-gray-600">
              New Password
            </label>
            <input
              id="newPassword"
              name="newPassword"
              type={showNewPassword ? "text" : "password"}
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              className={`px-4 py-2 w-full bg-white border ${passwordErrors.newPassword ? 'border-red-500' : 'border-gray-300'} rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
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
            {passwordErrors.newPassword && (
              <p className="text-red-500 text-xs mt-1">{passwordErrors.newPassword}</p>
            )}
          </div>

          <div className="flex flex-col gap-1 relative">
            <label htmlFor="confirmPassword" className="text-sm font-medium uppercase text-gray-600">
              Confirm New Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              className={`px-4 py-2 w-full bg-white border ${passwordErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            <span
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute right-3 top-[38px] z-[10] cursor-pointer"
            >
              {showConfirmPassword ? (
                <AiOutlineEyeInvisible fontSize={24} fill="#AFB2BF" />
              ) : (
                <AiOutlineEye fontSize={24} fill="#AFB2BF" />
              )}
            </span>
            {passwordErrors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">{passwordErrors.confirmPassword}</p>
            )}
          </div>

          <div className="md:col-span-2 flex justify-center mt-4">
            <button
              type="submit"
              className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 transition-colors duration-200"
              disabled={isLoading}
            >
              {isLoading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Setting;