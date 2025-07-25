import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/Forgot";
import DashboardLayout from "./components/core/Dashboard/DashboardLayout";
import OpenRoute from "./components/core/Auth/OpenRoute";
import PrivateRoute from "./components/core/Auth/PrivateRoute";
import { ACCOUNT_TYPE } from "./utils/constants";
import "./App.css";
import AddStaff from "./components/core/Dashboard/AddStaff/Index";
import MyProfile from "./components/core/Dashboard/MyProfile";
import NewLeave from "./components/core/Dashboard/NewLeave/Index";
import AllStaffs from "./components/core/Dashboard/AllStaffs/Index";
import Setting from "./components/core/Dashboard/Setting/Index";
import Staff from "./components/core/Dashboard/Staff/Index";

function App() {
    const user = { accountType: "Staff" };
    
    return (
        <div className="flex flex-col min-h-screen">
            <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />
                
                <Route
                    path="/login"
                    element={
                        <OpenRoute>
                            <Login />
                        </OpenRoute>
                    }
                />
                <Route
                    path="/signup"
                    element={
                        <OpenRoute>
                            <Signup />
                        </OpenRoute>
                    }
                />
                <Route
                    path="/forgot-password"
                    element={
                        <OpenRoute>
                            <ForgotPassword />
                        </OpenRoute>
                    }
                />
                
                {/* All dashboard routes */}
                <Route
                    element={
                        <PrivateRoute>
                            <DashboardLayout />
                        </PrivateRoute>
                    }
                >
                    <Route path="/dashboard/my-profile" element={<MyProfile />} />
                    <Route path="/dashboard/settings" element={<Setting />} />
                    
                    {user?.accountType === ACCOUNT_TYPE.STAFF && (
                        <>
                            <Route path="/dashboard/new-leave" element={<NewLeave />} />
                            <Route path="/dashboard/staff" element={<Staff />} />
                        </>
                    )}

                    {user?.accountType === ACCOUNT_TYPE.STAFF && (
                        <>
                            <Route path="/dashboard/add-staff" element={<AddStaff />} />
                            <Route path="/dashboard/all-staffs" element={<AllStaffs />} />
                        </>
                    )}
                </Route>
                
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </div>
    );
}

export default App;