import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';

const Modal = ({ isOpen, onClose, title, children }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.7 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black"
                    ></motion.div>

                    {/* Window Container */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="relative w-full max-w-lg bg-abyss-card border border-abyss-border rounded-xl p-6 shadow-glow-primary z-10"
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center border-b border-abyss-border/40 pb-3 mb-4">
                            <h3 className="font-fantasy text-xl font-semibold text-abyss-gold tracking-wider uppercase">
                                {title}
                            </h3>
                            <button
                                onClick={onClose}
                                className="text-abyss-muted hover:text-white transition-colors duration-200"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="text-abyss-muted leading-relaxed font-sans text-sm">
                            {children}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default Modal;
