import React, { useState } from "react";
import ConfirmationModal from "./ConfirmationModal";

const LeaveDetailsModal = ({ isOpen, onClose, leave, canApproveReject, onProcessLeave, isProcessing }) => {
  const [comment, setComment] = useState("");
  const [showRejectionConfirmation, setShowRejectionConfirmation] = useState(false);

  if (!isOpen || !leave) return null;

  const handleRejectClick = () => {
    setShowRejectionConfirmation(true);
  };

  const handleConfirmReject = () => {
    onProcessLeave(leave, "reject", comment || "", true); 
    setShowRejectionConfirmation(false);
    setComment("");
  };

  const handleCancelRejectConfirmation = () => {
    setShowRejectionConfirmation(false);
  };

  const handleApproveClick = () => {
    onProcessLeave(leave, "approve", comment || "", true);
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
          <p>
            <strong>Status:</strong>{" "}
            {/* Added your HOD/Principal statuses to the Yellow text color! */}
            <span className={`font-bold ${
              ["Pending", "Awaiting HOD Approval", "Awaiting Principal Approval"].includes(leave.status) ? "text-yellow-600" :
              leave.status === "Approved" ? "text-green-600" : "text-red-600"
            }`}>
              {leave.status}
            </span>
          </p>
          <p><strong>Category:</strong> {leave.category}</p>
          <p><strong>From:</strong> {new Date(leave.startDate).toLocaleDateString('en-GB')}</p>
          <p><strong>To:</strong> {new Date(leave.endDate).toLocaleDateString('en-GB')}</p>
          <p><strong>Description:</strong> {leave.body}</p>

          {/* --- NEW: COMMENTS AUDIT TRAIL (100% Crash Proof) --- */}
          {leave?.comments && Array.isArray(leave.comments) && leave.comments.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-2">Comments:</h3>
              <div className="flex flex-col gap-3">
                {leave.comments.map((c, index) => {
                  const actionColor = c.action === 'Approved' ? 'text-green-600' : 'text-red-600';
                  return (
                    <div key={index} className="bg-white p-3 rounded-md text-sm border border-gray-100 shadow-sm">
                      {/* 1. Role and Status */}
                      <p className="text-gray-800 m-0 mb-1">
                        <strong>{c.role}:</strong> <span className={`font-semibold ${actionColor}`}>{c.action}</span>
                      </p>
                      
                      {/* 2. The Comment Text (Normal text, no italics) */}
                      {c.commentText && c.commentText.trim() !== "" && (
                        <p className="text-gray-800 m-0 mb-1">
                          "{c.commentText}"
                        </p>
                      )}

                      {/* 3. The Timestamp */}
                      <p className="text-xs text-gray-400 m-0">
                        On {new Date(c.timestamp).toLocaleDateString('en-GB')} at {new Date(c.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* --- NEW: COMMENT INPUT BOX --- */}
        {["Pending", "Awaiting HOD Approval", "Awaiting Principal Approval"].includes(leave.status) && canApproveReject && (
          <div className="mt-5 border-t border-gray-200 pt-4">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Add a Comment (Optional):
            </label>
            <textarea
              placeholder="Type your comment or reason here..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
              rows="2"
              disabled={isProcessing}
            />
            
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
          </div>
        )}

        {/* Rejection Confirmation Pop-up */}
        {showRejectionConfirmation && (
          <ConfirmationModal
            isOpen={showRejectionConfirmation}
            text1="Reject Leave Request"
            text2={
              <div className="flex flex-col gap-2">
                <p>Are you sure you want to reject this leave request?</p>
                <textarea
                  placeholder="Reason for rejection (optional)"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                  rows="3"
                  disabled={isProcessing}
                />
              </div>
            }
            btn1Text="Cancel"
            btn2Text="Confirm Reject"
            btn1Handler={handleCancelRejectConfirmation}
            btn2Handler={handleConfirmReject}
            isProcessing={isProcessing}
          />
        )}
      </div>
    </div>
  );
};

export default LeaveDetailsModal;