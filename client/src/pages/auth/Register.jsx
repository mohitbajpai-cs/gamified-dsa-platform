import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../constants/routes';
import PrimaryButton from '../../components/ui/PrimaryButton';
import ButtonLoader from '../../components/feedback/ButtonLoader';
import toast from 'react-hot-toast';
import { GiGothicCross } from 'react-icons/gi';

const Register = () => {
    const { register: registerUser } = useAuth();
    const navigate = useNavigate();

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!username || !email || !password || !confirmPassword) {
            return toast.error('Fill in all character attribute fields');
        }
        if (username.trim().length < 3) {
            return toast.error('Username alias must be at least 3 characters long');
        }
        if (!emailRegex.test(email.trim())) {
            return toast.error('Please enter a valid email address');
        }
        if (password.length < 6) {
            return toast.error('Password must be at least 6 characters long');
        }
        if (password !== confirmPassword) {
            return toast.error('Passwords do not match');
        }

        setIsSubmitting(true);
        try {
            await registerUser(username, email, password);
            toast.success('Spell complete. Awakening registered!');
            navigate(ROUTES.DASHBOARD);
        } catch (error) {
            toast.error(error.message || 'Verification rejected by the Protocol');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-abyss-bg flex items-center justify-center p-6 relative overflow-hidden">
            {/* Ambient Background glows */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-abyss-primary/10 rounded-full blur-[140px] pointer-events-none"></div>

            <div className="w-full max-w-md bg-abyss-card border border-abyss-border rounded-xl p-8 shadow-glow-primary/20 z-10 space-y-6">
                {/* Header title */}
                <div className="text-center space-y-2">
                    <GiGothicCross className="text-abyss-gold text-4xl mx-auto filter drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]" />
                    <h2 className="font-fantasy text-2xl font-bold text-white tracking-widest uppercase">
                        Initiate Awakening
                    </h2>
                    <p className="font-sans text-xs text-abyss-muted">
                        Bind your character signature to the Valthor logs.
                    </p>
                </div>

                {/* Form Input fields */}
                <form onSubmit={handleSubmit} className="space-y-4 font-sans text-sm">
                    <div className="space-y-1">
                        <label className="text-xs uppercase text-abyss-gold font-fantasy tracking-wider">Username Alias</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="spellcaster_99"
                            disabled={isSubmitting}
                            className="w-full bg-black/40 border border-abyss-border rounded-lg px-4 py-2.5 text-white placeholder-abyss-muted focus:outline-none focus:border-abyss-primary focus:shadow-[0_0_10px_rgba(124,58,237,0.3)] transition-all"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs uppercase text-abyss-gold font-fantasy tracking-wider">Email Slot</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="spellcaster@valthor.com"
                            disabled={isSubmitting}
                            className="w-full bg-black/40 border border-abyss-border rounded-lg px-4 py-2.5 text-white placeholder-abyss-muted focus:outline-none focus:border-abyss-primary focus:shadow-[0_0_10px_rgba(124,58,237,0.3)] transition-all"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs uppercase text-abyss-gold font-fantasy tracking-wider">Cipher Phrase</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            disabled={isSubmitting}
                            className="w-full bg-black/40 border border-abyss-border rounded-lg px-4 py-2.5 text-white placeholder-abyss-muted focus:outline-none focus:border-abyss-primary focus:shadow-[0_0_10px_rgba(124,58,237,0.3)] transition-all"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs uppercase text-abyss-gold font-fantasy tracking-wider">Confirm Cipher Phrase</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            disabled={isSubmitting}
                            className="w-full bg-black/40 border border-abyss-border rounded-lg px-4 py-2.5 text-white placeholder-abyss-muted focus:outline-none focus:border-abyss-primary focus:shadow-[0_0_10px_rgba(124,58,237,0.3)] transition-all"
                        />
                    </div>

                    <div className="pt-2">
                        <PrimaryButton
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-3"
                        >
                            {isSubmitting ? <ButtonLoader /> : 'Cast Awakening Spell'}
                        </PrimaryButton>
                    </div>
                </form>

                {/* Redirect links */}
                <div className="text-center font-sans text-xs text-abyss-muted border-t border-abyss-border/40 pt-4">
                    <span>Already initiated? </span>
                    <Link to={ROUTES.LOGIN} className="text-abyss-gold hover:text-white transition-colors underline underline-offset-4">
                        Recall Character
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
