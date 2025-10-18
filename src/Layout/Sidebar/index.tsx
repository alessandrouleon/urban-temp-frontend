import {
    FileText,
    Home,
    Layers,
    LayoutGrid,
    Map,
    Settings,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
    const location = useLocation();

    const menuItems = [
        { icon: Home, label: "Home", path: "/" },
        { icon: LayoutGrid, label: "Dashboard", path: "/dashboard" },
        { icon: Map, label: "Map", path: "/maps" },
        { icon: Settings, label: "Setting", path: "/setting" },
        { icon: Layers, label: "Log", path: "/log" },
        { icon: FileText, label: "Report", path: "/report" },
    ];

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/20 bg-opacity-50 z-[99998] lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}
            <aside
                className={`
                fixed inset-y-0 left-0 z-[99999] flex flex-col
                bg-blue-500 text-white shadow-lg
                transition-all duration-300 ease-in-out
                w-56
                ${isOpen ? "translate-x-0" : "-translate-x-full"}
                lg:translate-x-0 lg:static lg:w-56
            `}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-blue-500">
                    <div className="flex items-center gap-2">
                        <div className="w-15 h-8 bg-blue-800 rounded flex items-center justify-center text-sm font-bold">
                            Clima
                        </div>
                        <span
                            className={`font-semibold ${
                                isOpen ? "block" : "hidden"
                            } lg:block`}
                        >
                            Tempo
                        </span>
                    </div>

                    {/* Botão para fechar no mobile */}
                    <button
                        onClick={() => setIsOpen(false)}
                        className="lg:hidden p-1 hover:bg-blue-500 rounded"
                    >
                        ✕
                    </button>
                </div>

                {/* Menu Items */}
                <nav className="flex-1 py-6 overflow-y-auto">
                    <ul className="space-y-2 px-3">
                        {menuItems.map((item, index) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <li key={index}>
                                    <Link
                                        to={item.path}
                                        className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                                            isActive
                                                ? "bg-blue-700"
                                                : "hover:bg-blue-500"
                                        }`}
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <item.icon size={20} />
                                        <span
                                            className={`text-sm ${
                                                isOpen ? "block" : "hidden"
                                            } lg:block`}
                                        >
                                            {item.label}
                                        </span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* User Profile */}
                {/* <div className="p-4 border-t border-blue-500">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-800 rounded-full flex items-center justify-center flex-shrink-0">
                            <User size={20} />
                        </div>
                        <div
                            className={`${
                                isOpen ? "block" : "hidden"
                            } lg:block`}
                        >
                            <p className="text-sm font-medium">Saheb</p>
                            <p className="text-xs text-blue-200 truncate">
                                saheb@gmail.com
                            </p>
                        </div>
                    </div>
                </div> */}
            </aside>
        </div>
    );
}
