import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getAllProfiles } from '../../../../services/operations/profileAPI';
import ConfirmationModal from '../../../common/ConfirmationModal';

const AllStaffs = () => {
  const departments = ["CSE", "ISE", "ME", "ECE"];
  const userTypes = ["Admin", "HOD", "Principal"]; 
  const { token, user } = useSelector(state => state.auth);
  const loggedInUserAccountType = user?.accountType;
  const loggedInUserDepartment = user?.department;
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [selectedUserType, setSelectedUserType] = useState("");
  const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false); 
  const [allProfiles, setAllProfiles] = useState([]);
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const [profileFetchError, setProfileFetchError] = useState(null);

  useEffect(() => {
    if (loggedInUserAccountType) {
      if (loggedInUserAccountType === "Admin" || loggedInUserAccountType === "HOD") {
        
        setSelectedDepartments(loggedInUserDepartment ? [loggedInUserDepartment] : []);
      } else if (loggedInUserAccountType === "Principal") {
       
        setSelectedDepartments([]);
      }

      if (loggedInUserAccountType === "HOD") {
       
        setSelectedUserType("Staff"); 
      } else {
        
        setSelectedUserType("Admin"); 
      }
    }
  }, [loggedInUserAccountType, loggedInUserDepartment]);

  useEffect(() => {
    const fetchProfiles = async () => {
      if (!token || !loggedInUserAccountType) {
        setProfileFetchError("Authentication token or user type missing.");
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
      let userTypesToFetch = [];

      
      if (loggedInUserAccountType === "Admin") {
        departmentsToFetch = loggedInUserDepartment ? [loggedInUserDepartment] : [];
        userTypesToFetch = selectedUserType ? [selectedUserType] : userTypes; 
      } else if (loggedInUserAccountType === "Principal") {
        
        if (selectedDepartments.length === 0) {
          departmentsToFetch = departments; 
        } else {
          departmentsToFetch = selectedDepartments;
        }
        userTypesToFetch = selectedUserType ? [selectedUserType] : userTypes;  
      } else if (loggedInUserAccountType === "HOD") {
        departmentsToFetch = loggedInUserDepartment ? [loggedInUserDepartment] : [];
        userTypesToFetch = ["Staff"]; 
      } 

      if (departmentsToFetch.length === 0 && loggedInUserAccountType !== "Principal") {
      
        setProfileFetchError("Department information missing for your role.");
        setLoadingProfiles(false);
        return;
      }

      const response = await getAllProfiles(token, {
        departments: departmentsToFetch,
        userTypes: userTypesToFetch,
      });

      if (response.success) {
        
        setAllProfiles(Array.isArray(response.profiles) ? response.profiles : [response.profiles]);
      } else {
        setProfileFetchError(response.message);
      }
      setLoadingProfiles(false);
    };

    
    fetchProfiles();
  }, [token, loggedInUserAccountType, loggedInUserDepartment, selectedDepartments, selectedUserType]);

  const handleDepartmentCheckboxChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setSelectedDepartments(prev => [...prev, value]);
    } else {
      setSelectedDepartments(prev => prev.filter(dept => dept !== value));
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

  return (
    <div className="flex flex-col border bg-gray-100 gap-8 w-full rounded-md p-6">
      <p className="border-b-2 w-full p-3 border-gray-300 text-xl font-semibold">All Staff Profiles</p>

      {/* Filter Section */}
      <div className="flex flex-wrap gap-4 p-4 bg-white rounded-md shadow-sm">
        {/* Department Dropdown */}
        <div className="flex flex-col gap-1 min-w-[200px]">
          <label htmlFor="department-select" className="text-sm font-medium text-gray-700">Department:</label>
          {(loggedInUserAccountType === "Admin" || loggedInUserAccountType === "HOD") ? (
            <input
              type="text"
              id="department-select"
              value={loggedInUserDepartment || "N/A"}
              className="px-3 py-2 border border-gray-300 rounded-md bg-gray-200 text-gray-700 cursor-not-allowed"
              disabled
            />
          ) : ( // Principal's multi-select department with checkboxes
            <div className="relative">
              <div
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white cursor-pointer focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                onClick={() => setShowDepartmentDropdown(prev => !prev)}
              >
                {selectedDepartments.length === 0
                  ? "Select Departments (All if none)"
                  : selectedDepartments.join(", ")
                }
              </div>
              {showDepartmentDropdown && (
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
          )}
        </div>

        {/* User Type Dropdown */}
        <div className="flex flex-col gap-1 min-w-[200px]">
          <label htmlFor="user-type-select" className="text-sm font-medium text-gray-700">User Type:</label>
          <select
            id="user-type-select"
            value={selectedUserType}
            onChange={(e) => setSelectedUserType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            disabled={loggedInUserAccountType === "HOD"} // HOD's user type is fixed
          >
            <option value="">Select User Type</option>
            {/* Filter out "Staff" from the dropdown options */}
            {userTypes.filter(type => type !== "Staff").map(type => ( 
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Profile List Section */}
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
                  {/* Add more headers as needed */}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {allProfiles.map((profile) => (
                  <tr key={profile._id || profile.email}> {/* Use a unique ID from your profile data */}
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
                    {/* Add more data cells as needed */}
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