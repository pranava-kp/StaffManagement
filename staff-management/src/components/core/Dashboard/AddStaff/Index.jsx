import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { getTokenPayload } from "../../../../utils/jwtUtils";
import { addUser } from "../../../../services/operations/authAPI";
import toast from "react-hot-toast";

const AddStaff = () => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  

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
        setFormData(prev => ({...prev, department: deptFromUser}));
        setAvailableRoles(["Staff"]);
        break;
      case "HOD":
        setIsDeptDisabled(true);
        setFormData(prev => ({...prev, department: deptFromUser}));
        setAvailableRoles(["Admin", "Staff"]);
        break;
      default:
     
        setIsDeptDisabled(true);
        setAvailableRoles([]);
    
        toast.error("You are not authorized to add staff.");
        break;
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({...prev, [name]: value}));
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
      toast.success("User created successfully");
    } catch (error) {
      toast.error(error.message || "Failed to create user");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col border bg-gray-100 gap-8 w-full rounded-md p-6"> 
      <p className="border-b-2 w-full p-3 border-gray-300 text-xl font-semibold">Add New User</p> 

      <div className="p-4 bg-white rounded-md shadow-sm"> 
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">New User Details</h2> 

        <form onSubmit={handleSubmit} className="space-y-4 max-w-xl"> 
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="First Name"
              className="border p-2 rounded w-full text-gray-800 bg-white focus:ring-blue-500 focus:border-blue-500"
              required
            />
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Last Name"
              className="border p-2 rounded w-full text-gray-800 bg-white focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            className="border p-2 rounded w-full text-gray-800 bg-white focus:ring-blue-500 focus:border-blue-500"
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> 
            <select
              name="department"
              value={formData.department}
              disabled={isDeptDisabled}
              onChange={handleChange}
              className={`border p-2 rounded w-full text-gray-800 focus:ring-blue-500 focus:border-blue-500 ${isDeptDisabled ? "bg-gray-200 text-gray-600 cursor-not-allowed" : "bg-white"}`}
              required
            >
              <option value="" hidden>Select Department</option>
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>

            <select
              name="accountType"
              value={formData.accountType}
              onChange={handleChange}
              className="border p-2 rounded w-full text-gray-800 bg-white focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="" hidden>Select Role</option>
              {availableRoles.map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className={`bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors w-full ${ // Full width button
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={isLoading}
          >
            {isLoading ? "Creating..." : "Add User"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddStaff;
