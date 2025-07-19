import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { getProfileData, updateProfileData } from '../../../services/operations/profileAPI';
import ConfirmationModal from '../../common/ConfirmationModal'; // Path to your modal

const MyProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editableProfileData, setEditableProfileData] = useState(null);
  const { token } = useSelector(state => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [hasNullValues, setHasNullValues] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return "Not available";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).replace(/(\d+)\s(\w+)\s(\d+)/, '$1 $2 $3');
  };

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getProfileData(token);
        if (response.success) {
          setProfile(response.profileData);
          setEditableProfileData(response.profileData);

          const nullFields = [
            response.profileData.employeeId,
            response.profileData.gender,
            response.profileData.phoneNumber
          ].some(field => !field);

          setHasNullValues(nullFields);
        }
      } catch (err) {
        setError(err.message || "Failed to fetch profile");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchProfile();
    } else {
      setError("No authentication token found");
      setLoading(false);
    }
  }, [token]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditableProfileData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveProfile = async () => {
    setShowConfirmation(false);
    setLoading(true);
    try {
      const dataToUpdate = {
        employeeId: editableProfileData.employeeId,
        gender: editableProfileData.gender,
        phoneNumber: editableProfileData.phoneNumber,
      };

      const response = await updateProfileData(token, dataToUpdate);

      if (response.success) {
        const updatedProfile = {
          ...profile,
          ...response.updatedProfile,
          phoneNumber: response.updatedProfile.phoneNumber
        };

        setProfile(updatedProfile);
        setEditableProfileData(updatedProfile);
        setIsEditing(false);
        setHasNullValues(false);
        // toast.success("Profile updated successfully!");
      }
    } catch (err) {
      toast.error(err.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-4 text-center">Loading profile...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;
  if (!profile) return <div className="p-4">No profile data available</div>;

  return (
    <div className="flex flex-col border bg-gray-100 gap-8 w-full rounded-md p-6 relative">
      <div className="flex justify-between items-center border-b-2 w-full p-3 border-gray-300">
        <p className="text-xl font-semibold">My Profile</p>
        {!isEditing && hasNullValues && (
          <button
            onClick={handleEditClick}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors duration-200"
            disabled={loading}
          >
            Edit Profile
          </button>
        )}
        {isEditing && (
          <button
            onClick={() => setShowConfirmation(true)}
            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors duration-200"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        )}
      </div>

      <div className="flex flex-col gap-4 pb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mx-[10%]">
          <ProfileField
            label="First Name"
            name="firstName"
            value={isEditing ? (editableProfileData?.firstName || '') : (profile.firstName || '')}
            isEditing={isEditing}
            onChange={handleInputChange}
            readOnly={true}
          />
          <ProfileField
            label="Last Name"
            name="lastName"
            value={isEditing ? (editableProfileData?.lastName || '') : (profile.lastName || '')}
            isEditing={isEditing}
            onChange={handleInputChange}
            readOnly={true}
          />
          <ProfileField
            label="Email"
            name="email"
            value={isEditing ? (editableProfileData?.email || '') : (profile.email || '')}
            isEditing={isEditing}
            onChange={handleInputChange}
            type="email"
            readOnly={true}
          />
          <ProfileField
            label="Phone"
            name="phoneNumber"
            value={isEditing ? (editableProfileData?.phoneNumber || '') : (profile.phoneNumber || 'Not provided')}
            isEditing={isEditing}
            onChange={handleInputChange}
            type="tel"
            readOnly={false}
          />
          <ProfileField
            label="Employee ID"
            name="employeeId"
            value={isEditing ? (editableProfileData?.employeeId || '') : (profile.employeeId || '')}
            isEditing={isEditing}
            onChange={handleInputChange}
            readOnly={false}
          />
          <ProfileField
            label="Department"
            name="department"
            value={isEditing ? (editableProfileData?.department || '') : (profile.department || 'Not provided')}
            isEditing={isEditing}
            onChange={handleInputChange}
            readOnly={true}
          />
          <ProfileField
            label="Account Type"
            name="accountType"
            value={isEditing ? (editableProfileData?.accountType || '') : (profile.accountType || '')}
            isEditing={isEditing}
            onChange={handleInputChange}
            readOnly={true}
          />
          <ProfileField
            label="Gender"
            name="gender"
            value={isEditing ? (editableProfileData?.gender || '') : (profile.gender || 'Not provided')}
            isEditing={isEditing}
            onChange={handleInputChange}
            type="select"
            options={["Male", "Female", "Other", "Prefer not to say"]}
            readOnly={false}
          />
          <ProfileField
            label="Profile Created on"
            name="hiringDate"
            value={formatDate(profile.hiringDate)}
            isEditing={false}
            readOnly={true}
          />
        </div>
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

// Original ProfileField component format
const ProfileField = ({ label, name, value, isEditing, onChange, type = "text", readOnly = false, options = [] }) => (
  <div className="flex flex-col gap-1">
    <label htmlFor={name} className="text-sm font-medium uppercase text-gray-600">
      {label}
    </label>
    {isEditing && !readOnly ? (
      type === "select" ? (
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          className="px-4 py-2 w-full bg-white border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="" disabled>Select {label}</option>
          {options.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          className="px-4 py-2 w-full bg-white border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      )
    ) : (
      <div className="px-4 py-2 min-w-[350px] bg-gray-300 border border-gray-300 rounded-md text-gray-700">
        {value || "Not available"}
      </div>
    )}
  </div>
);

export default MyProfile;