import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const pageInfo: Record<string, { title: string; subtitle: string }> = {
    "/": {
        title: "Dashboard",
        subtitle: "Overview of your business operations",
    },
    "/products": {
        title: "Products",
        subtitle: "Manage your product catalog and inventory",
    },
    "/orders": {
        title: "Orders",
        subtitle: "Track and manage customer orders",
    },
    "/orders/create": {
        title: "Create Order",
        subtitle: "Create a new customer order",
    },
};

export default function AppLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();

    const currentPage =
        pageInfo[location.pathname] ?? {
            title: "Order Details",
            subtitle: "View order information and status",
        };

    return (
        <div className="app-shell">
            <Sidebar
                open={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <div className="main-area">
                <Topbar
                    title={currentPage.title}
                    subtitle={currentPage.subtitle}
                    onMenuClick={() => setSidebarOpen(true)}
                />

                <main className="page-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}