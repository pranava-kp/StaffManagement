// this is addstaff.jsx
import React, { useEffect, useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { getTokenPayload } from "../../../../utils/jwtUtils";
import { addUser } from "../../../../services/operations/authAPI";
import toast from "react-hot-toast";

const AddStaff = () => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    department: "",
    accountType: ""
  });

  const [isDeptDisabled, setIsDeptDisabled] = useState(false);
  const [availableRoles, setAvailableRoles] = useState([]);
  const DEPARTMENTS = ["CSE", "ISE", "ECE", "ME"];

  const departmentDropdownRef = useRef(null);
  const roleDropdownRef = useRef(null);

  useEffect(() => {
    const rawToken = localStorage.getItem("token")?.replace(/^"|"$/g, "");
    if (!rawToken) return;

    const user = getTokenPayload(rawToken);
    if (!user) return;

    const role = user.accountType;
    const deptFromUser = user.department || "";

    switch (role) {
      case "Principal":
        setIsDeptDisabled(false);
        setAvailableRoles(["Admin", "HOD", "Staff"]);
        break;
      case "Admin":
        setIsDeptDisabled(true);
        setFormData(prev => ({ ...prev, department: deptFromUser }));
        setAvailableRoles(["Staff"]);
        break;
      case "HOD":
        setIsDeptDisabled(true);
        setFormData(prev => ({ ...prev, department: deptFromUser }));
        setAvailableRoles(["Admin", "Staff"]);
        break;
      default:
        setIsDeptDisabled(true);
        setAvailableRoles([]);
        toast.error("You are not authorized to add staff.");
        break;
    }
  }, []);

  useEffect(() => {
    const handleClickOutsideDepartment = (event) => {
      if (departmentDropdownRef.current && !departmentDropdownRef.current.contains(event.target)) {
        setShowDepartmentDropdown(false);
      }
    };

    if (showDepartmentDropdown) {
      document.addEventListener('mousedown', handleClickOutsideDepartment);
    } else {
      document.removeEventListener('mousedown', handleClickOutsideDepartment);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutsideDepartment);
    };
  }, [showDepartmentDropdown]);

  useEffect(() => {
    const handleClickOutsideRole = (event) => {
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target)) {
        setShowRoleDropdown(false);
      }
    };

    if (showRoleDropdown) {
      document.addEventListener('mousedown', handleClickOutsideRole);
    } else {
      document.removeEventListener('mousedown', handleClickOutsideRole);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutsideRole);
    };
  }, [showRoleDropdown]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDepartmentSelect = (dept) => {
    setFormData(prev => ({ ...prev, department: dept }));
    setShowDepartmentDropdown(false);
  };

  const handleRoleSelect = (role) => {
    setFormData(prev => ({ ...prev, accountType: role }));
    setShowRoleDropdown(false);
  };

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      department: isDeptDisabled ? formData.department : "",
      accountType: ""
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.department || !formData.accountType) {
      toast.error("Please select department and role");
      return;
    }

    const token = localStorage.getItem("token")?.replace(/^"|"$/g, "");
    if (!token) {
      toast.error("Authentication token missing");
      return;
    }

    setIsLoading(true);
    try {
      await dispatch(addUser(formData, token, resetForm));
      // toast.success("User created successfully");
    } catch (error) {
      toast.error(error.message || "Failed to create user");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col border bg-gray-100 gap-8 w-full rounded-md p-6 relative">
      <div className="flex justify-between items-center border-b-2 w-full p-3 border-gray-300">
        <p className="text-xl font-semibold">Add New User</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 mx-[10%] w-full max-w-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="First Name"
            className="px-4 py-2 w-full bg-white border border-gray-300 rounded-md text-gray-700 outline-none"
            required
          />
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Last Name"
            className="px-4 py-2 w-full bg-white border border-gray-300 rounded-md text-gray-700 outline-none"
            required
          />
        </div>

        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          className="px-4 py-2 w-full bg-white border border-gray-300 rounded-md text-gray-700 outline-none"
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Department:</label>
            {isDeptDisabled ? (
              <input
                type="text"
                value={formData.department || "N/A"}
                className="px-3 py-2 border border-gray-300 rounded-md bg-gray-200 text-gray-700 font-semibold cursor-not-allowed"
                disabled
              />
            ) : (
              <div className="relative" ref={departmentDropdownRef}>
                <div
                  className="flex justify-between items-center block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white cursor-pointer focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  onClick={() => setShowDepartmentDropdown(prev => !prev)}
                >
                  {formData.department || "Select Department"}
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
                    {DEPARTMENTS.map(dept => (
                      <div 
                        key={dept} 
                        className={`px-4 py-2 hover:bg-gray-100 cursor-pointer ${formData.department === dept ? 'bg-blue-50' : ''}`}
                        onClick={() => handleDepartmentSelect(dept)}
                      >
                        <span className="text-gray-700">{dept}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Role:</label>
            <div className="relative" ref={roleDropdownRef}>
              <div
                className="flex justify-between items-center block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white cursor-pointer focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                onClick={() => setShowRoleDropdown(prev => !prev)}
              >
                {formData.accountType || "Select Role"}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-4 w-4 transform transition-transform duration-200 ${showRoleDropdown ? 'rotate-180' : 'rotate-0'}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              {showRoleDropdown && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                  {availableRoles.map(role => (
                    <div 
                      key={role} 
                      className={`px-4 py-2 hover:bg-gray-100 cursor-pointer ${formData.accountType === role ? 'bg-blue-50' : ''}`}
                      onClick={() => handleRoleSelect(role)}
                    >
                      <span className="text-gray-700">{role}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <button
          type="submit"
          className={`bg-[rgb(20,20,130)] text-white px-4 py-2 rounded hover:bg-[rgb(9,1,95)] transition-colors w-full ${
            isLoading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={isLoading}
        >
          {isLoading ? "Creating..." : "Add User"}
        </button>
      </form>
    </div>
  );
};

export default AddStaff;