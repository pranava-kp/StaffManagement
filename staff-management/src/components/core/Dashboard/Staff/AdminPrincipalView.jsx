import React, { useMemo } from 'react';
import LeaveCard from './LeaveCard';

const AdminPrincipalView = ({ 
  leavesData, 
  loggedInUserAccountType, 
  departments, 
  selectedDepartments, 
  handleDepartmentCheckboxChange, 
  handleProcessLeave, 
  handleViewLeaveDetails, 
  isProcessingLeave,
  departmentDropdownRef,
  showDepartmentDropdown,
  setShowDepartmentDropdown 
}) => {
  const { leavesGreaterThanTwoWeeks, otherLeaves } = useMemo(() => {
    const greaterThanTwoWeeks = [];
    const others = [];
    if (leavesData && leavesData.leaves) {
      leavesData.leaves.forEach(leave => {
        const startDate = new Date(leave.startDate);
        const endDate = new Date(leave.endDate);
        const diffTime = Math.abs(endDate - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

        if (diffDays > 14) {
          greaterThanTwoWeeks.push(leave);
        } else {
          others.push(leave);
        }
      });
    }
    return { leavesGreaterThanTwoWeeks: greaterThanTwoWeeks, otherLeaves: others };
  }, [leavesData]);

  return (
    <>
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

      {leavesData && leavesData.leaves.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Leaves &gt; 2 Weeks (High Priority)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {leavesGreaterThanTwoWeeks.length > 0 ? (
              leavesGreaterThanTwoWeeks.map((leave) => (
                <LeaveCard
                  leave={leave}
                  key={leave._id}
                  canApproveReject={(loggedInUserAccountType === "Principal" && leave.status === "Awaiting Principal Approval") || loggedInUserAccountType === "Admin"}
                  onProcessLeave={handleProcessLeave}
                  onViewDetails={handleViewLeaveDetails}
                  isProcessing={isProcessingLeave}
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
                  canApproveReject={(loggedInUserAccountType === "Principal" && leave.status === "Awaiting Principal Approval") || loggedInUserAccountType === "Admin"}
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
    </>
  );
};

export default AdminPrincipalView;
