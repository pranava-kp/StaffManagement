import React, { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { getAllUserLeaves } from "../../../../services/operations/leaveAPI";
import LeaveCard from "./LeaveCard";
import { IoMdAdd } from "react-icons/io";
import { Link } from "react-router-dom";

const Staff = () => {
    const { token } = useSelector((state) => state.auth);
    const [leavesData, setLeavesData] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchLeavesTaken = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getAllUserLeaves(token);
            setLeavesData(response);
            console.log("All user leaves: ", response.totalLeavesTaken);
        } catch (e) {
            console.log("Error in fetching leaves: ", e);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchLeavesTaken();
    }, [fetchLeavesTaken]);

    if (loading) {
        return <div>Loading...</div>;
    }
    return (
        <div className="flex flex-col md:flex-row gap-5 w-full">
            <div className=" w-full flex flex-col gap-8">
                <div className=" flex justify-between items-center">
                    <Link
                        to="/dashboard/new-leave"
                        className="border w-[145px] p-2 bg-[rgb(20,20,130)] text-gray-100 font-semibold flex items-center rounded-md gap-1 hover:bg-[rgb(9,1,95)]"
                    >
                        New Leave
                        <IoMdAdd className=" text-xl font-bold" />
                    </Link>
                    <p className=" w-full text-end">
                        Total leaves Taken:{" "}
                        {leavesData ? leavesData.totalLeavesTaken : 0}
                    </p>
                </div>
                <div>
                    {leavesData &&
                        leavesData.leaves.map((leave) => {
                            return (
                                <LeaveCard leave={leave} key={leave._id} />
                            );
                        })}
                </div>
            </div>
        </div>
    );
};

export default Staff;