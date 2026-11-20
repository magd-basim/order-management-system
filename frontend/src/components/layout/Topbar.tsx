import { Menu, Search } from "lucide-react";

interface TopbarProps {
    onMenuClick: () => void;
    title: string;
    subtitle: string;
}

export default function Topbar({
    onMenuClick,
    title,
    subtitle,
}: TopbarProps) {
    return (
        <header className="topbar">
            <div className="topbar-left">
                <button
                    className="menu-button"
                    onClick={onMenuClick}
                    aria-label="Open navigation"
                >
                    <Menu size={22} />
                </button>

                <div>
                    <h1>{title}</h1>
                    <p>{subtitle}</p>
                </div>
            </div>

            <div className="topbar-right">
                <div className="topbar-search">
                    <Search size={17} />
                    <span>Search workspace</span>
                    <kbd>⌘ K</kbd>
                </div>

                <div className="user-avatar">
                    A
                </div>
            </div>
        </header>
    );
}