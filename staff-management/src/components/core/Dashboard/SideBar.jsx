import React from "react";

import { sidebarLinks } from "../../../data/dashboard-links";
import SidebarLink from "./SidebarLink";
import { useSelector } from 'react-redux';
import { getTokenPayload } from '../../../utils/jwtUtils'; 



const Sidebar = ({ onClose }) => {
   
    

    const { token } = useSelector(state => state.auth);
    let userRole = '';

    if (token) {
        const rawToken = token.replace(/^"|"$/g, "");
        const userPayload = getTokenPayload(rawToken);
        userRole = userPayload?.accountType;
    }

    return (
        <div className="flex min-w-[222px] flex-col border-r-[1px] border-r-richblack-700 h-[calc(100vh-3.5rem)] bg-rnsit-blue py-10">
            <div className="flex flex-col">
                {sidebarLinks.map((link) => {
                    
                    const shouldRender = (link.roles && link.roles.includes(userRole)) || !link.roles;

                    if (shouldRender) {
                        return (
                            <SidebarLink
                                key={link.id}
                                link={link}
                                iconName={link.icon}
                                onClick={onClose}
                            />
                        );
                    }
                    return null;
                })}
            </div>
          
            <div className="h-[1px] my-6 w-10/12 bg-richblack-600"></div>
            <div className="flex flex-col gap-4">
              
                <SidebarLink
                    link={{ name: "Settings", path: "/dashboard/settings" }}
                    iconName={"VscSettingsGear"}
                    onClick={onClose}
                />
            </div>
            
        </div>
    );
};

export default Sidebar;