import React from "react";

const LeaveCard = ({ leave, canApproveReject, onProcessLeave, onViewDetails, isProcessing }) => {
  console.log("LeaveCard: leave prop received: ", leave);
  return (
    <div className={`w-full border p-4 flex flex-col gap-3 rounded-md shadow-md ${
        leave.status === "Pending" ? "bg-yellow-50 border-yellow-300" :
        leave.status === "Approved" ? "bg-green-50 border-green-300" :
        "bg-red-50 border-red-300"
    } relative`}>
        
        <div 
          className="absolute top-2 right-2 cursor-pointer p-1 rounded-full hover:bg-gray-200 transition-colors duration-200"
          onClick={() => onViewDetails(leave)}
          style={{ pointerEvents: isProcessing ? 'none' : 'auto' }} 
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </div>

       
        {leave.user && (
            <div className="text-lg font-bold text-gray-800">
                {leave.user.firstName} {leave.user.lastName}
            </div>
        )}

    
        <div className="font-semibold text-gray-700">
            Status:{" "}
            <span
                className={`${
                    leave.status === "Pending"
                        ? "text-yellow-600"
                        : leave.status === "Approved"
                        ? "text-green-600"
                        : "text-red-600"
                } font-bold`}
            >
                {leave.status}
            </span>
        </div>
        
       
        <div className="flex gap-4">
            <div>
                <table>
                    <tbody>
                        <tr>
                            <td className="font-medium pr-2 text-gray-700">From:</td>
                            <td className="text-gray-800">
                                {new Date(leave.startDate).toLocaleDateString('en-GB')}
                            </td>
                        </tr>
                        <tr>
                            <td className="font-medium pr-2 text-gray-700">To: </td>
                            <td className="text-gray-800">
                                {new Date(leave.endDate).toLocaleDateString('en-GB')}
                            </td>
                        </tr>
                        <tr>
                            <td className="font-medium pr-2 text-gray-700">Category:</td>
                            <td className="text-gray-800">{leave.category}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
};
export default LeaveCard;