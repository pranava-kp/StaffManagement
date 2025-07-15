import { ACCOUNT_TYPE } from "../utils/constants";
export const sidebarLinks = [
    {
        id: 1,
        name: "Dashboard",
        path: "/dashboard/staff",
        type: ACCOUNT_TYPE.STAFF,
        icon: "VscDashboard",
    },
    {
        id: 2,
        name: "My Profile",
        path: "/dashboard/my-profile",
        icon: "VscAccount",
    },
    {
        id: 3,
        name: "New Leave",
        path: "/dashboard/new-leave",
        type: ACCOUNT_TYPE.STAFF,
        icon: "VscRepo",
    },
    {
        id: 4,
        name: "Add Staff",
        path: "/dashboard/add-staff",
        type: ACCOUNT_TYPE.ADMIN,
        icon: "VscPersonAdd",
    },
    {
        id: 5,
        name: "All Staffs",
        path: "/dashboard/all-staffs",
        type: ACCOUNT_TYPE.ADMIN,
        icon: "VscOrganization",
    },
];
