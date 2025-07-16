import React, {useState} from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { sidebarLinks } from "../../../data/dashboard-links";
import SidebarLink from "../Dashboard/SidebarLink";
import { logout } from "../../../services/operations/authAPI";
// import { useSelector } from "react-redux";
import { VscSignOut } from "react-icons/vsc";
import ConfirmationModal from "../../common/ConfirmationModal";

const SideBar = () => {
    // const { user, loading: profileLoading } = useSelector(
    //     (state) => state.profile
    // );

    //  TO DELETE
    // const user = { accountType: "Staff"}
    const profileLoading = false;

    // const { loading: authLoading } = useSelector((state) => state.auth);
    const authLoading = false;
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [confirmationModal, setConfirmationModal] = useState(null);

    if (authLoading || profileLoading) {
        return (
            <div className="flex items-center justify-center w-full h-full">
                <div className="spinner">loading...</div>
            </div>
        );
    }
    //console.log("User Value:" ,user)
    return (
        <div className="text-orange-500">
            <div className="flex min-w-[222px] flex-col border-r-[1px] border-r-richblack-700 h-[calc(100vh-3.5rem)] bg-rnsit-blue py-10">
                <div className=" flex flex-col">
                    {sidebarLinks.map((link) => {
                        // if (link.type && user?.accountType !== link.type)
                        //     return null;
                        return (
                            <SidebarLink
                                key={link.id}
                                link={link}
                                iconName={link.icon}
                            />
                        );
                    })}
                </div>
                <div className="h-[1px] my-6 w-10/12 bg-richblack-600"></div>
                <div className="flex flex-col gap-4">
                    {/* Setting */}
                    <SidebarLink
                        link={{ name: "Settings", path: "/dashboard/settings" }}
                        iconName={"VscSettingsGear"}
                    />
                    {/* Logout */}
                    <button
                        onClick={() => {
                            setConfirmationModal({
                                text1: "Are you sure ?",
                                text2: "You will be logged out of your Account.",
                                btn1Text: "Logout",
                                btn2Text: "Cancel",
                                btn1Handler: () => {
                                    dispatch(logout(navigate));
                                },
                                btn2Handler: ()=>{
                                    setConfirmationModal(null)
                                }
                            });
                        }}
                        className="text-sm font-medium text-richblack-300"
                    >
                        <div className="flex items-center gap-x-2 px-8 py-2">
                            <VscSignOut className="text-lg"/>
                            <span>Logout</span>
                        </div>
                    </button>
                </div>
            </div>
            {confirmationModal && <ConfirmationModal modalData={confirmationModal}/>}
        </div>
    );
};

export default SideBar;
