import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getRemainingLeaves } from '../../../../services/operations/leaveAPI';
import LeaveCard from './LeaveCard';

const StaffView = ({ leavesData, handleViewLeaveDetails, isProcessingLeave }) => {
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  
  const [leaveBalances, setLeaveBalances] = useState({
    casualLeave: 0,
    earnedLeave: 0,
    restrictedHoliday: 0
  });
  const [loadingBalances, setLoadingBalances] = useState(true);

  useEffect(() => {
    const fetchBalances = async () => {
      if (!token) return;
      try {
        setLoadingBalances(true);
        const response = await getRemainingLeaves(token);
        if (response && response.data) {
          setLeaveBalances({
            casualLeave: response.data["Casual Leave"],
            earnedLeave: response.data["Earned Leave"],
            restrictedHoliday: response.data["Restricted Holiday"]
          });
        }
      } catch (error) {
        console.error("Failed to fetch leave balances:", error);
      } finally {
        setLoadingBalances(false);
      }
    };
    
    fetchBalances();
  }, [token]);

  return (
    <div className="space-y-10 mt-8">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          onClick={() => navigate("/dashboard/new-leave")}
          className="bg-gradient-to-br from-blue-500 to-blue-600 
                     text-white p-6 rounded-2xl shadow-lg 
                     cursor-pointer hover:-translate-y-1 
                     hover:shadow-2xl transition-all duration-300"
        >
          <p className="text-sm opacity-80">Casual Leave (CL)</p>
          <h2 className="text-4xl font-bold mt-2">
            {loadingBalances ? "..." : leaveBalances.casualLeave}
          </h2>
          <p className="mt-6 text-sm opacity-80">
            Available annual balance
          </p>
        </div>

        <div 
          onClick={() => navigate("/dashboard/new-leave")}
          className="bg-gradient-to-br from-orange-500 to-orange-600 
                     text-white p-6 rounded-2xl shadow-lg
                     cursor-pointer hover:-translate-y-1 
                     hover:shadow-2xl transition-all duration-300"
        >
          <p className="text-sm opacity-80">Earned Leave (EL)</p>
          <h2 className="text-4xl font-bold mt-2">
            {loadingBalances ? "..." : leaveBalances.earnedLeave}
          </h2>
          <p className="mt-6 text-sm opacity-80">
            Available annual balance
          </p>
        </div>

        <div
          onClick={() => navigate("/dashboard/new-leave")}
          className="bg-gradient-to-br from-green-500 to-green-600 
                     text-white p-6 rounded-2xl shadow-lg 
                     cursor-pointer hover:-translate-y-1 
                     hover:shadow-2xl transition-all duration-300"
        >
          <p className="text-sm opacity-80">Restricted Holiday</p>
          <h2 className="text-4xl font-bold mt-2">
            {loadingBalances ? "..." : leaveBalances.restrictedHoliday}
          </h2>
          <p className="mt-6 text-sm opacity-80">
            Available to use
          </p>
        </div>
      </div>

      {/* Leave Usage */}
      {/* <div className="bg-white p-6 rounded-2xl shadow-md space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">
            Leave Usage
          </h2>
          <p className="text-gray-500 text-sm">
            Your leave consumption for the year
          </p>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-orange-600 font-medium">
            {usedLeave} days used
          </span>
          <span className="text-green-600 font-medium">
            {remainingLeave} days remaining
          </span>
        </div>

        <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
          <div className="bg-blue-600 h-full" style={{ width: `${utilizedPercentage}%` }}></div>
        </div>
      </div> */}

      {/* Applied Leaves */}
      {(!leavesData || !leavesData.leaves || leavesData.leaves.length === 0) ? (
        <div className="text-gray-500 text-center py-10 bg-white rounded-2xl shadow-md">
          You haven't applied for any leaves yet.
        </div>
      ) : (
        <div className="bg-white p-6 rounded-2xl shadow-md mt-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                Leave Applications
              </h2>
              <p className="text-gray-500 text-sm">
                All your leave applications and their status
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {leavesData.leaves.map((leave) => (
              <LeaveCard
                leave={leave}
                key={leave._id}
                canApproveReject={false}
                onViewDetails={handleViewLeaveDetails}
                isProcessing={isProcessingLeave}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffView;
