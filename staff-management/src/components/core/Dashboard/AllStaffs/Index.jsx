import React, { useMemo, useEffect, useState,useRef } from 'react';
import { useSelector } from 'react-redux';
import { getAllProfiles } from '../../../../services/operations/profileAPI';
import { getTokenPayload } from '../../../../utils/jwtUtils';

const AllStaffs = () => {
  const departments = useMemo(() => ["CSE", "ISE", "ME", "ECE"], []);
  const { token } = useSelector(state => state.auth); 

  const [loggedInUserAccountType, setLoggedInUserAccountType] = useState(null);
  const [loggedInUserDepartment, setLoggedInUserDepartment] = useState(null);

  const [selectedDepartments, setSelectedDepartments] = useState([]); 
  const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false); 

  const [allProfiles, setAllProfiles] = useState([]);
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const [profileFetchError, setProfileFetchError] = useState(null);

  const [authDataReady, setAuthDataReady] = useState(false);

  const [initialFiltersSet, setInitialFiltersSet] = useState(false); 



  const departmentDropdownRef = useRef(null);

 
  useEffect(() => {
    if (token) {
      const rawToken = token.replace(/^"|"$/g, ""); 
      const userPayload = getTokenPayload(rawToken);

      if (userPayload) {
        setLoggedInUserAccountType(userPayload.accountType);
        setLoggedInUserDepartment(userPayload.department || null); 
        setAuthDataReady(true);

  
        if (!initialFiltersSet) { 
          if (userPayload.accountType === "Admin" || userPayload.accountType === "HOD") {
            setSelectedDepartments(userPayload.department ? [userPayload.department] : []);
          } else if (userPayload.accountType === "Principal") {
            setSelectedDepartments([]); 
          }
          setInitialFiltersSet(true);
        }
  

      } else {
        setAuthDataReady(false);
        setProfileFetchError("Invalid token payload. Please log in again.");
      }
    } else {
      setAuthDataReady(false);
      setProfileFetchError("Authentication token missing. Please log in.");
    }
  }, [token, initialFiltersSet]); 
  

  
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
      const userTypesToFetch = ["Staff"];

     
      if (loggedInUserAccountType === "Admin" || loggedInUserAccountType === "HOD") {
        departmentsToFetch = loggedInUserDepartment ? [loggedInUserDepartment] : [];
      } else if (loggedInUserAccountType === "Principal") {
        if (selectedDepartments.length === 0) {
          departmentsToFetch = departments;
        } else {
          departmentsToFetch = selectedDepartments; 
        }
      } 

     
      if (departmentsToFetch.length === 0 && loggedInUserAccountType !== "Principal") {
        setProfileFetchError("Department information missing for your role.");
        setLoadingProfiles(false);
        return;
      }

      try {
        const response = await getAllProfiles(token, {
          departments: departmentsToFetch,
          userTypes: userTypesToFetch,
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
  }, [authDataReady, token, loggedInUserAccountType, loggedInUserDepartment, selectedDepartments, departments]); // Simplified dependencies

  const handleDepartmentCheckboxChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setSelectedDepartments(prev => [...prev, value]);
    } else {
      setSelectedDepartments(prev => prev.filter(dept => dept !== value));
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (departmentDropdownRef.current && !departmentDropdownRef.current.contains(event.target)) {
        setShowDepartmentDropdown(false);
      }
    };

    if (showDepartmentDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDepartmentDropdown]);


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
    
        <div className="flex flex-col gap-1 min-w-[200px]">
          <label className="text-sm font-medium text-gray-700">Department:</label> 
          {(loggedInUserAccountType === "Admin" || loggedInUserAccountType === "HOD") ? (
            <input
              type="text"
              id="department-display" 
              value={loggedInUserDepartment || "N/A"}
              className="px-3 py-2 border border-gray-300 rounded-md bg-gray-200 text-gray-700 font-semibold cursor-not-allowed"
              disabled
            />
          ) : ( 
            <div className="relative" ref={departmentDropdownRef}>
              <div
                className="flex justify-between items-center block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white cursor-pointer focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                onClick={() => setShowDepartmentDropdown(prev => !prev)}
              >
                {selectedDepartments.length === 0
                  ? "All Departments" 
                  : selectedDepartments.join(", ")
                }
               
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-4 w-4 transform transition-transform duration-200 ${showDepartmentDropdown ? 'rotate-180' : 'rotate-0'}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
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

        <div className="flex flex-col gap-1 min-w-[200px]">
          <label className="text-sm font-medium text-gray-700">Role:</label> 
          <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-200 text-gray-700 font-semibold">
            {loggedInUserAccountType || "N/A"}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"> 
            {allProfiles.map((profile) => (
              <div key={profile._id || profile.email} className="bg-gray-50 border border-gray-200 rounded-lg shadow-md p-4 flex flex-col justify-between">
               
                <p className="text-base font-semibold text-gray-900 mb-4">{profile.firstName} {profile.lastName}</p> {/* Reduced font size and increased margin-bottom */}
                
                <div className="flex justify-between items-end text-sm">
               
                  <p className="text-gray-700">Dept: {profile.department}</p>
                  
                  <p className="text-gray-700 font-medium">{profile.accountType}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllStaffs;
