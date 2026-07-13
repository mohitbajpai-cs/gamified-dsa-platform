import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GiGargoyle } from 'react-icons/gi';
import { ROUTES } from '../constants/routes';

const UnauthorizedPage = () => {
    return (
        <div className="min-h-screen bg-abyss-bg flex flex-col items-center justify-center p-6 text-center">
            <motion.div
                initial={{ rotateY: 180, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="text-abyss-danger text-7xl mb-6 filter drop-shadow-[0_0_12px_rgba(239,68,68,0.5)]"
            >
                <GiGargoyle />
            </motion.div>
            <h1 className="font-fantasy text-4xl text-abyss-gold tracking-widest uppercase mb-4">
                Access Forbidden
            </h1>
            <p className="font-sans text-abyss-muted max-w-md mb-8">
                The gargoyles guard this gateway. Only users certified with Admin clearances may cross the seal.
            </p>
            <Link
                to={ROUTES.DASHBOARD}
                className="bg-abyss-card hover:bg-abyss-hover text-abyss-gold font-fantasy tracking-widest uppercase px-6 py-3 rounded-lg border border-abyss-gold/30 hover:border-abyss-gold transition-all duration-300"
            >
                Return to Safety
            </Link>
        </div>
    );
};

export default UnauthorizedPage;
