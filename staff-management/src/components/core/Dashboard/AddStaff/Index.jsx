import React, { useEffect, useState } from "react";
import { getTokenPayload } from "../../../../utils/jwtUtils";
import { addUser } from "../../../../services/operations/authAPI";

const AddStaff = () => {
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [isDeptDisabled, setIsDeptDisabled] = useState(false);
  const [availableRoles, setAvailableRoles] = useState([]);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

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
        setSelectedDept(deptFromUser);
        setAvailableRoles(["Staff"]);
        break;
      case "HOD":
        setIsDeptDisabled(true);
        setSelectedDept(deptFromUser);
        setAvailableRoles(["Admin", "Staff"]);
        break;
      default:
        return;
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      firstName,
      lastName,
      email,
      department: selectedDept,
      accountType: selectedRole,
    };
    await addUser(payload);
  };

  return (
    <div className="min-h-screen bg-white px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">New User</h2>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 bg-gray-100 p-6 rounded-md shadow-md border"
        >
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First Name"
              className="border p-2 rounded w-full text-gray-800 bg-white"
              required
            />
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last Name"
              className="border p-2 rounded w-full text-gray-800 bg-white"
              required
            />
          </div>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="border p-2 rounded w-full text-gray-800 bg-white"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <select
              value={selectedDept}
              disabled={isDeptDisabled}
              onChange={(e) => setSelectedDept(e.target.value)}
              className={`border p-2 rounded w-full text-gray-800 ${isDeptDisabled ? "bg-gray-200 text-gray-600" : "bg-white"}`}
            >
              {selectedDept === "" && (
                <option value="" hidden>
                  Select an option
                </option>
              )}
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>

            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="border p-2 rounded w-full text-gray-800 bg-white"
              required
            >
              {selectedRole === "" && (
                <option value="" hidden>
                  Select an option
                </option>
              )}
              {availableRoles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Add User
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddStaff;