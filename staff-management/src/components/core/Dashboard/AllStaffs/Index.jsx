import React, { useMemo, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getAllProfiles } from '../../../../services/operations/profileAPI';
import { getTokenPayload } from '../../../../utils/jwtUtils';

const AllStaffs = () => {
  const departments = useMemo(() => ["CSE", "ISE", "ME", "ECE"], []); 
  const { token } = useSelector(state => state.auth); 

  const [loggedInUserAccountType, setLoggedInUserAccountType] = useState(null);
  const [loggedInUserDepartment, setLoggedInUserDepartment] = useState(null);

  const [selectedDepartments, setSelectedDepartments] = useState([]); 
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false); 
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  const [allProfiles, setAllProfiles] = useState([]);
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const [profileFetchError, setProfileFetchError] = useState(null);
  const [authDataReady, setAuthDataReady] = useState(false);

  const availableRoles = useMemo(() => {
    if (loggedInUserAccountType === "Principal") {
      return ["HOD", "Admin", "Staff"];
    } else if (loggedInUserAccountType === "Admin" || loggedInUserAccountType === "HOD") {
      return ["Admin", "Staff"];
    }
    return [];
  }, [loggedInUserAccountType]);

  useEffect(() => {
    if (token) {
      const rawToken = token.replace(/^"|"$/g, ""); 
      const userPayload = getTokenPayload(rawToken);

      if (userPayload) {
        setLoggedInUserAccountType(userPayload.accountType);
        setLoggedInUserDepartment(userPayload.department || null); 
        setAuthDataReady(true);

        // Set initial department selection based on role
        if (userPayload.accountType === "Admin" || userPayload.accountType === "HOD") {
          setSelectedDepartments(userPayload.department ? [userPayload.department] : []);
        } else if (userPayload.accountType === "Principal") {
          setSelectedDepartments([]);
        }

        // Set initial role selection - empty array means "all roles"
        setSelectedRoles([]);
      } else {
        setAuthDataReady(false);
        setProfileFetchError("Invalid token payload. Please log in again.");
      }
    } else {
      setAuthDataReady(false);
      setProfileFetchError("Authentication token missing. Please log in.");
    }
  }, [token]);

  const arraysEqual = (a, b) => {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; ++i) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  };

  useEffect(() => {
    const fetchProfiles = async () => {
      if (!authDataReady) {
        setLoadingProfiles(false); 
        return;
      }

      if (loggedInUserAccountType === "Staff") {
        setProfileFetchError("You do not have permission to view this page.");
        setLoadingProfiles(false);
        return;
      }

      setLoadingProfiles(true);
      setProfileFetchError(null); 
      
      let departmentsToFetch = [];
      let rolesToFetch = [];

      // Department logic
      if (loggedInUserAccountType === "Admin" || loggedInUserAccountType === "HOD") {
        departmentsToFetch = loggedInUserDepartment ? [loggedInUserDepartment] : [];
      } else if (loggedInUserAccountType === "Principal") {
        departmentsToFetch = selectedDepartments.length > 0 ? selectedDepartments : departments;
      }

      // Role logic - if no roles selected, use all available roles
      rolesToFetch = selectedRoles.length > 0 ? selectedRoles : availableRoles;

      if (departmentsToFetch.length === 0) {
        setProfileFetchError("Department information missing for your role.");
        setLoadingProfiles(false);
        return;
      }

      try {
        const response = await getAllProfiles(token, {
          departments: departmentsToFetch,
          userTypes: rolesToFetch,
        });

        if (response.success) {
          setAllProfiles(Array.isArray(response.profiles) ? response.profiles : [response.profiles]);
          setProfileFetchError(null); 
        } else {
          setProfileFetchError(response.message || "Failed to fetch profiles due to API response.");
        }
      } catch (error) {
        setProfileFetchError(error.message || "An unexpected error occurred while fetching profiles.");
      } finally {
        setLoadingProfiles(false);
      }
    };

    fetchProfiles();
  }, [authDataReady, token, loggedInUserAccountType, loggedInUserDepartment, selectedDepartments, selectedRoles, departments, availableRoles]);

  const handleDepartmentCheckboxChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setSelectedDepartments(prev => [...prev, value]);
    } else {
      setSelectedDepartments(prev => prev.filter(dept => dept !== value));
    }
  };

  const handleRoleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setSelectedRoles(prev => [...prev, value]);
    } else {
      setSelectedRoles(prev => prev.filter(role => role !== value));
    }
  };

  if (loggedInUserAccountType === "Staff") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] bg-gray-100 p-6 rounded-md shadow-lg">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
        <p className="text-gray-700">You do not have the necessary permissions to view this page.</p>
      </div>
    );
  }

  if (!authDataReady) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] bg-gray-100 p-6 rounded-md shadow-lg">
        <h2 className="text-2xl font-bold text-blue-600 mb-4">Loading User Data...</h2>
        <p className="text-gray-700">Please wait while we load your profile information.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col border bg-gray-100 gap-8 w-full rounded-md p-6">
      <p className="border-b-2 w-full p-3 border-gray-300 text-xl font-semibold">All Staff Profiles</p>

      <div className="flex flex-wrap gap-4 p-4 bg-white rounded-md shadow-sm items-center">
        {/* Department Dropdown */}
        <div className="flex flex-col gap-1 min-w-[200px]">
          <label className="text-sm font-medium text-gray-700">Department:</label> 
          <div className="relative">
            <div
              className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm cursor-pointer focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                (loggedInUserAccountType === "Admin" || loggedInUserAccountType === "HOD") 
                  ? "bg-gray-200 text-gray-700 cursor-not-allowed" 
                  : "bg-white"
              }`}
              onClick={() => {
                if (!(loggedInUserAccountType === "Admin" || loggedInUserAccountType === "HOD")) {
                  setShowDepartmentDropdown(prev => !prev);
                }
              }}
            >
              {(loggedInUserAccountType === "Admin" || loggedInUserAccountType === "HOD") 
                ? loggedInUserDepartment || "N/A"
                : selectedDepartments.length === 0
                  ? "All Departments" 
                  : selectedDepartments.join(", ")
              }
            </div>
            {showDepartmentDropdown && !(loggedInUserAccountType === "Admin" || loggedInUserAccountType === "HOD") && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                {departments.map(dept => (
                  <label key={dept} className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer">
                    <input
                      type="checkbox"
                      value={dept}
                      checked={selectedDepartments.includes(dept)}
                      onChange={handleDepartmentCheckboxChange}
                      className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-gray-700">{dept}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Role Dropdown */}
        <div className="flex flex-col gap-1 min-w-[200px]">
          <label className="text-sm font-medium text-gray-700">Role:</label>
          <div className="relative">
            <div
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white cursor-pointer focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              onClick={() => setShowRoleDropdown(prev => !prev)}
            >
              {selectedRoles.length === 0 
                ? "All Roles" 
                : selectedRoles.join(", ")
              }
            </div>
            {showRoleDropdown && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                {availableRoles.map(role => (
                  <label key={role} className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer">
                    <input
                      type="checkbox"
                      value={role}
                      checked={selectedRoles.includes(role)}
                      onChange={handleRoleCheckboxChange}
                      className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-gray-700">{role}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
  
      <div className="p-4 bg-white rounded-md shadow-sm">
        {loadingProfiles ? (
          <div className="text-center text-blue-600">Loading profiles...</div>
        ) : profileFetchError ? (
          <div className="text-center text-red-500">Error: {profileFetchError}</div>
        ) : allProfiles.length === 0 ? (
          <div className="text-center text-gray-600">No profiles found matching the criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    First Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Account Type
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {allProfiles.map((profile) => (
                  <tr key={profile._id || profile.email}> 
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {profile.firstName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {profile.lastName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {profile.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {profile.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {profile.accountType}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllStaffs;