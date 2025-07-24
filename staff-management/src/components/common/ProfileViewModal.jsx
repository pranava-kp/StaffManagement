import React, { useState, useEffect, useCallback } from 'react';
import { getProfileByEmail, adminUpdateProfile } from '../../services/operations/profileAPI';
import { useSelector } from 'react-redux';
import { getTokenPayload } from '../../utils/jwtUtils';

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
  const baseClasses =
    'px-4 py-2 w-full bg-white border rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500';
  const borderColor = isInvalid ? 'border-red-500' : 'border-gray-300';

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-sm font-medium uppercase text-gray-600">
        {label}
      </label>
      {isEditing && !readOnly ? (
        type === 'select' ? (
          <select
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            className={`${baseClasses} ${borderColor}`}
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
            className={`${baseClasses} ${borderColor}`}
          />
        )
      ) : (
        <div className="px-4 py-2 min-w-[350px] bg-gray-300 border border-gray-300 rounded-md text-gray-700">
          {value || 'Not available'}
        </div>
      )}
      {isInvalid && isEditing && (
        <span className="text-xs text-red-600">This field is required</span>
      )}
    </div>
  );
};

const ProfileViewModal = ({ isOpen, onClose, profileEmail }) => {
  const { token } = useSelector((state) => state.auth);
  const [profile, setProfile] = useState(null);
  const [editableProfileData, setEditableProfileData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [invalidFields, setInvalidFields] = useState([]);
  const [loggedInUserAccountType, setLoggedInUserAccountType] = useState(null);
  const [currentEmail, setCurrentEmail] = useState(profileEmail);

  const departments = ["CSE", "ISE", "ME", "ECE"];
  const allRoles = ["HOD", "Admin", "Staff"];

  const availableRoles = () => {
    if (loggedInUserAccountType === "Principal") {
      return allRoles;
    } else if (loggedInUserAccountType === "HOD" || loggedInUserAccountType === "Admin") {
      return ["Admin", "Staff"];
    }
    return [];
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const fetchProfileData = useCallback(async (email) => {
    setLoading(true);
    try {
      const response = await getProfileByEmail(token, email);
      if (response.success) {
        setProfile(response.profileData);
        setEditableProfileData(response.profileData);
        setCurrentEmail(email); // Update current email
      } else {
        setError(response.message || "Failed to fetch profile data");
      }
    } catch (err) {
      setError(err.message || "An error occurred while fetching profile");
    } finally {
      setLoading(false);
    }
  }, [token]);

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

  const handleSave = async () => {
    // Validate all fields
    const requiredFields = ['firstName', 'lastName', 'email', 'employeeId', 'gender', 'phoneNumber', 'accountType', 'department'];
    const missingFields = requiredFields.filter(field => !editableProfileData[field]?.trim());
    
    if (missingFields.length > 0) {
      setInvalidFields(missingFields);
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editableProfileData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    setInvalidFields([]);
    setError(null);
    setLoading(true);
    try {
      // Make API call to update profile
      const response = await adminUpdateProfile(token, {
        id: editableProfileData.id,
        email: editableProfileData.email,
        firstName: editableProfileData.firstName,
        lastName: editableProfileData.lastName,
        accountType: editableProfileData.accountType,
        department: editableProfileData.department,
        employeeId: editableProfileData.employeeId,
        gender: editableProfileData.gender,
        phone: editableProfileData.phoneNumber || editableProfileData.phone,
      });

      if (response?.success) {
        setIsEditing(false);
        // Fetch using the new email if it was changed
        if (editableProfileData.email !== currentEmail) {
          await fetchProfileData(editableProfileData.email);
        } else {
          await fetchProfileData(currentEmail);
        }
      } else {
        setError(response?.message || "Failed to update profile");
      }
    } catch (err) {
      console.error("Update error:", err);
      setError(err.response?.data?.message || err.message || "An error occurred while updating profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && currentEmail && isOpen) {
      // Get logged in user's account type from token
      const rawToken = token.replace(/^"|"$/g, "");
      const userPayload = getTokenPayload(rawToken);
      if (userPayload) {
        setLoggedInUserAccountType(userPayload.accountType);
      }
      
      fetchProfileData(currentEmail);
    }
  }, [isOpen, currentEmail, token, fetchProfileData]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Profile Details</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {loading && !profile ? (
          <div className="text-center py-8">Loading profile...</div>
        ) : error ? (
          <div className="text-red-500 text-center py-8">{error}</div>
        ) : profile && editableProfileData ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ProfileField
                label="First Name"
                name="firstName"
                value={editableProfileData.firstName || ''}
                isEditing={isEditing}
                onChange={handleInputChange}
                readOnly={false}
                isInvalid={invalidFields.includes('firstName')}
              />
              <ProfileField
                label="Last Name"
                name="lastName"
                value={editableProfileData.lastName || ''}
                isEditing={isEditing}
                onChange={handleInputChange}
                readOnly={false}
                isInvalid={invalidFields.includes('lastName')}
              />
              <ProfileField
                label="Email"
                name="email"
                value={editableProfileData.email || ''}
                isEditing={isEditing}
                onChange={handleInputChange}
                type="email"
                readOnly={false}
                isInvalid={invalidFields.includes('email')}
              />
              <ProfileField
                label="Phone Number"
                name="phoneNumber"
                value={editableProfileData.phoneNumber || editableProfileData.phone || ''}
                isEditing={isEditing}
                onChange={handleInputChange}
                type="tel"
                readOnly={false}
                isInvalid={invalidFields.includes('phoneNumber') || invalidFields.includes('phone')}
              />
              <ProfileField
                label="Employee ID"
                name="employeeId"
                value={editableProfileData.employeeId || ''}
                isEditing={isEditing}
                onChange={handleInputChange}
                readOnly={false}
                isInvalid={invalidFields.includes('employeeId')}
              />
              <ProfileField
                label="Department"
                name="department"
                value={editableProfileData.department || ''}
                isEditing={isEditing}
                onChange={handleInputChange}
                type="select"
                options={departments}
                readOnly={false}
                isInvalid={invalidFields.includes('department')}
              />
              <ProfileField
                label="Account Type"
                name="accountType"
                value={editableProfileData.accountType || ''}
                isEditing={isEditing}
                onChange={handleInputChange}
                type="select"
                options={availableRoles()}
                readOnly={false}
                isInvalid={invalidFields.includes('accountType')}
              />
              <ProfileField
                label="Gender"
                name="gender"
                value={editableProfileData.gender || ''}
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

            <div className="flex justify-center mt-8">
              {!isEditing ? (
                <button
                  onClick={handleEditClick}
                  className="bg-[rgb(20,20,130)] text-white px-6 py-2 rounded-md hover:bg-[rgb(9,1,95)]"
                  disabled={loading}
                >
                  Edit Profile
                </button>
              ) : (
                <button
                  onClick={handleSave}
                  className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-8">No profile data available</div>
        )}
      </div>
    </div>
  );
};

export default ProfileViewModal;