import React, { useState } from "react";
import { toast } from "react-hot-toast";
import ConfirmationModal from "./ConfirmationModal";
const LeaveDetailsModal = ({ isOpen, onClose, leave, canApproveReject, onProcessLeave, isProcessing }) => {
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectionConfirmation, setShowRejectionConfirmation] = useState(false);
  if (!isOpen || !leave) return null;

  const handleRejectClick = () => {
    setShowRejectionConfirmation(true);
  };

  const handleConfirmReject = () => {
    // console.log("handleConfirmReject called", { leave, rejectionReason, isProcessing });
    onProcessLeave(leave, "reject", rejectionReason || "", true); // Pass true for fromDetailsModal
    setShowRejectionConfirmation(false);
    setRejectionReason("");
  };

  const handleCancelRejectConfirmation = () => {
    setShowRejectionConfirmation(false);
    setRejectionReason("");
  };

  const handleApproveClick = () => {
    onProcessLeave(leave, "approve");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Leave Details</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={isProcessing}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col gap-3 text-gray-700">
          <p><strong>Subject:</strong> {leave.subject}</p>
          {leave.user && (
            <p><strong>Applied By:</strong> {leave.user.firstName} {leave.user.lastName} ({leave.user.department})</p>
          )}
          <p><strong>Status:</strong> <span className={`font-bold ${leave.status === "Pending" ? "text-yellow-600" :
            leave.status === "Approved" ? "text-green-600" :
              "text-red-600"
            }`}>{leave.status}</span></p>
          <p><strong>Category:</strong> {leave.category}</p>
          <p><strong>From:</strong> {new Date(leave.startDate).toLocaleDateString('en-GB')}</p>
          <p><strong>To:</strong> {new Date(leave.endDate).toLocaleDateString('en-GB')}</p>
          <p><strong>Description:</strong> {leave.body}</p>
          {leave.rejectionReason && <p><strong>Rejection Reason:</strong> {leave.rejectionReason}</p>}
        </div>

        {leave.status === "Pending" && canApproveReject && (
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={handleApproveClick}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
              disabled={isProcessing}
            >
              Approve
            </button>
            <button
              onClick={handleRejectClick}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
              disabled={isProcessing}
            >
              Reject
            </button>
          </div>
        )}

        {showRejectionConfirmation && (
          <ConfirmationModal
            isOpen={showRejectionConfirmation}
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
                  disabled={isProcessing}
                />
              </div>
            }
            btn1Text="Cancel"
            btn2Text="Confirm Reject"
            btn1Handler={handleCancelRejectConfirmation}
            btn2Handler={handleConfirmReject}  // Remove the arrow function here
            isProcessing={isProcessing}
          />
        )}
      </div>
    </div>
  );
};

export default LeaveDetailsModal;