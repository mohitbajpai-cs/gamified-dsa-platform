import React from 'react';

const AmbientParticles = () => {
    const particles = [
        { size: 'w-56 h-56', color: 'bg-abyss-primary/10', position: 'top-20 left-10' },
        { size: 'w-72 h-72', color: 'bg-purple-900/8', position: 'bottom-32 right-12' },
        { size: 'w-48 h-48', color: 'bg-abyss-gold/5', position: 'top-1/3 right-1/4' },
        { size: 'w-64 h-64', color: 'bg-blue-900/10', position: 'bottom-1/3 left-1/3' }
    ];

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            {particles.map((p, idx) => (
                <div
                    key={idx}
                    className={`
                        absolute rounded-full blur-[110px] animate-float ${p.size} ${p.color} ${p.position}
                    `}
                    style={{
                        animationDelay: `${idx * 1.8}s`,
                        animationDuration: `${12 + idx * 4}s`
                    }}
                ></div>
            ))}
        </div>
    );
};

export default AmbientParticles;
