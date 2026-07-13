import React from 'react';
import Card from '../ui/Card';
import PrimaryButton from '../ui/PrimaryButton';
import RealmProgress from '../worlds/RealmProgress';
import BossBadge from '../worlds/BossBadge';
import { GiPortal, GiEmerald } from 'react-icons/gi';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';

const RealmPreview = ({ nextRealm, progressPercentage }) => {
    const navigate = useNavigate();
    
    const realm = nextRealm || {
        name: 'Arrays Dungeons',
        difficulty: 'beginner',
        completedProblems: 0,
        totalProblems: 9,
        bossUnlocked: false
    };

    return (
        <Card className="flex flex-col justify-between border-abyss-primary/20 h-full">
            <div>
                <h4 className="font-fantasy text-xs text-abyss-gold tracking-widest uppercase mb-4">Current Destination</h4>
                
                {/* Artwork Placeholder */}
                <div className="relative h-32 bg-gradient-to-t from-abyss-card to-black rounded-lg overflow-hidden border border-abyss-border/40 mb-4 flex items-center justify-center">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.12),transparent)]"></div>
                    <GiEmerald className="text-abyss-primary text-4xl filter drop-shadow-[0_0_10px_rgba(124,58,237,0.4)] animate-pulse" />
                    
                    <div className="absolute top-2 right-2">
                        <BossBadge unlocked={realm.bossUnlocked} />
                    </div>
                </div>

                <div className="space-y-3.5">
                    <div className="flex justify-between items-center">
                        <h3 className="font-fantasy text-lg font-bold text-white uppercase tracking-wide">
                            {realm.name}
                        </h3>
                        <span className="text-[9px] uppercase font-fantasy border border-abyss-border px-1.5 py-0.5 rounded tracking-widest text-abyss-muted bg-abyss-bg/60">
                            {realm.difficulty}
                        </span>
                    </div>

                    {/* Progress */}
                    <RealmProgress completed={realm.completedProblems} total={realm.totalProblems || 9} />
                </div>
            </div>

            <div className="mt-5">
                <PrimaryButton
                    onClick={() => navigate(ROUTES.WORLDS)}
                    className="w-full text-center"
                >
                    Continue Journey
                </PrimaryButton>
            </div>
        </Card>
    );
};

export default RealmPreview;
