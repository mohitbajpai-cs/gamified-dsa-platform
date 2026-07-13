import React from 'react';
import Card from '../ui/Card';
import { GiGothicCross } from 'react-icons/gi';

const ActivityCard = ({ activities }) => {
    const list = activities || [
        { id: 1, text: 'Defeated Array Knight I', time: '2 hours ago', type: 'solve' },
        { id: 2, text: 'Breached the Linked Lists World Gate', time: 'Yesterday', type: 'unlock' },
        { id: 3, text: 'Encountered the Array Behemoth', time: '3 days ago', type: 'boss' }
    ];

    return (
        <Card className="flex flex-col justify-between">
            <h4 className="font-fantasy text-xs text-abyss-gold tracking-widest uppercase mb-3">Chronicles of Activity</h4>
            
            <div className="space-y-3.5">
                {list.map((act) => (
                    <div key={act.id} className="flex items-center space-x-3 text-xs font-sans">
                        <GiGothicCross className="text-abyss-gold/60 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            <p className="text-white truncate">{act.text}</p>
                            <span className="text-[10px] text-abyss-muted">{act.time}</span>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
};

export default ActivityCard;
