import React from 'react';
import { motion } from 'framer-motion';
import { GiGothicCross } from 'react-icons/gi';

const FullPageLoader = () => {
    return (
        <div className="fixed inset-0 bg-abyss-bg flex flex-col items-center justify-center z-50">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                className="text-abyss-gold text-5xl mb-4 filter drop-shadow-[0_0_8px_rgba(212,175,55,0.6)]"
            >
                <GiGothicCross />
            </motion.div>
            <motion.p
                initial={{ opacity: 0.3 }}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="font-fantasy text-abyss-gold text-lg tracking-widest uppercase"
            >
                Connecting to the Abyss...
            </motion.p>
        </div>
    );
};

export default FullPageLoader;
