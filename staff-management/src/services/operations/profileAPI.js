import { apiConnector } from "../apiConnector";
import { deleteEndpoints, endpoints } from "../apis";
import { updateEndpoints } from "../apis";
import { toast } from "react-hot-toast";
import { userEndpoints } from "../apis";


export const getProfileData = async (token) => {
  try {
    const response = await apiConnector(
      "GET",
      endpoints.PROFILE_API,
      null,
      {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      { withCredentials: true }
    );
    
    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    
    // Normalize field names - map backend 'phone' to frontend 'phoneNumber'
    const normalizedProfile = {
      ...response.data.profileData,
      phoneNumber: response.data.profileData.phone // Add this line
    };
    
    return {
      success: true,
      profileData: normalizedProfile
    };
  } catch (error) {
    console.error("Profile API Error:", error);
    throw error;
  }
};

export const updateProfileData = async(token, editedData) => {
  try {
    // Prepare data for backend - map frontend 'phoneNumber' to backend 'phone'
    const backendData = {
      ...editedData,
      phone: editedData.phoneNumber // Add this line
    };
    delete backendData.phoneNumber; // Remove the frontend field name

    const response = await apiConnector(
      "PATCH",
      updateEndpoints.UPDATE_PROFILE,
      backendData, // Use the transformed data
      {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      { withCredentials: true }
    );
    
    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    
    // Normalize the response data for frontend
    const normalizedResponse = {
      ...response.data.data,
      phoneNumber: response.data.data.phone // Map back to frontend field name
    };
    
    toast.success("Update Successful");
    return {
      success: true,
      updatedProfile: normalizedResponse
    };
  } catch (e) {
    console.log(e.message);
    throw e; // Make sure to re-throw the error
  }
}
export const getAllProfiles = async (token, filters) => {
  try {
    const params = {};
    if (filters.departments && filters.departments.length > 0) {
      params.departments = filters.departments.join(',');
    }
    if (filters.userTypes && filters.userTypes.length > 0) {
      params.accountTypes = filters.userTypes.join(','); 
    }

    console.log("getAllProfiles (Frontend): Parameters being sent to backend:", params); 

    const response = await apiConnector(
      "GET",
      userEndpoints.GET_ALL_USER, 
      null, 
      { Authorization: `Bearer ${token}` },
      params 
    );

    console.log("getAllProfiles (Frontend): Full API response:", response);
    
    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    console.log("getAllProfiles (Frontend): Profiles received from backend:", response.data.data.users); 
    return { success: true, profiles: response.data.data.users }; 
  } catch (error) {
    console.error("GET_ALL_PROFILES_API ERROR (Frontend):", error);
    toast.error(error.response?.data?.message || "Failed to fetch profiles.");
    return { success: false, message: error.response?.data?.message || "Failed to fetch profiles" };
  }
};

export const deleteProfile = async (token, email) => {
  try {
    const response = await apiConnector(
      "DELETE", 
      deleteEndpoints.DELETE_PROFILE, 
      { email }, 
      { Authorization: `Bearer ${token}` }
    );

    if (!response.data.success) {
      throw new Error(response.data.message || "Deletion failed on backend.");
    }
    toast.success("User deleted successfully!");
    return { success: true };
  } catch (error) {
    console.error("DELETE_PROFILE_API ERROR:", error);
    toast.error(error.response?.data?.message || "Failed to delete user.");
    throw error; 
  }
};