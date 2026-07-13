import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    GiGothicCross, GiSwordsPower, GiSpellBook, GiPortal, 
    GiAngelWings, GiTrophy, GiScrollUnfurled, GiLevelEndFlag
} from 'react-icons/gi';
import { ROUTES } from '../constants/routes';

const Landing = () => {
    // Mock preview of game worlds
    const previewRealms = [
        { name: 'Arrays Dungeon', difficulty: 'Beginner', xp: '+500 XP', icon: GiPortal, desc: 'Master linear spells and pointer traversals.' },
        { name: 'Linked Lists Pit', difficulty: 'Intermediate', xp: '+800 XP', icon: GiScrollUnfurled, desc: 'Mend pointer links and bypass cycles.' },
        { name: 'Trees Sanctuary', difficulty: 'Advanced', xp: '+1200 XP', icon: GiLevelEndFlag, desc: 'Conquer hierarchy branches and tree recursion.' }
    ];

    const features = [
        { title: 'Gamified DSA Dungeons', desc: 'DSA topics mapped as medieval fantasy realms. Solve tasks represented as combat spell incantations.', icon: GiSwordsPower },
        { title: 'RPG Character Stats', desc: 'Gain experience (XP), level up your character standing, collect gold coins, and unlock titles.', icon: GiAngelWings },
        { title: 'Challenging Boss Battles', desc: 'Complete normal dungeon levels in each world to unlock boss monsters and seal the gate.', icon: GiGothicCross },
        { title: 'Unlocks & Achievements', desc: 'Secure unique badges, achievements, and shop scrolls by solving complex data puzzles.', icon: GiTrophy }
    ];

    return (
        <div className="min-h-screen bg-abyss-bg text-white flex flex-col selection:bg-abyss-primary/40 selection:text-white">
            {/* Ambient Background glows */}
            <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-abyss-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-1/3 right-1/4 translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] bg-purple-900/5 rounded-full blur-[140px] pointer-events-none"></div>

            {/* Top Navigation Navbar */}
            <header className="sticky top-0 z-50 backdrop-blur-md bg-abyss-bg/70 border-b border-abyss-border/40 px-6 py-4 flex justify-between items-center max-w-7xl w-full mx-auto">
                <div className="flex items-center space-x-3">
                    <GiGothicCross className="text-abyss-gold text-3xl filter drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]" />
                    <span className="font-fantasy text-lg font-bold text-abyss-gold tracking-widest uppercase">
                        Valthor
                    </span>
                </div>
                
                <div className="flex items-center space-x-4">
                    <Link
                        to={ROUTES.LOGIN}
                        className="font-fantasy text-xs uppercase tracking-widest text-abyss-gold border border-abyss-gold/20 hover:border-abyss-gold hover:text-white px-5 py-2.5 rounded-lg bg-abyss-card/50 transition-all duration-300 shadow-glow-gold/10"
                    >
                        Enter Command
                    </Link>
                </div>
            </header>

            {/* 1. Hero Section */}
            <section className="relative max-w-6xl w-full mx-auto px-6 py-20 lg:py-32 flex flex-col items-center text-center space-y-8 z-10">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    className="space-y-4"
                >
                    <span className="font-fantasy text-xs uppercase tracking-[0.25em] text-abyss-gold font-semibold bg-abyss-gold/10 border border-abyss-gold/20 px-4 py-1.5 rounded-full">
                        Forge Your Legacy
                    </span>
                    <h1 className="font-fantasy text-5xl sm:text-7xl font-bold tracking-widest leading-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-abyss-muted uppercase">
                        Conquer the Valthor Realms
                    </h1>
                </motion.div>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.8 }}
                    transition={{ delay: 0.3 }}
                    className="font-sans text-sm sm:text-base text-abyss-muted max-w-2xl leading-relaxed"
                >
                    Step into an immersive fantasy domain where DSA concepts are represented as realms, trials, and bosses. Write solutions, earn coins, and level up your standing.
                </motion.p>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
                >
                    <Link
                        to={ROUTES.REGISTER}
                        className="bg-abyss-primary hover:bg-abyss-primary/80 text-white font-fantasy tracking-widest uppercase px-8 py-3.5 rounded-lg border border-abyss-gold/20 shadow-glow-primary hover:shadow-[0_0_25px_rgba(124,58,237,0.7)] text-center transition-all duration-300 text-sm font-semibold"
                    >
                        Initiate Awakening
                    </Link>
                    <Link
                        to={ROUTES.LOGIN}
                        className="bg-abyss-card hover:bg-abyss-hover text-abyss-gold font-fantasy tracking-widest uppercase px-8 py-3.5 rounded-lg border border-abyss-gold/30 hover:border-abyss-gold/60 text-center transition-all duration-300 text-sm font-semibold"
                    >
                        Recall Character
                    </Link>
                </motion.div>
            </section>

            {/* 2. Features Grid */}
            <section className="bg-abyss-card/30 border-y border-abyss-border/40 py-20 px-6 z-10">
                <div className="max-w-6xl w-full mx-auto space-y-12">
                    <div className="text-center space-y-3">
                        <h2 className="font-fantasy text-3xl font-bold tracking-widest uppercase text-abyss-gold">
                            Core Mechanics
                        </h2>
                        <p className="font-sans text-xs text-abyss-muted max-w-md mx-auto">
                            Valthor blends core computer science curriculum with addictive gameplay loops.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feat, index) => (
                            <div key={index} className="bg-abyss-card border border-abyss-border/60 rounded-xl p-6 space-y-4 hover:border-abyss-gold/40 transition-colors">
                                <div className="p-3 bg-abyss-bg/60 border border-abyss-border/40 text-abyss-gold text-2xl w-fit rounded-lg shadow-glow-gold/10">
                                    <feat.icon />
                                </div>
                                <h3 className="font-fantasy text-base font-bold text-white uppercase tracking-wider">{feat.title}</h3>
                                <p className="font-sans text-xs text-abyss-muted leading-relaxed">{feat.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 3. Journey Preview */}
            <section className="py-20 px-6 z-10">
                <div className="max-w-5xl w-full mx-auto space-y-12">
                    <div className="text-center space-y-3">
                        <h2 className="font-fantasy text-3xl font-bold tracking-widest uppercase text-abyss-gold">
                            The Quest Pipeline
                        </h2>
                        <p className="font-sans text-xs text-abyss-muted">
                            Embark on an interactive questline to refine your technical combat skills.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center relative">
                        {/* Process Item 1 */}
                        <div className="space-y-3 relative z-10">
                            <div className="w-12 h-12 rounded-full border border-abyss-gold/40 bg-black/60 text-abyss-gold text-lg flex items-center justify-center font-fantasy mx-auto shadow-glow-gold/20">
                                01
                            </div>
                            <h4 className="font-fantasy text-base text-white uppercase tracking-wider">Choose Realm</h4>
                            <p className="font-sans text-xs text-abyss-muted max-w-xs mx-auto">
                                Enter independent DSA modules like Stacks, Queues, or Binary Trees based on level locks.
                            </p>
                        </div>
                        {/* Process Item 2 */}
                        <div className="space-y-3 relative z-10">
                            <div className="w-12 h-12 rounded-full border border-purple-500/40 bg-black/60 text-purple-400 text-lg flex items-center justify-center font-fantasy mx-auto shadow-glow-primary/20">
                                02
                            </div>
                            <h4 className="font-fantasy text-base text-white uppercase tracking-wider">Cast Spell Solutions</h4>
                            <p className="font-sans text-xs text-abyss-muted max-w-xs mx-auto">
                                Solve coding tasks. Submit JavaScript spells assessed by the protocol's evaluation runner.
                            </p>
                        </div>
                        {/* Process Item 3 */}
                        <div className="space-y-3 relative z-10">
                            <div className="w-12 h-12 rounded-full border border-green-500/40 bg-black/60 text-green-400 text-lg flex items-center justify-center font-fantasy mx-auto shadow-glow-success/20">
                                03
                            </div>
                            <h4 className="font-fantasy text-base text-white uppercase tracking-wider">Defeat Dungeons</h4>
                            <p className="font-sans text-xs text-abyss-muted max-w-xs mx-auto">
                                Gain rewards. Conquer the final boss challenge to seal the active realm and unlock subsequent zones.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. Realm Preview Grid */}
            <section className="bg-abyss-card/20 border-t border-abyss-border/40 py-20 px-6 z-10">
                <div className="max-w-6xl w-full mx-auto space-y-12">
                    <div className="text-center space-y-3">
                        <h2 className="font-fantasy text-3xl font-bold tracking-widest uppercase text-abyss-gold">
                            World Showcase
                        </h2>
                        <p className="font-sans text-xs text-abyss-muted">
                            A preview of some of the independent dimensions awaiting your breach.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {previewRealms.map((realm, index) => (
                            <div key={index} className="bg-abyss-card border border-abyss-border rounded-xl p-6 flex flex-col justify-between space-y-6">
                                <div className="h-36 bg-gradient-to-b from-black to-abyss-bg rounded-lg border border-abyss-border/40 flex items-center justify-center relative overflow-hidden">
                                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.1),transparent)]"></div>
                                    <realm.icon className="text-abyss-primary text-4xl filter drop-shadow-[0_0_10px_rgba(124,58,237,0.4)]" />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-fantasy text-base font-bold text-white uppercase tracking-wider">{realm.name}</h3>
                                        <span className="text-[9px] font-fantasy uppercase px-2 py-0.5 border border-abyss-border rounded text-abyss-muted bg-abyss-bg">{realm.difficulty}</span>
                                    </div>
                                    <p className="font-sans text-xs text-abyss-muted leading-relaxed">{realm.desc}</p>
                                </div>
                                <div className="flex justify-between items-center text-xs font-mono border-t border-abyss-border/20 pt-3">
                                    <span className="text-abyss-muted">Seeding XP:</span>
                                    <span className="text-purple-400 font-semibold">{realm.xp}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 5. Call To Action (CTA) */}
            <section className="py-24 px-6 text-center z-10 relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-abyss-primary/10 rounded-full blur-[100px] pointer-events-none"></div>
                
                <div className="max-w-3xl w-full mx-auto space-y-8 relative z-10">
                    <h2 className="font-fantasy text-4xl sm:text-5xl font-bold tracking-wider uppercase text-abyss-gold">
                        Begin Your Crusade
                    </h2>
                    <p className="font-sans text-sm text-abyss-muted max-w-md mx-auto leading-relaxed">
                        Awaken your spellcraft alias, register your key details, and start solving coding dungeons.
                    </p>
                    <div>
                        <Link
                            to={ROUTES.REGISTER}
                            className="bg-abyss-primary hover:bg-abyss-primary/80 text-white font-fantasy tracking-widest uppercase px-10 py-4 rounded-lg border border-abyss-gold/20 shadow-glow-primary hover:shadow-[0_0_30px_rgba(124,58,237,0.7)] transition-all duration-300 text-sm font-bold"
                        >
                            Enter the Abyss
                        </Link>
                    </div>
                </div>
            </section>

            {/* 6. Footer branding */}
            <footer className="bg-black/40 border-t border-abyss-border/30 py-8 px-6 text-center text-xs text-abyss-muted font-fantasy tracking-widest uppercase z-10">
                <p>© 2026 VALTHOR • DESIGNED FOR MASTER CODERS</p>
            </footer>
        </div>
    );
};

export default Landing;
