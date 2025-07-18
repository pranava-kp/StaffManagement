import React, { useEffect, useState } from 'react';
import { getProfileData } from '../../../services/operations/profileAPI';
import { useSelector } from 'react-redux';

const MyProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useSelector(state => state.auth);
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).replace(/(\d+)\/(\w+)\/(\d+)/, '$1 $2 $3');
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getProfileData(token);
        if (response.success) {
          setProfile(response.profileData);
        } else {
          setError("Failed to load profile data");
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

  if (loading) return <div className="p-4 text-center">Loading profile...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;
  if (!profile) return <div className="p-4">No profile data available</div>;

  return (
    <div className="flex flex-col border bg-gray-100 gap-8 w-full rounded-md p-6">
      <p className="border-b-2 w-full p-3 border-gray-300 text-xl font-semibold">My Profile</p>
      
      <div className="flex flex-col gap-4 pb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mx-[10%]">
          <ProfileField label="First Name" value={profile.firstName} />
          <ProfileField label="Last Name" value={profile.lastName} />
          <ProfileField label="Email" value={profile.email} />
          <ProfileField label="Phone" value={profile.phoneNumber || "Not provided"} />
          <ProfileField label="Employee ID" value={profile.employeeId} />
          <ProfileField label="Department" value={profile.department} />
          <ProfileField label="Account Type" value={profile.accountType} />
          <ProfileField
            label="Profile Created on"
            value={profile.hiringDate ? formatDate(profile.hiringDate) : "Not available"}
          />
        </div>
      </div>
    </div>
  );
};

const ProfileField = ({ label, value }) => (
  <div className="flex flex-col gap-1">
    <label htmlFor={label} className="text-sm font-medium uppercase text-gray-600">
      {label}
    </label>
    <div className="px-4 py-2 min-w-[350px] bg-gray-300 border border-gray-300 rounded-md text-gray-700">
      {value || "Not available"}
    </div>
  </div>
);

export default MyProfile;