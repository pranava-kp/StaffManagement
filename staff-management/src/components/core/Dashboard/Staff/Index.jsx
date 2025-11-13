import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useSelector } from "react-redux";
import { getAllUserLeaves } from "../../../../services/operations/leaveAPI";
import LeaveCard from "./LeaveCard";
import { getTokenPayload } from '../../../../utils/jwtUtils';
import { toast } from "react-hot-toast";
import { updateLeaveStatus } from "../../../../services/operations/leaveAPI";
import LeaveDetailsModal from "../../../common/LeaveDetailsModal"
import ConfirmationModal from "../../../common/ConfirmationModal";

const Staff = () => {
  const { token } = useSelector((state) => state.auth);
  const [leavesData, setLeavesData] = useState(null);
  const [loading, setLoading] = useState(true); 

  const [loggedInUserAccountType, setLoggedInUserAccountType] = useState(null);
  const [loggedInUserDepartment, setLoggedInUserDepartment] = useState(null);
  const [authDataReady, setAuthDataReady] = useState(false);

  const departments = useMemo(() => ["CSE", "ISE", "ME", "ECE"], []);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false);
  const departmentDropdownRef = useRef(null);

  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [leaveToProcess, setLeaveToProcess] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionType, setActionType] = useState("");

  const [showLeaveDetailsModal, setShowLeaveDetailsModal] = useState(false);
  const [selectedLeaveForDetails, setSelectedLeaveForDetails] = useState(null);

  const [isProcessingLeave, setIsProcessingLeave] = useState(false);

  useEffect(() => {
    if (token) {
      const rawToken = token.replace(/^"|"$/g, "");
      const userPayload = getTokenPayload(rawToken);

      if (userPayload) {
        setLoggedInUserAccountType(userPayload.accountType);
        setLoggedInUserDepartment(userPayload.department || null);
        setAuthDataReady(true);
      } else {
        setAuthDataReady(false);
        toast.error("Invalid token payload. Please log in again.");
      }
    } else {
      setAuthDataReady(false);
      toast.error("Authentication token missing. Please log in.");
    }
  }, [token]);

  const fetchLeavesTaken = useCallback(async () => {
    if (!authDataReady) {
      setLoading(false);
      return;
    }

     setLoading(true);
    try {
      let filters = {};
      if (loggedInUserAccountType === "HOD") {
        filters.departments = [loggedInUserDepartment];
        filters.status = "Pending";
      } else if (loggedInUserAccountType === "Principal" || loggedInUserAccountType === "Admin") {
        filters.departments = selectedDepartments.length > 0 ? selectedDepartments : departments;
        filters.status = "Pending";
      }
      const response = await getAllUserLeaves(token, filters);
      setLeavesData(response);
      console.log("Fetched leaves data: ", response);
    } catch (e) {
      console.log("Error in fetching leaves: ", e);
      setLeavesData(null); // Clear data on error
    } finally {
      setLoading(false);
    }
  }, [token, authDataReady, loggedInUserAccountType, loggedInUserDepartment, selectedDepartments, departments]);

  useEffect(() => {
    fetchLeavesTaken();
  }, [fetchLeavesTaken]);

  const handleDepartmentCheckboxChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setSelectedDepartments(prev => [...prev, value]);
    } else {
      setSelectedDepartments(prev => prev.filter(dept => dept !== value));
    }
  };

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

  const handleProcessLeave = (leave, type, reason = "", fromDetailsModal = false) => {
    setIsProcessingLeave(true);
    setLeaveToProcess(leave);
    setActionType(type);

    if (type === "reject") {
      if (reason || fromDetailsModal) {
        handleConfirmProcessLeave(leave, type, reason);
      } else {
        setShowRejectionModal(true);
      }
    } else {
      handleConfirmProcessLeave(leave, type);
    }
  };

  const handleConfirmProcessLeave = async (leave, type, reason = "") => {
    // console.log("Starting leave processing", { leave, type, reason, isProcessingLeave }); // Debug
    try {
      const status = type === "approve" ? "Approved" : "Rejected";
      await updateLeaveStatus(token, leave._id, status, reason);
      // console.log("Leave processed successfully", { status }); // Debug

      await fetchLeavesTaken();

      setShowRejectionModal(false);
      setShowLeaveDetailsModal(false);
      setSelectedLeaveForDetails(null);

      setLeaveToProcess(null);
      setRejectionReason("");

      toast.success(`Leave ${status.toLowerCase()} successfully`);
    } catch (error) {
      console.error("Error processing leave:", error);
      toast.error(`Failed to ${type} leave. Please try again.`);
    } finally {
      // console.log("Processing complete", { isProcessingLeave }); // Debug
      setIsProcessingLeave(false);
    }
  };
  const handleCancelProcessLeave = () => {
    setShowRejectionModal(false);
    setLeaveToProcess(null);
    setRejectionReason("");
    setIsProcessingLeave(false);
  };

  const handleViewLeaveDetails = (leave) => {
    setSelectedLeaveForDetails(leave);
    setShowLeaveDetailsModal(true);
  };

  const handleCloseLeaveDetailsModal = () => {
    setShowLeaveDetailsModal(false);
    setSelectedLeaveForDetails(null);
  };

  if (loading) {
    return <div className="p-4 text-center">Loading leaves...</div>;
  }
  if (!authDataReady) {
    return <div className="p-4 text-center text-red-500">Authentication data not ready. Please log in.</div>;
  }

  //not yet implemented
  /*   const totalLeavesDisplay = (loggedInUserAccountType === "HOD" || loggedInUserAccountType === "Principal" || loggedInUserAccountType === "Admin") ?
      `Total Pending Leaves: ${leavesData ? leavesData.leaves.filter(l => l.status === 'Pending').length : 0}` :
      `Total leaves Taken: ${leavesData ? leavesData.totalLeavesTaken : 0}`;
   */
  const leavesGreaterThanTwoWeeks = [];
  const otherLeaves = [];

  if (leavesData && (loggedInUserAccountType === "Principal" || loggedInUserAccountType === "Admin")) {
    leavesData.leaves.forEach(leave => {
      const startDate = new Date(leave.startDate);
      const endDate = new Date(leave.endDate);
      const diffTime = Math.abs(endDate - startDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      if (diffDays > 14) {
        leavesGreaterThanTwoWeeks.push(leave);
      } else {
        otherLeaves.push(leave);
      }
    });
  }

  return (
    <div className="flex flex-col border bg-gray-100 gap-8 w-full rounded-md p-6">
      <p className="border-b-2 w-full p-3 border-gray-300 text-xl font-semibold">Dashboard</p>

      <div className="flex flex-col md:flex-row gap-5 w-full">
        <div className="w-full flex flex-col gap-8">
          {(loggedInUserAccountType === "Principal" || loggedInUserAccountType === "Admin") && (
            <div className="flex flex-col gap-1 min-w-[200px]">
              <label className="text-sm font-medium text-gray-700">Filter by Department:</label>
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
            </div>
          )}


          {(loggedInUserAccountType === "Principal" || loggedInUserAccountType === "Admin") && leavesData && leavesData.leaves.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Leaves &gt; 2 Weeks (High Priority)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {leavesGreaterThanTwoWeeks.length > 0 ? (
                  leavesGreaterThanTwoWeeks.map((leave) => (
                    <LeaveCard
                      leave={leave}
                      key={leave._id}
                      canApproveReject={true}
                      onProcessLeave={handleProcessLeave}
                      onViewDetails={handleViewLeaveDetails}
                      isProcessing={isProcessingLeave} // Pass processing state
                    />
                  ))
                ) : (
                  <p className="text-gray-600 col-span-full">No high priority leaves.</p>
                )}
              </div>

              <h3 className="text-lg font-semibold text-gray-800 mt-8 mb-4">Other Leaves</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {otherLeaves.length > 0 ? (
                  otherLeaves.map((leave) => (
                    <LeaveCard
                      leave={leave}
                      key={leave._id}
                      canApproveReject={true}
                      onProcessLeave={handleProcessLeave}
                      onViewDetails={handleViewLeaveDetails}
                      isProcessing={isProcessingLeave}
                    />
                  ))
                ) : (
                  <p className="text-gray-600 col-span-full">No other leaves.</p>
                )}
              </div>
            </div>
          )}

          {loggedInUserAccountType === "HOD" && leavesData && leavesData.leaves.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Leaves to Review in Your Department</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {leavesData.leaves.map((leave) => (
                  <LeaveCard
                    leave={leave}
                    key={leave._id}
                    canApproveReject={true}
                    onProcessLeave={handleProcessLeave}
                    onViewDetails={handleViewLeaveDetails}
                    isProcessing={isProcessingLeave}
                  />
                ))}
              </div>
            </div>
          )}

          {loggedInUserAccountType === "Staff" && leavesData && leavesData.leaves.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Applied Leaves</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {leavesData.leaves.map((leave) => (
                  <LeaveCard
                    leave={leave}
                    key={leave._id}
                    canApproveReject={false}
                    onViewDetails={handleViewLeaveDetails}
                    isProcessing={isProcessingLeave} // Pass processing state
                  />
                ))}
              </div>
            </div>
          )}

          {leavesData && leavesData.leaves.length === 0 && (
            <div className="text-center text-gray-600 mt-8">No leaves to display based on current filters/role.</div>
          )}
        </div>
      </div>


      {showRejectionModal && (
        <ConfirmationModal
          isOpen={showRejectionModal}
          text1="Reject Leave Request"
          text2={
            <div className="flex flex-col gap-2">
              <p>Are you sure you want to reject this leave request?</p>
              <textarea
                placeholder="Reason for rejection (optional)"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                rows="3"
                disabled={isProcessingLeave}
              />
            </div>
          }
          btn1Text="Cancel"
          btn2Text="Confirm Reject"
          btn1Handler={handleCancelProcessLeave}
          btn2Handler={() => {
            console.log("Confirm Reject from Index.jsx", { leaveToProcess, rejectionReason, isProcessingLeave }); // Debug log
            handleConfirmProcessLeave(leaveToProcess, "reject", rejectionReason || "");
          }}
          isProcessing={isProcessingLeave}
        />
      )}


      {showLeaveDetailsModal && selectedLeaveForDetails && (
        <LeaveDetailsModal
          isOpen={showLeaveDetailsModal}
          onClose={handleCloseLeaveDetailsModal}
          leave={selectedLeaveForDetails}
          canApproveReject={loggedInUserAccountType === "HOD" || loggedInUserAccountType === "Principal" || loggedInUserAccountType === "Admin"}
          onProcessLeave={handleProcessLeave}
          isProcessing={isProcessingLeave}
        />
      )}
    </div>
  );
};
export default Staff;
