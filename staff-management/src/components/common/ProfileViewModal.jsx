import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';

const ProfileViewModal = ({ profile, onClose, onEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({ ...profile });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [accountTypeOptions, setAccountTypeOptions] = useState(['Admin', 'Staff']);
  const navigate = useNavigate();

  const genderOptions = [
    'Male',
    'Female',
    'Other',
    'Prefer not to say'
  ];

  const departmentOptions = [
    'CSE',
    'ISE',
    'ME',
    'ECE'
  ];

  useEffect(() => {
    // Check if user is Principal and add HOD option if true
    const token = Cookies.get('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.accountType === 'Principal') {
          setAccountTypeOptions(['Admin', 'Staff', 'HOD']);
        }
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleInputChange = (field, value) => {
    setEditedProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTokenExpiration = () => {
    Cookies.remove('token');
    navigate('/login');
  };

  const handleSave = async () => {
    setIsLoading(true);
    setError('');
    try {
      const token = Cookies.get('token');
      if (!token) {
        throw new Error('Authentication token not found. Please login again.');
      }

      // Verify token is still valid
      try {
        jwtDecode(token);
      } catch (error) {
        handleTokenExpiration();
        throw new Error('Session expired. Please login again.');
      }

      const response = await fetch('http://localhost:2000/api/v1/admin-update-profile', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: profile._id,
          email: editedProfile.email,
          firstName: editedProfile.firstName,
          lastName: editedProfile.lastName,
          accountType: editedProfile.accountType,
          department: editedProfile.department,
          employeeId: editedProfile.employeeId,
          gender: editedProfile.gender,
          phone: editedProfile.phone
        })
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          handleTokenExpiration();
          throw new Error('Session expired. Please login again.');
        }
        throw new Error(data.message || 'Failed to update profile');
      }

      onEdit(data.data);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = () => {
    if (isEditing) {
      handleSave();
    } else {
      setIsEditing(true);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
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

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ProfileField 
            label="First Name" 
            value={isEditing ? editedProfile.firstName : profile?.firstName} 
            isEditing={isEditing}
            onChange={(value) => handleInputChange('firstName', value)}
          />
          <ProfileField 
            label="Last Name" 
            value={isEditing ? editedProfile.lastName : profile?.lastName} 
            isEditing={isEditing}
            onChange={(value) => handleInputChange('lastName', value)}
          />
          <ProfileField 
            label="Email" 
            value={isEditing ? editedProfile.email : profile?.email} 
            isEditing={isEditing}
            onChange={(value) => handleInputChange('email', value)}
          />
          <ProfileField 
            label="Phone Number" 
            value={isEditing ? editedProfile.phone : profile?.phone} 
            isEditing={isEditing}
            onChange={(value) => handleInputChange('phone', value)}
          />
          <ProfileField 
            label="Employee ID" 
            value={isEditing ? editedProfile.employeeId : profile?.employeeId} 
            isEditing={isEditing}
            onChange={(value) => handleInputChange('employeeId', value)}
          />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium uppercase text-gray-600">
              Department
            </label>
            {isEditing ? (
              <div className="relative">
                <select
                  value={editedProfile.department || ''}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none w-full"
                >
                  {departmentOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="fill-current h-4 w-4 transform transition-transform duration-200" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            ) : (
              <div className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700">
                {profile?.department || 'Not available'}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium uppercase text-gray-600">
              Account Type
            </label>
            {isEditing ? (
              <div className="relative">
                <select
                  value={editedProfile.accountType || ''}
                  onChange={(e) => handleInputChange('accountType', e.target.value)}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none w-full"
                >
                  {accountTypeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="fill-current h-4 w-4 transform transition-transform duration-200" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            ) : (
              <div className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700">
                {profile?.accountType || 'Not available'}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium uppercase text-gray-600">
              Gender
            </label>
            {isEditing ? (
              <div className="relative">
                <select
                  value={editedProfile.gender || ''}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none w-full"
                >
                  <option value="" disabled hidden>Select Gender</option>
                  {genderOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="fill-current h-4 w-4 transform transition-transform duration-200" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            ) : (
              <div className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700">
                {profile?.gender || 'Not available'}
              </div>
            )}
          </div>
          <ProfileField 
            label="Profile Created on" 
            value={formatDate(profile?.hiringDate)} 
            isEditing={false}
          />
        </div>

        <div className="mt-6 flex justify-center">
          <button
            onClick={handleEditClick}
            disabled={isLoading}
            className="bg-[rgb(20,20,130)] text-white px-6 py-2 rounded-md hover:bg-[rgb(9,1,95)] disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : (isEditing ? 'Save' : 'Edit Profile')}
          </button>
        </div>
      </div>
    </div>
  );
};

const ProfileField = ({ label, value, isEditing, onChange }) => {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium uppercase text-gray-600">
        {label}
      </label>
      {isEditing ? (
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      ) : (
        <div className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700">
          {value || 'Not available'}
        </div>
      )}
    </div>
  );
};

export default ProfileViewModal;