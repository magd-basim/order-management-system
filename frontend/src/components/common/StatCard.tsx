import type { ReactNode } from "react";

interface StatCardProps {
    title: string;
    value: string | number;
    description: string;
    icon: ReactNode;
    color: "purple" | "blue" | "green" | "orange";
}

export default function StatCard({
    title,
    value,
    description,
    icon,
    color,
}: StatCardProps) {
    return (
        <div className="stat-card">
            <div className="stat-card-top">
                <span>{title}</span>

                <div className={`stat-icon ${color}`}>
                    {icon}
                </div>
            </div>

            <div className="stat-value">
                {value}
            </div>

            <div className="stat-description">
                {description}
            </div>
        </div>
    );
}