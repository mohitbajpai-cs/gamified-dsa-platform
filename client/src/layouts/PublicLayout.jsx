import React from 'react';
import { Outlet } from 'react-router-dom';
import AmbientParticles from '../components/shared/AmbientParticles';

const PublicLayout = () => {
    return (
        <div className="min-h-screen bg-abyss-bg text-white flex flex-col justify-between selection:bg-abyss-primary/40 selection:text-white relative bg-[radial-gradient(ellipse_at_top,rgba(21,27,45,0.7),var(--color-abyss-bg))]">
            {/* Ambient Background Particles */}
            <AmbientParticles />
            
            <main className="flex-1 flex flex-col z-10 relative">
                <Outlet />
            </main>
        </div>
    );
};

export default PublicLayout;
