import React from 'react';
import { motion } from 'framer-motion';

const Card = ({ children, className = '', hoverEffect = true, onClick }) => {
    const Component = motion.div;
    const hoverProps = hoverEffect ? {
        whileHover: { 
            y: -5, 
            borderColor: 'rgba(124, 58, 237, 0.4)',
            boxShadow: '0 12px 32px rgba(124, 58, 237, 0.15)' 
        },
        initial: { y: 0 },
        transition: { type: 'spring', stiffness: 300, damping: 20 }
    } : {};

    return (
        <Component
            {...hoverProps}
            onClick={onClick}
            className={`
                bg-abyss-card/50 backdrop-blur-lg border border-abyss-border/45 rounded-2xl p-6 shadow-glow-primary/5
                relative overflow-hidden group transition-colors duration-300
                ${onClick ? 'cursor-pointer' : ''}
                ${className}
            `}
        >
            {/* Glowing glassmorphism corner reflections */}
            <div className="absolute top-0 left-0 w-16 h-[1px] bg-gradient-to-r from-transparent via-abyss-primary/30 to-transparent group-hover:via-abyss-primary transition-all duration-300"></div>
            <div className="absolute top-0 left-0 w-[1px] h-16 bg-gradient-to-b from-transparent via-abyss-primary/30 to-transparent group-hover:via-abyss-primary transition-all duration-300"></div>
            
            {children}
        </Component>
    );
};

export default Card;
