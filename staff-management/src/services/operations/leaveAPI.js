import { toast } from "react-hot-toast";
import { setLoading } from "../slices/authSlice";
import { leaveEndpoints } from "../apis";
import { apiConnector } from "../apiConnector";

const { CREATE_LEAVE, GET_ALL_USER_LEAVES } = leaveEndpoints;

export function createLeave(
    subject,
    body,
    startDate,
    endDate,
    category,
    substituteTeachers,
    token
) {
    return async (dispatch) => {
        const toastId = toast.loading("Loading...");
        dispatch(setLoading(true));
        try {
            const response = await apiConnector(
                "POST",
                CREATE_LEAVE,
                {
                    subject,
                    body,
                    startDate,
                    endDate,
                    category,
                    substituteTeachers
                },
                {
                    Authorization: `Bearer ${token}`,
                }
            );
            console.log(response);
            if (!response.data.success) {
                throw new Error(response.data.message);
            }
            toast.success("Leave created successfully");
        } catch (error) {
            toast.error("Cannot create leave: " + error);
            console.log(error);
        }
        dispatch(setLoading(false));
        toast.dismiss(toastId);
    };
}

export async function getAllUserLeaves(token) {
    const toastId = toast.loading("Loading...");
    try {
        const response = await apiConnector("GET", GET_ALL_USER_LEAVES, null, {
            Authorization: `Bearer ${token}`,
        });
        console.log(response);
        if (!response.data.success) {
            throw new Error(response.message);
        }
        toast.success("All leaves fetched successfully");
        toast.dismiss(toastId);
        return response.data.data;
    } catch (error) {
        toast.error("Cannot fetch leaves");
        console.log(error);
    }
    toast.dismiss(toastId);
}
