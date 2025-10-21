import React from "react";

interface LoadingProgressProps {
    current: number;
    total: number;
    message?: string;
}

export const LoadingProgress: React.FC<LoadingProgressProps> = ({
    current,
    total,
    message = "Carregando dados...",
}) => {
    const percentage = Math.round((current / total) * 100);

    return (
        <div className="w-full max-w-5xl mx-auto bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-center h-96">
                <div className="text-center w-full max-w-md">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>

                    <p className="text-gray-700 font-medium mb-2">{message}</p>

                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                        <div
                            className="bg-purple-600 h-2.5 rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                        ></div>
                    </div>

                    <p className="text-sm text-gray-500">
                        {current} de {total} bairros ({percentage}%)
                    </p>

                    <p className="text-xs text-gray-400 mt-4">
                        ⏱️ Isso pode levar alguns segundos...
                    </p>
                </div>
            </div>
        </div>
    );
};
