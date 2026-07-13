import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import AmbientParticles from '../components/shared/AmbientParticles';

const DashboardLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setSidebarOpen(prev => !prev);
    };

    return (
        <div className="min-h-screen bg-abyss-bg text-white flex overflow-hidden selection:bg-abyss-primary/40 selection:text-white relative bg-[radial-gradient(ellipse_at_top,rgba(21,27,45,0.7),var(--color-abyss-bg))]">
            {/* Ambient Background Particles */}
            <AmbientParticles />

            {/* Sidebar Navigation */}
            <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-y-auto z-10 relative">
                <Navbar toggleSidebar={toggleSidebar} />
                
                <main className="flex-grow p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-8">
                    <Outlet />
                </main>
                
                <Footer />
            </div>
        </div>
    );
};

export default DashboardLayout;
