import { toast } from "react-hot-toast";
import { setLoading } from "../slices/authSlice";
import { leaveEndpoints } from "../apis";
import { apiConnector } from "../apiConnector";

const { CREATE_LEAVE, GET_ALL_USER_LEAVES, GRANT_USER_LEAVE, GET_REMAINING_LEAVES } = leaveEndpoints;

export function createLeave(formData, token) {
  return async (dispatch) => {
    const toastId = toast.loading("Loading...");
    dispatch(setLoading(true));
    try {
      // We now pass formData directly as the bodyData
      const response = await apiConnector(
        "POST",
        CREATE_LEAVE,
        formData,
        {
          Authorization: `Bearer ${token}`,
        }
      );

      console.log("Create leave API response:", response);

      if (!response.data.success) {
        throw new Error(response.data.message);
      }

      toast.success("Leave created successfully");

      // Return the API response so NewLeave can use result.success
      return response.data;

    } catch (error) {
      toast.error(error.response?.data?.message || "Cannot create leave");
      console.log("Error in createLeave:", error);

      // Return an error object so NewLeave can detect failure
      return { success: false, message: error.message };
    } finally {
      dispatch(setLoading(false));
      toast.dismiss(toastId);
    }
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
export async function updateLeaveStatus(token, leaveId, status, incomingText = "") {
  const toastId = toast.loading("Updating leave status...");
  try {
    const payload = {
      leaveId,
      status,
      //  We send the comment under BOTH names so the backend cannot possibly miss it.
      comment: incomingText,
      rejectionReason: incomingText 
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

export async function getRemainingLeaves(token) {
  try {
    const response = await apiConnector("GET", GET_REMAINING_LEAVES, null, {
      Authorization: `Bearer ${token.replace(/^"|"$/g, "")}`,
    });

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to fetch remaining leaves.");
    }
    return response.data;
  } catch (error) {
    console.error("Error in fetching remaining leaves:", error);
    toast.error(error.response?.data?.message || "Cannot fetch remaining leaves");
    throw error;
  }
}