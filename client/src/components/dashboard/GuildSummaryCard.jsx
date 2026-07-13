import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '../ui/Card';
import { getGuildMeApi } from '../../services/social.api';
import { FaShieldAlt } from 'react-icons/fa';

const GuildSummaryCard = () => {
    const [guild, setGuild] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGuild = async () => {
            try {
                const res = await getGuildMeApi();
                if (res.success) {
                    setGuild(res.data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchGuild();
    }, []);

    return (
        <Card className="p-5 border-abyss-border/40 space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="font-fantasy text-sm font-bold text-white tracking-widest uppercase flex items-center space-x-2">
                    <FaShieldAlt className="text-abyss-gold" />
                    <span>Alliance Standing</span>
                </h3>
                <Link to="/guild" className="text-[10px] font-fantasy uppercase text-abyss-gold hover:underline">Scrolls</Link>
            </div>

            {loading ? (
                <div className="h-20 flex items-center justify-center"><span className="text-[10px] text-abyss-muted animate-pulse">Syncing scrolls...</span></div>
            ) : guild ? (
                <div className="space-y-3 text-xs">
                    <div className="flex justify-between items-center">
                        <span className="font-fantasy uppercase text-white font-bold tracking-wider">{guild.name}</span>
                        <span className="text-abyss-gold text-[10px] font-fantasy">Tier {guild.level}</span>
                    </div>
                    <div className="space-y-1 font-mono text-[10px] text-abyss-muted">
                        <div className="flex justify-between">
                            <span>Lobby Size</span>
                            <span className="text-white">{guild.members?.length} Members</span>
                        </div>
                        <div className="flex justify-between">
                            <span>XP Earned</span>
                            <span className="text-white">{guild.xp} / {guild.level * 1000}</span>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center py-4 space-y-2">
                    <p className="text-[11px] text-abyss-muted italic">Unbound to any alliance faction scrolls.</p>
                    <Link to="/guild" className="text-[10px] font-fantasy uppercase text-abyss-gold hover:underline block pt-1">Raise or Align Banners ➔</Link>
                </div>
            )}
        </Card>
    );
};

export default GuildSummaryCard;
