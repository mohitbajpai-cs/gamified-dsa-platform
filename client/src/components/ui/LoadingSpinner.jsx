import React from 'react';
import { motion } from 'framer-motion';
import { GiSpinningSword } from 'react-icons/gi';

const LoadingSpinner = ({ size = 'md' }) => {
    const sizeClasses = {
        sm: 'text-xl',
        md: 'text-3xl',
        lg: 'text-5xl'
    };

    return (
        <div className="flex justify-center items-center py-4">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                className={`text-abyss-gold filter drop-shadow-[0_0_8px_rgba(212,175,55,0.4)] ${sizeClasses[size] || sizeClasses.md}`}
            >
                <GiSpinningSword />
            </motion.div>
        </div>
    );
};

export default LoadingSpinner;
