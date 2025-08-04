export const sidebarLinks = [
    {
        id: 1,
        name: "Dashboard",
        path: "/dashboard/staff",
        icon: "VscDashboard",
        roles: ["HOD", "Principal", "Staff"], 
    },
    {
        id: 2,
        name: "My Profile",
        path: "/dashboard/my-profile",
        icon: "VscAccount",
        roles: ["Admin", "HOD", "Principal", "Staff"],
    },
    {
        id: 3,
        name: "New Leave",
        path: "/dashboard/new-leave",
        icon: "VscRepo",
        roles: ["HOD", "Staff"], 
    },
    {
        id: 4,
        name: "Add Staff",
        path: "/dashboard/add-staff",
        icon: "VscPersonAdd",
        roles: ["Admin", "Principal", "HOD"],
    },
    {
        id: 5,
        name: "All Staffs",
        path: "/dashboard/all-staffs",
        icon: "VscOrganization",
        roles: ["Admin", "Principal", "HOD"],
    },
];
