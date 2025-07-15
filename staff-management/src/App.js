import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Navbar from "./components/common/Navbar";
import Dashboard from "./pages/Dashboard";
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
    const user = {accountType:"Staff"}
    return (
        <div>
            <Navbar />
            <Routes>
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
                    element={
                        <PrivateRoute>
                            <Dashboard />
                        </PrivateRoute>
                    }
                >
                    <Route
                        path="/dashboard/my-profile"
                        element={<MyProfile />}
                    />
                    <Route path="/dashboard/settings" element={<Setting/>} />
                    {user?.accountType === ACCOUNT_TYPE.STAFF && (
                        <>
                            <Route
                                path="/dashboard/new-leave"
                                element={<NewLeave />}
                            />
                            <Route
                                path="/dashboard/staff"
                                element={<Staff />}
                            />
                        </>
                    )}

                    {user?.accountType === ACCOUNT_TYPE.STAFF && (
                        <>
                            <Route
                                path="/dashboard/add-staff"
                                element={<AddStaff />}
                            />
                            <Route
                                path="/dashboard/all-staffs"
                                element={<AllStaffs />}
                            />
                        </>
                    )}
                </Route>
            </Routes>
        </div>
    );
}

export default App;
