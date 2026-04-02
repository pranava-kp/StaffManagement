import React from 'react';
import LeaveCard from './LeaveCard';

const HodView = ({ leavesData, loggedInUserAccountType, handleProcessLeave, handleViewLeaveDetails, isProcessingLeave }) => {
  if (!leavesData || !leavesData.leaves || leavesData.leaves.length === 0) return null;

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Leaves to Review in Your Department</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {leavesData.leaves.map((leave) => (
          <LeaveCard
            leave={leave}
            key={leave._id}
            canApproveReject={(loggedInUserAccountType === "HOD" && leave.status === "Awaiting HOD Approval")}
            onProcessLeave={handleProcessLeave}
            onViewDetails={handleViewLeaveDetails}
            isProcessing={isProcessingLeave}
          />
        ))}
      </div>
    </div>
  );
};

export default HodView;
