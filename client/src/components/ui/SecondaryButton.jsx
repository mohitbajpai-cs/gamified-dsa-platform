import React from 'react';
import { motion } from 'framer-motion';

const SecondaryButton = ({ children, onClick, type = 'button', disabled = false, className = '' }) => {
    return (
        <motion.button
            whileHover={disabled ? {} : { y: -2, scale: 1.03 }}
            whileTap={disabled ? {} : { scale: 0.97 }}
            type={type}
            disabled={disabled}
            onClick={onClick}
            className={`
                px-6 py-2.5 rounded-lg font-fantasy tracking-widest uppercase text-sm font-semibold
                bg-abyss-card/80 hover:bg-abyss-hover/90 text-abyss-gold
                border border-abyss-gold/20 hover:border-abyss-gold/50 shadow-glow-gold/10
                transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                relative overflow-hidden group
                ${className}
            `}
        >
            {/* Ambient Shine Sweep */}
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shine pointer-events-none"></span>
            
            <span className="relative z-10">{children}</span>
        </motion.button>
    );
};

export default SecondaryButton;
