import React from 'react';
import QuestCard from '../../components/dashboard/QuestCard';
import { motion } from 'framer-motion';

const Quests = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 lg:space-y-8"
        >
            <div>
                <h1 className="font-fantasy text-3xl font-bold text-white tracking-widest uppercase">Quests Log</h1>
                <p className="font-sans text-xs text-abyss-muted">Chronicle daily and weekly task completions to claim gold bounties.</p>
            </div>
            
            <div className="max-w-4xl">
                <QuestCard />
            </div>
        </motion.div>
    );
};

export default Quests;
