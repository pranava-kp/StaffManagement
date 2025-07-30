import { toast } from "react-hot-toast";
import { setLoading } from "../slices/authSlice";
import { leaveEndpoints } from "../apis";
import { apiConnector } from "../apiConnector";

const { CREATE_LEAVE, GET_ALL_USER_LEAVES, GRANT_USER_LEAVE } = leaveEndpoints;

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

export async function getAllUserLeaves(token, filters = {}) {
  const toastId = toast.loading("Loading leaves...");
  try {
    const params = {};
    //console.log(filters.departments);
    if (filters.departments && filters.departments.length > 0) {
      params.departments = filters.departments.join(',');
    }
    if (filters.status) {
      params.status = filters.status;
    }
    // Always send accountTypes as "Staff" as per the requirement
    params.accountTypes = "Staff";

    console.log("getAllUserLeaves (API): Fetching with params:", params);

    const response = await apiConnector("GET", GET_ALL_USER_LEAVES, null, {
      Authorization: `Bearer ${token}`,
    }, params);

    console.log("getAllUserLeaves (API) response:", response);

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to fetch leaves.");
    }
    toast.success("Leaves fetched successfully");
    return response.data.data;
  } catch (error) {
    console.error("Error in fetching leaves:", error);
    toast.error(error.response?.data?.message || "Cannot fetch leaves");
    throw error;
  } finally {
    toast.dismiss(toastId);
  }
}
export async function updateLeaveStatus(token, leaveId, status, rejectionReason = "") {
  const toastId = toast.loading("Updating leave status...");
  try {
    const payload = {
      leaveId,
      status,
      rejectionReason: status === "Rejected" ? rejectionReason : undefined
    };
    // console.log("Sending payload:", payload); // Debug payload
    const response = await apiConnector(
      "POST", 
      GRANT_USER_LEAVE, 
      payload,
      {
        Authorization: `Bearer ${token.replace(/^"|"$/g, "")}`,
      }
    );

    // console.log("updateLeaveStatus (API) response:", response);

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to update leave status.");
    }

    toast.success(`Leave ${status.toLowerCase()} successfully`);
    return response.data.data;
  } catch (error) {
    console.error("Error in updating leave status:", error);
    toast.error(error.response?.data?.message || "Cannot update leave status");
    throw error;
  } finally {
    toast.dismiss(toastId);
  }
}