import React from 'react';
import Card from './Card';

const StatCard = ({ label, value, icon: Icon, colorClass = 'text-abyss-gold' }) => {
    return (
        <Card className="flex items-center justify-between">
            <div>
                <p className="text-abyss-muted text-xs uppercase tracking-widest mb-1">{label}</p>
                <h3 className={`font-fantasy text-2xl font-bold ${colorClass}`}>{value}</h3>
            </div>
            {Icon && (
                <div className={`p-3 rounded-lg bg-abyss-bg/60 border border-abyss-border/40 ${colorClass}`}>
                    <Icon className="text-2xl" />
                </div>
            )}
        </Card>
    );
};

export default StatCard;
