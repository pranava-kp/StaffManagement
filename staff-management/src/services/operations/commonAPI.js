import { userEndpoints } from "../apis";
import { apiConnector } from "../apiConnector";

const { GET_ALL_USER } = userEndpoints;

export async function getAllUsers(token) {
    try {
        const response = await apiConnector("GET", GET_ALL_USER, null, {
            Authorization: `Bearer ${token}`,
        });
        if (!response.data.success) {
            throw new Error(response.data.message);
        }
        return response.data;
    } catch (error) {
        console.log(error);
    }
}
