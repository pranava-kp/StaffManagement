import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useSelector } from "react-redux";
import { getAllUserLeaves } from "../../../../services/operations/leaveAPI";
import AdminPrincipalView from "./AdminPrincipalView";
import HodView from "./HodView";
import StaffView from "./StaffView";
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
  const [comment, setcomment] = useState("");

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
        // FIX: Search for your exact schema string instead of "Pending"
        filters.status = "Awaiting HOD Approval"; 
      } else if (loggedInUserAccountType === "Principal" || loggedInUserAccountType === "Admin") {
        filters.departments = selectedDepartments.length > 0 ? selectedDepartments : departments;
        // FIX: Search for the Principal's exact schema string
        filters.status = "Awaiting Principal Approval"; 
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

    if (type === "reject") {
      if (reason || fromDetailsModal) {
        handleConfirmProcessLeave(leave, type, reason);
      } else {
        setShowRejectionModal(true);
      }
    } else {
      // FIX: Added 'reason' here so Approvals send the comment
      handleConfirmProcessLeave(leave, type, reason); 
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
      setcomment("");

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
    setcomment("");
    setIsProcessingLeave(false);
  };

  const handleViewLeaveDetails = (leave) => {
    setSelectedLeaveForDetails(leave);
    setShowLeaveDetailsModal(true);
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


  return (
    <div className="flex flex-col border bg-gray-100 gap-8 w-full rounded-md p-6">
      <p className="border-b-2 w-full p-3 border-gray-300 text-xl font-semibold">Dashboard</p>

      <div className="flex flex-col md:flex-row gap-5 w-full">
        <div className="w-full flex flex-col gap-8">
          {(loggedInUserAccountType === "Principal" || loggedInUserAccountType === "Admin") && (
            <AdminPrincipalView
              leavesData={leavesData}
              loggedInUserAccountType={loggedInUserAccountType}
              departments={departments}
              selectedDepartments={selectedDepartments}
              handleDepartmentCheckboxChange={handleDepartmentCheckboxChange}
              handleProcessLeave={handleProcessLeave}
              handleViewLeaveDetails={handleViewLeaveDetails}
              isProcessingLeave={isProcessingLeave}
              departmentDropdownRef={departmentDropdownRef}
              showDepartmentDropdown={showDepartmentDropdown}
              setShowDepartmentDropdown={setShowDepartmentDropdown}
            />
          )}

          {loggedInUserAccountType === "HOD" && (
            <HodView
              leavesData={leavesData}
              loggedInUserAccountType={loggedInUserAccountType}
              handleProcessLeave={handleProcessLeave}
              handleViewLeaveDetails={handleViewLeaveDetails}
              isProcessingLeave={isProcessingLeave}
            />
          )}

          {loggedInUserAccountType === "Staff" && (
            <StaffView
              leavesData={leavesData}
              handleViewLeaveDetails={handleViewLeaveDetails}
              isProcessingLeave={isProcessingLeave}
            />
          )}

          {leavesData && (!leavesData.leaves || leavesData.leaves.length === 0) && (
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
                value={comment}
                onChange={(e) => setcomment(e.target.value)}
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
            console.log("Confirm Reject from Index.jsx", { leaveToProcess, comment, isProcessingLeave }); // Debug log
            handleConfirmProcessLeave(leaveToProcess, "reject", comment || "");
          }}
          isProcessing={isProcessingLeave}
        />
      )}


      {showLeaveDetailsModal && selectedLeaveForDetails && (
          <LeaveDetailsModal
            isOpen={showLeaveDetailsModal}
            onClose={() => setShowLeaveDetailsModal(false)}
            leave={selectedLeaveForDetails}
            //  Smart visibility! Only shows the box if it is ACTUALLY their turn.
            canApproveReject={
              (loggedInUserAccountType === "HOD" && ["Pending", "Awaiting HOD Approval"].includes(selectedLeaveForDetails.status)) ||
              (loggedInUserAccountType === "Principal" && selectedLeaveForDetails.status === "Awaiting Principal Approval") ||
              (loggedInUserAccountType === "Admin" && ["Pending", "Awaiting HOD Approval", "Awaiting Principal Approval"].includes(selectedLeaveForDetails.status))
            }
            onProcessLeave={handleProcessLeave}
            isProcessing={isProcessingLeave}
          />
        )}
    </div>
  );
};
export default Staff;
