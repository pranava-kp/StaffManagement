//To prevent logged in users to access this route

import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const OpenRoute = ({ children }) => {
    const { token } = useSelector((state) => state.auth);

    return !token ? children : <Navigate to="/dashboard/my-profile" />;
};

export default OpenRoute;
