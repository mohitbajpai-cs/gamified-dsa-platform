import React from 'react';
import { motion } from 'framer-motion';
import { GiWizardStaff } from 'react-icons/gi';

const ErrorPage = ({ error, resetError }) => {
    return (
        <div className="min-h-screen bg-abyss-bg flex flex-col items-center justify-center p-6 text-center">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-abyss-danger text-6xl mb-6 filter drop-shadow-[0_0_12px_rgba(239,68,68,0.5)]"
            >
                <GiWizardStaff />
            </motion.div>
            <h1 className="font-fantasy text-4xl text-abyss-gold tracking-widest uppercase mb-4">
                A Rift in the Protocol
            </h1>
            <p className="font-sans text-abyss-muted max-w-md mb-8">
                The magical connection has ruptured. A structural fault was detected: 
                <span className="block mt-2 font-mono text-abyss-danger bg-black/30 p-3 rounded border border-abyss-border/40 text-sm">
                    {error?.message || 'Unknown Spell Interruption'}
                </span>
            </p>
            <button
                onClick={() => {
                    if (resetError) resetError();
                    window.location.href = '/dashboard';
                }}
                className="bg-abyss-primary hover:bg-abyss-primary/80 text-white font-fantasy tracking-widest uppercase px-6 py-3 rounded-lg border border-abyss-gold/20 shadow-glow-primary transition-all duration-300"
            >
                Mend the Rift
            </button>
        </div>
    );
};

export default ErrorPage;
