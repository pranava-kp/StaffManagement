const BASE_URL = process.env.REACT_APP_BASE_URL;
// console.log(BASE_URL);

// AUTH ENDPOINTS
export const endpoints = {
    SIGNUP_API: BASE_URL + "/signup",
    LOGIN_API: BASE_URL + "/login",
    GENERATE_OTP: BASE_URL + "/generate-otp",
    PROFILE_API: "/profile",
    GET_PROFILE_BY_EMAIL: BASE_URL + "/profile-by-email",
};

// PROFILE IMAGE ENDPOINTS
export const imageDetails = {
    UPLOAD_IMAGE: BASE_URL + "/imageupload",
    GET_ALL_IMAGE: BASE_URL + "/getallimage",
    IMAGE_COUNT: BASE_URL + "/increasecount",
}

// LEAVE ENDPOINTS
export const leaveEndpoints = {
    CREATE_LEAVE: BASE_URL + "/createLeave",
    GET_ALL_USER_LEAVES: BASE_URL + "/get-all-leaves",
    GRANT_USER_LEAVE:BASE_URL+"/update-leave-status",
    GET_REMAINING_LEAVES: BASE_URL + "/get-remaining-leaves",
}

export const userEndpoints = {
    GET_ALL_USER: BASE_URL + "/getAllUser",
}

//UPDATE ENDPOINTS
export const updateEndpoints = {
    UPDATE_PROFILE: "/update-profile",       // For users updating their own profile
    ADMIN_UPDATE_PROFILE: "/admin-update-profile"
};

// DELETE ENDPOINTS
export const deleteEndpoints = {
    DELETE_PROFILE: BASE_URL + "/delete-user"
}