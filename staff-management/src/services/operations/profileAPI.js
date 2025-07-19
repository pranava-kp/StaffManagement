import { apiConnector } from "../apiConnector";
import { endpoints } from "../apis";
import { updateEndpoints } from "../apis";
import { toast } from "react-hot-toast";

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