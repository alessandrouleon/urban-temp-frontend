import { useState } from "react";
import Footer from "../Footer";
import Header from "../Header";
import Sidebar from "../Sidebar";

interface MainLayoutProps {
    children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen flex bg-gray-100">
            {/* Sidebar */}
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

            {/* Overlay mobile */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0  bg-black/70 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Conteúdo */}
            <main className="flex-1 flex flex-col">
                <Header onOpenSidebar={() => setIsSidebarOpen(true)} />
                <div className="p-6">{children}</div>
                <Footer />
            </main>
        </div>
    );
}
