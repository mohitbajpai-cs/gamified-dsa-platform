import { 
    GiEmerald, 
    GiScrollUnfurled, 
    GiPortal, 
    GiSwordsPower, 
    GiCrystalWand, 
    GiTrophy, 
    GiCastle,
    GiFlame,
    GiWaterDrop
} from 'react-icons/gi';
import {
    FaTree,
    FaSnowflake,
    FaGlobe
} from 'react-icons/fa';

export const FANTASY_REALMS = [
    {
        name: 'Cave of Beginnings',
        topic: 'Arrays',
        theme: 'Purple crystal cave',
        boss: 'The Stone Golem',
        lore: 'Every legend begins beneath forgotten stone. Master the ancient Array Runes before entering the Abyss.',
        color: 'text-purple-400',
        bg: 'from-purple-950/40 to-black',
        iconGlow: 'drop-shadow-[0_0_12px_rgba(168,85,247,0.5)]',
        border: 'hover:border-purple-500/50 hover:shadow-[0_0_20px_rgba(168,85,247,0.15)]',
        icon: GiEmerald,
        image: '/cave.jpg'
    },
    {
        name: 'Ocean of Challenges',
        topic: 'Strings & Two Pointers',
        theme: 'Ancient underwater kingdom',
        boss: 'Leviathan',
        lore: 'Plunge into the deep trenches where strings of code float like glowing kelp. Survive the Leviathan\'s gaze.',
        color: 'text-cyan-400',
        bg: 'from-cyan-950/40 to-black',
        iconGlow: 'drop-shadow-[0_0_12px_rgba(34,211,238,0.5)]',
        border: 'hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(34,211,238,0.15)]',
        icon: GiWaterDrop,
        image: '/ocean.jpg'
    },
    {
        name: 'Volcano of Mastery',
        topic: 'Linked List, Stack & Queue',
        theme: 'Lava fortress',
        boss: 'Inferno Titan',
        lore: 'Ascend the volcanic citadel where linked structures flow like liquid magma. Forge your spellcraft in the fire.',
        color: 'text-red-400',
        bg: 'from-red-950/40 to-black',
        iconGlow: 'drop-shadow-[0_0_12px_rgba(239,68,68,0.5)]',
        border: 'hover:border-red-500/50 hover:shadow-[0_0_20px_rgba(239,68,68,0.15)]',
        icon: GiFlame,
        image: '/volcano.jpg'
    },
    {
        name: 'Forest of Recursion',
        topic: 'Recursion & Backtracking',
        theme: 'Ancient enchanted forest',
        boss: 'Forest Guardian',
        lore: 'Lost in the looping shadows of the world tree. Recursion is the only map out of this green maze.',
        color: 'text-emerald-400',
        bg: 'from-emerald-950/40 to-black',
        iconGlow: 'drop-shadow-[0_0_12px_rgba(52,211,153,0.5)]',
        border: 'hover:border-emerald-500/50 hover:shadow-[0_0_20px_rgba(52,211,153,0.15)]',
        icon: FaTree,
        image: '/forest.jpg'
    },
    {
        name: 'Frozen Kingdom',
        topic: 'Binary Search',
        theme: 'Ice castle',
        boss: 'Frost King',
        lore: 'A frozen wasteland where algorithms must cut search spaces in half. Face the frost to unlock the gate.',
        color: 'text-blue-300',
        bg: 'from-blue-950/40 to-black',
        iconGlow: 'drop-shadow-[0_0_12px_rgba(147,197,253,0.5)]',
        border: 'hover:border-blue-400/50 hover:shadow-[0_0_20px_rgba(147,197,253,0.15)]',
        icon: FaSnowflake,
        image: '/frozen.jpg'
    },
    {
        name: 'Ancient Tree Sanctuary',
        topic: 'Trees & BST',
        theme: 'Sacred world tree',
        boss: 'Ancient Ent',
        lore: 'Branching pathways lead up to the sky. Secure the roots of the sacred tree to capture its energy.',
        color: 'text-yellow-500',
        bg: 'from-yellow-950/40 to-black',
        iconGlow: 'drop-shadow-[0_0_12px_rgba(234,179,8,0.5)]',
        border: 'hover:border-yellow-500/50 hover:shadow-[0_0_20px_rgba(234,179,8,0.15)]',
        icon: FaTree,
        image: '/sanctuary.jpg'
    },
    {
        name: 'Sky Citadel',
        topic: 'Heap & Priority Queue',
        theme: 'Floating islands',
        boss: 'Storm Dragon',
        lore: 'Ascend to the clouds where heaps organize priorities in mid-air. Defeat the dragon of the tempests.',
        color: 'text-teal-400',
        bg: 'from-teal-950/40 to-black',
        iconGlow: 'drop-shadow-[0_0_12px_rgba(20,184,166,0.5)]',
        border: 'hover:border-teal-500/50 hover:shadow-[0_0_20px_rgba(20,184,166,0.15)]',
        icon: GiSwordsPower,
        image: '/citadel.jpg'
    },
    {
        name: 'Shadow Labyrinth',
        topic: 'Graphs',
        theme: 'Dark maze',
        boss: 'Shadow Reaper',
        lore: 'Navigate the nodes and edges of the dark labyrinth. Do not let the shadow reaper sever your connections.',
        color: 'text-indigo-400',
        bg: 'from-indigo-950/40 to-black',
        iconGlow: 'drop-shadow-[0_0_12px_rgba(99,102,241,0.5)]',
        border: 'hover:border-indigo-500/50 hover:shadow-[0_0_20px_rgba(99,102,241,0.15)]',
        icon: GiCrystalWand,
        image: '/labyrinth.jpg'
    },
    {
        name: 'Void Dimension',
        topic: 'Dynamic Programming',
        theme: 'Cosmic universe',
        boss: 'Void Emperor',
        lore: 'Step into the cosmic void where subproblems overlap in infinite dimensions. Seal the emperor of the void.',
        color: 'text-pink-400',
        bg: 'from-pink-950/40 to-black',
        iconGlow: 'drop-shadow-[0_0_12px_rgba(244,114,182,0.5)]',
        border: 'hover:border-pink-500/50 hover:shadow-[0_0_20px_rgba(244,114,182,0.15)]',
        icon: FaGlobe,
        image: '/void.jpg'
    },
    {
        name: 'Abyss Throne',
        topic: 'Advanced Algorithms',
        theme: 'Final Castle',
        boss: 'Abyss King',
        lore: 'The end of the protocol. Face the King of the Abyss to claim ultimate algorithm mastery.',
        color: 'text-red-500',
        bg: 'from-red-950/40 to-black',
        iconGlow: 'drop-shadow-[0_0_12px_rgba(239,68,68,0.5)]',
        border: 'hover:border-red-500/50 hover:shadow-[0_0_20px_rgba(239,68,68,0.15)]',
        icon: GiCastle,
        image: '/void.jpg'
    }
];
