import { Route, Routes } from "react-router-dom";
import MainLayout from "../Layout/MainLayout";
import { Dashboard } from "../pages/Dashboard";
import { Home } from "../pages/Home";
import { Log } from "../pages/Log";
import { PageMaps } from "../pages/Maps";
import { Report } from "../pages/Report";
import { Setting } from "../pages/Setting";

export function AppRoutes() {
    return (
        <MainLayout>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/maps" element={<PageMaps />} />
                <Route path="/setting" element={<Setting />} />
                <Route path="/log" element={<Log />} />
                <Route path="/report" element={<Report />} />
            </Routes>
        </MainLayout>
    );
}
