import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GiCastleRuins } from 'react-icons/gi';
import { ROUTES } from '../constants/routes';

const NotFound = () => {
    return (
        <div className="min-h-screen bg-abyss-bg flex flex-col items-center justify-center p-6 text-center">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="text-abyss-gold text-7xl mb-6 filter drop-shadow-[0_0_12px_rgba(212,175,55,0.5)] animate-pulse"
            >
                <GiCastleRuins />
            </motion.div>
            <h1 className="font-fantasy text-4xl text-white tracking-widest uppercase mb-4">
                Realm Lost
            </h1>
            <p className="font-sans text-sm text-abyss-muted max-w-md mb-8 leading-relaxed">
                The coordinates you entered point to an unexplored void outside the protocol mapping database.
            </p>
            <Link
                to={ROUTES.DASHBOARD}
                className="bg-abyss-primary hover:bg-abyss-primary/80 text-white font-fantasy tracking-widest uppercase px-6 py-3 rounded-lg border border-abyss-gold/20 shadow-glow-primary transition-all duration-300"
            >
                Recall Command
            </Link>
        </div>
    );
};

export default NotFound;
