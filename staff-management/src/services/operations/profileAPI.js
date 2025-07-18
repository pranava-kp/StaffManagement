import { apiConnector } from "../apiConnector";
import { endpoints } from "../apis";

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