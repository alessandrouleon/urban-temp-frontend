// src/components/charts/CustomTooltip.tsx
import React from "react";

interface TooltipPayload {
    color: string;
    name: string;
    value: number;
    dataKey: string;
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: TooltipPayload[];
    label?: string;
}

export const CustomTooltip: React.FC<CustomTooltipProps> = ({
    active,
    payload,
    label,
}) => {
    if (!active || !payload || payload.length === 0) {
        return null;
    }

    return (
        <div className="bg-gray-800 text-white p-3 rounded-lg shadow-lg border border-gray-600">
            <p className="font-semibold mb-2">{label}</p>
            {payload.map((entry, index) => (
                <p
                    key={index}
                    style={{ color: entry.color }}
                    className="text-sm"
                >
                    {entry.name}:{" "}
                    <span className="font-bold">{entry.value.toFixed(1)}</span>
                    {entry.name.includes("Temperatura") ? "°C" : "%"}
                </p>
            ))}
        </div>
    );
};
