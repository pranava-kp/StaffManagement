import React from "react";

const LeaveCard = ({ leave }) => {
    console.log("leave: ", leave);
    leave.status = "Pending";
    return (
        <div className={`w-[300px] border p-4 flex flex-col gap-3 rounded-md`}>
            <div className=" text-lg font-bold">{leave.subject}</div>
            <div className=" font-semibold">
                Status:{" "}
                <span
                    className={`${
                        leave.status === "Pending"
                            ? "text-yellow-500"
                            : leave.status === "Approved"
                            ? " text-green-500"
                            : "text-red-500"
                    } font-bold`}
                >
                    {" "}
                    {leave.status}
                </span>
            </div>
            <div className="flex gap-4">
                {/* From, To table */}
                <div>
                    <table>
                        <tbody>
                            <tr>
                                <td className=" font-medium pr-2">From:</td>
                                <td>
                                    {leave.startDate
                                        .substr(0, 10)
                                        .split("-")
                                        .reverse()
                                        .join("-")}
                                </td>
                            </tr>
                            <tr>
                                <td className=" font-medium">To: </td>
                                <td>
                                    {leave.endDate
                                        .substr(0, 10)
                                        .split("-")
                                        .reverse()
                                        .join("-")}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <button className=" bg-rnsit-orange text-gray-100 rounded-md">
                View Details
            </button>
        </div>
    );
};

export default LeaveCard;
