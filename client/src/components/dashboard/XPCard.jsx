import React from 'react';
import Card from '../ui/Card';
import XpProgressBar from '../ui/XpProgressBar';
import { GiUpgrade } from 'react-icons/gi';

const XPCard = ({ xp = 0, nextLevelXp = 100 }) => {
    return (
        <Card className="flex flex-col justify-between">
            <div className="flex justify-between items-center mb-3">
                <h4 className="font-fantasy text-sm text-abyss-gold tracking-widest uppercase">Experience</h4>
                <GiUpgrade className="text-purple-400 text-lg" />
            </div>
            <XpProgressBar current={xp} max={nextLevelXp} />
        </Card>
    );
};

export default XPCard;
