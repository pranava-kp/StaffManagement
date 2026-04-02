import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: "http://localhost:2000/api/v1", // Base URL for all requests
  withCredentials: true, // Required for cookies/auth
});

export const apiConnector = (method, url, bodyData, headers, params) => {
  return axiosInstance({
    method,
    url,
    data: bodyData || null,
    // If bodyData is FormData, let Axios handle the Content-Type automatically
    headers: bodyData instanceof FormData ? { ...headers } : {
      "Content-Type": "application/json", // Default headers for normal requests
      ...headers, // Merge custom headers
    },
    params: params || null,
  });
};