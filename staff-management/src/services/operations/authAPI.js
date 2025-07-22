import { toast } from "react-hot-toast";
import { setLoading, setToken } from "../slices/authSlice";
import { endpoints } from "../apis";
import { apiConnector } from "../apiConnector";

const { SIGNUP_API, LOGIN_API, ADD_USER_API } = endpoints;

// Helper function for consistent toast handling
const showToast = (type, message, toastId = null, duration = 3000) => {
  const options = { duration };
  if (toastId) options.id = toastId;
  
  if (type === 'loading') {
    return toast.loading(message, options);
  }
  toast[type](message, options);
};

export const signUp = (firstName, lastName, email, password, navigate) => {
  return async (dispatch) => {
    const toastId = showToast('loading', "Creating account...");
    dispatch(setLoading(true));
    
    try {
      const response = await apiConnector("POST", SIGNUP_API, {
        firstName,
        lastName,
        email,
        password,
      });

      if (!response.data.success) {
        throw new Error(response.data.message);
      }

      showToast('success', "Signup successful!", toastId);
      navigate("/login");
    } catch (error) {
      showToast('error', error.message || "Signup failed", toastId);
      console.error("Signup error:", error);
    } finally {
      dispatch(setLoading(false));
    }
  };
};

export const login = (email, password, navigate) => {
  return async (dispatch) => {
    const toastId = showToast('loading', "Logging in...");
    dispatch(setLoading(true));
    
    try {
      const response = await apiConnector("POST", LOGIN_API, {
        email,
        password,
      });

      if (!response.data.success) {
        throw new Error(response.data.message);
      }

      dispatch(setToken(response.data.token));
      localStorage.setItem("token", JSON.stringify(response.data.token));
      showToast('success', "Login successful!", toastId);
      navigate("/dashboard/my-profile");
    } catch (error) {
      showToast('error', error.message || "Login failed", toastId);
      console.error("Login error:", error);
    } finally {
      dispatch(setLoading(false));
    }
  };
};

export const logout = (navigate) => {
  return (dispatch) => {
    dispatch(setToken(null));
    localStorage.removeItem("token");
    showToast('success', "Logged out successfully");
    navigate("/login");
  };
};

export const addUser = (formData, token, resetForm) => {
  return async (dispatch) => {
    const toastId = showToast('loading', "Creating user...");
    dispatch(setLoading(true));
    
    try {
      const response = await apiConnector(
        "POST",
        ADD_USER_API || `${process.env.REACT_APP_BASE_URL}/add-user`,
        formData,
        {
          Authorization: `Bearer ${token}`,
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.message);
      }

      showToast('success', response.data.message || "User created successfully", toastId);
      
      if (typeof resetForm === 'function') {
        resetForm();
      }
      
      return response.data; // Return data for component to use if needed
    } catch (error) {
      showToast('error', error.response?.data?.message || error.message || "Failed to create user", toastId);
      console.error("Add user error:", error);
      throw error; // Re-throw for component to handle if needed
    } finally {
      dispatch(setLoading(false));
    }
  };
};