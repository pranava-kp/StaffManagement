import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';

// --- Original imports for apiConnector and endpoints ---
// Ensure these paths are correct in your project structure
import { apiConnector } from '../../../services/apiConnector';
import { endpoints } from '../../../services/apis';
// --- End Original imports ---

// Importing getProfileData and updateProfileData from your existing operations file
import { getProfileData, updateProfileData } from '../../../services/operations/profileAPI';


const MyProfile = () => {
  const [profile, setProfile] = useState(null); // Stores the original profile data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editableProfileData, setEditableProfileData] = useState(null); // Stores data being edited
  const { token } = useSelector(state => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  
  const formatDate = (dateString) => {
    if (!dateString) return "Not available"; // Handle case where dateString might be null/undefined
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).replace(/(\d+)\s(\w+)\s(\d+)/, '$1 $2 $3'); // Ensure consistent format with spaces
  };

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getProfileData(token);
        if (response.success) {
          setProfile(response.profileData);
          // Initialize editableProfileData with fetched profile data
          setEditableProfileData(response.profileData); 
        } else {
          setError(response.message || "Failed to load profile data");
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

  // Handle changes in editable fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditableProfileData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle "Edit Profile" button click
  const handleEditClick = () => {
    setIsEditing(true);
  };

  // Handle "Cancel" button click
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditableProfileData(profile); // Revert changes to original profile data
  };

  // Handle "Save Changes" button click
  const handleSaveProfile = async () => {
    setLoading(true); // Set loading state for the save operation
    try {
      // Send only the editable fields to the backend to avoid sending unnecessary data
      const dataToUpdate = {
        employeeId: editableProfileData.employeeId,
        gender: editableProfileData.gender,
        phone: editableProfileData.phoneNumber, // Ensure this matches backend's 'phone' field name
      };

      const response = await updateProfileData(token, dataToUpdate);
      
      if (response.success) {
        // Backend returns { success: true, data: { email, updatedFields: { employeeId, phone, gender } } }
        // We need to merge updatedFields into the existing profile
        const newProfile = {
          ...profile, // Start with the current full profile
          ...response.updatedProfile.updatedFields, // Overlay the updated fields
          email: response.updatedProfile.email // Ensure email is also updated if backend sends it
        };

        setProfile(newProfile); // Update the main profile state with merged data
        setEditableProfileData(newProfile); // Also update editable data
        setIsEditing(false); // Exit edit mode
        toast.success("Profile updated successfully!"); // Show success toast here
      } else {
        // This 'else' block might be redundant if updateProfileData throws an error on failure
        // but kept for safety if updateProfileData returns { success: false, message: ... }
        toast.error(response.message || "Failed to update profile.");
      }
    } catch (err) {
      // This catch block will now receive errors thrown from updateProfileData
      toast.error(err.message || "Failed to update profile.");
    } finally {
      setLoading(false); // Reset loading state
    }
  };


  if (loading) return <div className="p-4 text-center">Loading profile...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;
  if (!profile) return <div className="p-4">No profile data available</div>;

  return (
    <div className="flex flex-col border bg-gray-100 gap-8 w-full rounded-md p-6 relative">
      <div className="flex justify-between items-center border-b-2 w-full p-3 border-gray-300">
        <p className="text-xl font-semibold">My Profile</p>
        {!isEditing ? (
          <button
            onClick={handleEditClick}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors duration-200"
            disabled={loading}
          >
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleSaveProfile} // Re-enabled onClick
              className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors duration-200"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
            <button
              onClick={handleCancelEdit}
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors duration-200"
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4 pb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mx-[10%]">
          {/* Profile Fields - Only employeeId, gender, phone are editable */}
          <ProfileField
            label="First Name"
            name="firstName"
            value={isEditing ? (editableProfileData?.firstName || '') : (profile.firstName || '')}
            isEditing={isEditing}
            onChange={handleInputChange}
            readOnly={true} // Not editable
          />
          <ProfileField
            label="Last Name"
            name="lastName"
            value={isEditing ? (editableProfileData?.lastName || '') : (profile.lastName || '')}
            isEditing={isEditing}
            onChange={handleInputChange}
            readOnly={true} // Not editable
          />
          <ProfileField
            label="Email"
            name="email"
            value={isEditing ? (editableProfileData?.email || '') : (profile.email || '')}
            isEditing={isEditing}
            onChange={handleInputChange}
            type="email"
            readOnly={true} // Not editable
          />
          <ProfileField
            label="Phone"
            name="phoneNumber" // Frontend uses phoneNumber, backend expects 'phone'
            value={isEditing ? (editableProfileData?.phoneNumber || '') : (profile.phoneNumber || "")}
            isEditing={isEditing}
            onChange={handleInputChange}
            type="tel"
            readOnly={false} // Editable
          />
          <ProfileField
            label="Employee ID"
            name="employeeId"
            value={isEditing ? (editableProfileData?.employeeId || '') : (profile.employeeId || '')}
            isEditing={isEditing}
            onChange={handleInputChange}
            readOnly={false} // Editable
          />
          <ProfileField
            label="Department"
            name="department"
            value={isEditing ? (editableProfileData?.department || '') : (profile.department || '')}
            isEditing={isEditing}
            onChange={handleInputChange}
            readOnly={true} // Not editable
          />
          <ProfileField
            label="Account Type"
            name="accountType"
            value={isEditing ? (editableProfileData?.accountType || '') : (profile.accountType || '')}
            isEditing={isEditing}
            onChange={handleInputChange}
            readOnly={true} // Not editable
          />
          {/* New Gender Field */}
          <ProfileField
            label="Gender"
            name="gender"
            value={isEditing ? (editableProfileData?.gender || '') : (profile.gender || '')}
            isEditing={isEditing}
            onChange={handleInputChange}
            type="select" // Use 'select' type for dropdown
            options={["Male", "Female", "Other", "Prefer not to say"]} // Options for the dropdown
            readOnly={false} // Editable
          />
          <ProfileField
            label="Profile Created on"
            name="hiringDate"
            value={formatDate(profile.hiringDate)}
            isEditing={false} // Always display, never editable
            readOnly={true}
          />
        </div>
      </div>
    </div>
  );
};

// ProfileField component - renders input, select, or div based on props
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
