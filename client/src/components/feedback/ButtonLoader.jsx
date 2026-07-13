import React from 'react';
import { motion } from 'framer-motion';
import { FaCircleNotch } from 'react-icons/fa';

const ButtonLoader = () => {
    return (
        <div className="flex items-center justify-center space-x-2">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="text-current text-lg"
            >
                <FaCircleNotch />
            </motion.div>
            <span className="font-sans uppercase text-sm tracking-wider">Casting Spell...</span>
        </div>
    );
};

export default ButtonLoader;
