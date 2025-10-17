// import React from "react";

// interface LoadingProps {
//     message?: string;
//     size?: "sm" | "md" | "lg";
//     fullScreen?: boolean;
// }

// export const Loading: React.FC<LoadingProps> = ({
//     message = "Carregando...",
//     size = "md",
//     fullScreen = false,
// }) => {
//     const sizeClasses = {
//         sm: "w-8 h-8 border-2",
//         md: "w-12 h-12 border-3",
//         lg: "w-16 h-16 border-4",
//     };

//     const containerClasses = fullScreen
//         ? "fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50"
//         : "flex items-center justify-center min-h-screen w-full bg-gray-900/10";

//     return (
//         <div className={containerClasses}>
//             <div className="flex flex-col items-center gap-2 bg-white rounded-lg shadow-lg p-4">
//                 <div
//                     className={`${sizeClasses[size]} border-blue-500 border-t-transparent rounded-full animate-spin`}
//                 />
//                 {message && (
//                     <p className="text-gray-700 text-sm font-medium">
//                         {message}
//                     </p>
//                 )}
//             </div>
//         </div>
//     );
// };
import React from "react";

interface LoadingProps {
    message?: string;
    size?: "sm" | "md" | "lg";
    fullScreen?: boolean;
}

export const Loading: React.FC<LoadingProps> = ({
    message = "Carregando...",
    size = "md",
    fullScreen = false,
}) => {
    const sizeClasses = {
        sm: "w-8 h-8 border-2",
        md: "w-12 h-12 border-3",
        lg: "w-16 h-16 border-4",
    };

    const containerClasses = fullScreen
        ? "fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50"
        : "flex items-center justify-center min-h-screen w-full bg-gray-700/10";

    return (
        <div className={containerClasses}>
            <div className="flex flex-col items-center gap-3 bg-white rounded-lg shadow-lg p-6">
                <div
                    className={`${sizeClasses[size]} border-blue-500 border-t-transparent rounded-full animate-spin`}
                />
                {message && (
                    <p className="text-gray-700 text-sm font-medium">
                        {message}
                    </p>
                )}
            </div>
        </div>
    );
};
