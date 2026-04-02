import React, { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { getProfileData } from '../../../services/operations/profileAPI';
import { apiConnector } from "../../../services/apiConnector";
import toast from "react-hot-toast";
import ConfirmationModal from '../../common/ConfirmationModal';

const MyProfile = () => {
  const [profile, setProfile] = useState(null);
  const [editableProfileData, setEditableProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasNullValues, setHasNullValues] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [invalidFields, setInvalidFields] = useState([]);

  const { token } = useSelector((state) => state.auth);

  const REQUIRED_FIELDS = ['employeeId', 'gender', 'phoneNumber'];

  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getProfileData(token);
      if (res.success) {
        setProfile(res.profileData);
        setEditableProfileData(res.profileData);

        const nullFields = [
          res.profileData.employeeId,
          res.profileData.gender,
          res.profileData.phoneNumber,
        ].some((f) => !f);
        setHasNullValues(nullFields);
      }
    } catch (err) {
      setError(err.message || 'Failed to load profile.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) fetchProfile();
    else {
      setError('No authentication token found');
      setLoading(false);
    }
  }, [token, fetchProfile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditableProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handlePreSaveValidation = () => {
    const missing = REQUIRED_FIELDS.filter(
      (key) => !editableProfileData[key]?.trim()
    );

    if (missing.length > 0) {
      setInvalidFields(missing);
      return;
    }

    setInvalidFields([]);
    setShowConfirmation(true);
  };

  const handleSaveProfile = async () => {
    setShowConfirmation(false);
    setLoading(true);
    try {
      const dataToUpdate = {
        employeeId: editableProfileData.employeeId,
        gender: editableProfileData.gender,
        phone: editableProfileData.phoneNumber,
      };

      const response = await apiConnector(
        "PATCH",
        "/update-own-profile",
        dataToUpdate,
        {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      );

      if (response.data.success) {
        await fetchProfile();
        setIsEditing(false);
        setHasNullValues(false);
        toast.success("Profile updated successfully!");
      }
    } catch (err) {
      console.error(err.message || 'Failed to update profile.');
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div>
    </div>
  );
  if (error) return <div className="p-4 text-red-500 bg-red-50 rounded-lg border border-red-100">Error: {error}</div>;
  if (!profile) return <div className="p-4 text-gray-500 text-center mt-10">No profile data available</div>;

  return (
    <div className="flex flex-col w-full relative animate-fadeIn">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Personal Information</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your staff details and contact info.</p>
        </div>
        
        {!isEditing && hasNullValues && (
          <button
            onClick={handleEditClick}
            className="w-full sm:w-auto bg-rnsit-blue text-white px-6 py-2.5 rounded-xl hover:bg-rnsit-blue/90 transition-all duration-300 font-medium shadow-md shadow-blue-900/10"
            disabled={loading}
          >
            Edit Profile
          </button>
        )}
        {isEditing && (
          <button
            onClick={handlePreSaveValidation}
            className="w-full sm:w-auto bg-orange-500 text-white px-6 py-2.5 rounded-xl hover:bg-orange-600 transition-all duration-300 font-medium shadow-md shadow-orange-500/20"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        )}
      </div>

      <div className="w-full h-[1px] bg-gray-100 mb-8"></div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        <ProfileField
          label="First Name"
          name="firstName"
          value={editableProfileData?.firstName || ''}
          isEditing={isEditing}
          onChange={handleInputChange}
          readOnly={true}
        />
        <ProfileField
          label="Last Name"
          name="lastName"
          value={editableProfileData?.lastName || ''}
          isEditing={isEditing}
          onChange={handleInputChange}
          readOnly={true}
        />
        <ProfileField
          label="Email"
          name="email"
          value={editableProfileData?.email || ''}
          isEditing={isEditing}
          onChange={handleInputChange}
          type="email"
          readOnly={true}
        />
        <ProfileField
          label="Phone Number"
          name="phoneNumber"
          value={editableProfileData?.phoneNumber || ''}
          isEditing={isEditing}
          onChange={handleInputChange}
          type="tel"
          readOnly={false}
          isInvalid={invalidFields.includes('phoneNumber')}
        />
        <ProfileField
          label="Employee ID"
          name="employeeId"
          value={editableProfileData?.employeeId || ''}
          isEditing={isEditing}
          onChange={handleInputChange}
          readOnly={false}
          isInvalid={invalidFields.includes('employeeId')}
        />
        <ProfileField
          label="Department"
          name="department"
          value={editableProfileData?.department || ''}
          isEditing={isEditing}
          onChange={handleInputChange}
          readOnly={true}
        />
        <ProfileField
          label="Account Type"
          name="accountType"
          value={editableProfileData?.accountType || ''}
          isEditing={isEditing}
          onChange={handleInputChange}
          readOnly={true}
        />
        <ProfileField
          label="Gender"
          name="gender"
          value={editableProfileData?.gender || ''}
          isEditing={isEditing}
          onChange={handleInputChange}
          type="select"
          options={['Male', 'Female', 'Other', 'Prefer not to say']}
          readOnly={false}
          isInvalid={invalidFields.includes('gender')}
        />
        <ProfileField
          label="Profile Created on"
          name="hiringDate"
          value={formatDate(profile.hiringDate)}
          isEditing={false}
          readOnly={true}
        />
      </div>

      <ConfirmationModal
        isOpen={showConfirmation}
        text1="Confirm Profile Update"
        text2="These values cannot be changed later without administrator approval. Are you sure you want to proceed?"
        btn1Text="Cancel"
        btn2Text="Confirm"
        btn1Handler={() => setShowConfirmation(false)}
        btn2Handler={handleSaveProfile}
      />
    </div>
  );
};

// Extracted and Modernized Field Component
const ProfileField = ({
  label,
  name,
  value,
  isEditing,
  onChange,
  type = 'text',
  readOnly = false,
  options = [],
  isInvalid = false,
}) => {
  const baseInputClasses = "w-full px-4 py-3 rounded-xl border bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all duration-200 shadow-sm";
  const borderColor = isInvalid ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-orange-500';

  return (
    <div className="flex flex-col gap-2 w-full">
      <label htmlFor={name} className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">
        {label}
      </label>
      {isEditing && !readOnly ? (
        type === 'select' ? (
          <select
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            className={`${baseInputClasses} ${borderColor}`}
          >
            <option value="" disabled hidden>
              Select {label}
            </option>
            {options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        ) : (
          <input
            id={name}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            className={`${baseInputClasses} ${borderColor}`}
            placeholder={`Enter ${label.toLowerCase()}`}
          />
        )
      ) : (
        <div className="w-full px-4 py-3 rounded-xl bg-gray-50/80 border border-gray-100 text-gray-800 text-sm font-medium shadow-sm transition-all duration-300">
          {value ? value : <span className="text-gray-400 italic">Not available</span>}
        </div>
      )}
      {isInvalid && isEditing && (
        <span className="text-xs text-red-500 font-medium ml-1">This field is required</span>
      )}
    </div>
  );
};

export default MyProfile;
