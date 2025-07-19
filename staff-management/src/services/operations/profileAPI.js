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
        
        return {
            success: true,
            profileData: response.data.profileData
        };
    } catch (error) {
        console.error("Profile API Error:", error);
        throw error;
    }
};
export const updateProfileData = async(token,editedData)=>{
    try{
        const response = await apiConnector(
            "PUT",
            updateEndpoints.UPDATE_PROFILE,
            {token,editedData},
            {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            { withCredentials: true }
        );
        if (!response.data.success) {
            throw new Error(response.data.message);
        }
        toast.success("Update Successful");
        return {
            success: true,
            profileData: response.data.profileData
        };


    }
    catch(e)
    {

    }
}