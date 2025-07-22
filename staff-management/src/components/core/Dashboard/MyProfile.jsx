import React, { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { getProfileData, updateProfileData } from '../../../services/operations/profileAPI';
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
        phoneNumber: editableProfileData.phoneNumber,
      };

      const response = await updateProfileData(token, dataToUpdate);
      if (response.success) {
        await fetchProfile(); // Full refresh after update
        setIsEditing(false);
        setHasNullValues(false);
      }
    } catch (err) {
      console.error(err.message || 'Failed to update profile.');
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
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            disabled={loading}
          >
            Edit Profile
          </button>
        )}
        {isEditing && (
          <button
            onClick={handlePreSaveValidation}
            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mx-[10%]">
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

export default MyProfile;
