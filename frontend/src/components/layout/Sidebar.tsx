import { NavLink } from "react-router-dom";
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    ClipboardList,
    X,
} from "lucide-react";

interface SidebarProps {
    open: boolean;
    onClose: () => void;
}

const navigation = [
    {
        label: "Dashboard",
        path: "/",
        icon: LayoutDashboard,
    },
    {
        label: "Products",
        path: "/products",
        icon: Package,
    },
    {
        label: "Create Order",
        path: "/orders/create",
        icon: ShoppingCart,
    },
    {
        label: "Orders",
        path: "/orders",
        icon: ClipboardList,
    },
];

export default function Sidebar({ open, onClose }: SidebarProps) {
    return (
        <>
            {open && (
                <div
                    className="sidebar-overlay"
                    onClick={onClose}
                />
            )}

            <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
                <div className="sidebar-brand">
                    <div className="brand-icon">
                        <Package size={22} />
                    </div>

                    <div>
                        <h2>OrderFlow</h2>
                        <span>Management System</span>
                    </div>

                    <button
                        className="sidebar-close"
                        onClick={onClose}
                        aria-label="Close navigation"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="sidebar-section-label">
                    WORKSPACE
                </div>

                <nav className="sidebar-nav">
                    {navigation.map((item) => {
                        const Icon = item.icon;

                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end={item.path === "/" || item.path === "/orders"}
                                onClick={onClose}
                                className={({ isActive }) =>
                                    `nav-link ${isActive ? "active" : ""}`
                                }
                            >
                                <Icon size={19} />
                                <span>{item.label}</span>
                            </NavLink>
                        );
                    })}
                </nav>

                <div className="sidebar-bottom">
                    <div className="sidebar-status">
                        <span className="status-dot" />
                        <div>
                            <strong>System Workspace</strong>
                            <span>Operations dashboard</span>
                        </div>
                    </div>

                    <div className="sidebar-version">
                        OrderFlow · v1.0
                        by magd-basim
                    </div>
                </div>
            </aside>
        </>
    );
}