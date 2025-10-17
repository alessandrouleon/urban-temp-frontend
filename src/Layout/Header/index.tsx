import { Menu } from "lucide-react";

interface HeaderProps {
    onOpenSidebar: () => void; // função para abrir sidebar no mobile
    title?: string; // título dinâmico
}

export default function Header({
    onOpenSidebar,
    title = "Dashboard",
}: HeaderProps) {
    return (
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
                {/* Botão para abrir menu no mobile */}
                <button
                    onClick={onOpenSidebar}
                    className="lg:hidden p-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-200 transition"
                >
                    <Menu size={22} />
                </button>
                <h1 className="text-lg font-semibold text-gray-700">{title}</h1>
            </div>

            {/* <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2">
                    <span className="text-sm text-gray-600">Olá, Saheb</span>
                    <div className="w-8 h-8 bg-blue-600 text-white flex items-center justify-center rounded-full">
                        <User size={16} />
                    </div>
                </div>
            </div> */}
        </header>
    );
}
