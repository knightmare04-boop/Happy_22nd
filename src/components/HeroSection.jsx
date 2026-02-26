import React from 'react';
import { motion } from 'framer-motion';
import CountdownTimer from './CountdownTimer.jsx';
import { Heart } from 'lucide-react';

const HeroSection = () => {
    return (
        <section className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="text-center z-10"
            >
                <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    className="inline-block mb-4"
                >
                    <Heart className="w-12 h-12 text-[var(--rose-gold)]" fill="currentColor" />
                </motion.div>

                <h1 className="font-serif text-5xl md:text-7xl font-bold mb-4 drop-shadow-lg leading-tight">
                    Happy 22nd Birthday, <br /> <span className="text-[var(--rose-gold)] italic">My Love!</span>
                </h1>

                <p className="text-lg md:text-xl font-light opacity-90 max-w-lg mx-auto mb-8 mt-4">
                    Every moment since we started our journey has been the best of my life. Here's to forever.
                </p>

                <div className="mt-8">
                    <h2 className="text-sm uppercase tracking-widest font-semibold opacity-70 mb-2">Time until 22nd Birthday</h2>
                    <CountdownTimer />
                </div>

                <motion.div
                    className="mt-16 animate-bounce"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2, duration: 1 }}
                >
                    <p className="text-sm uppercase tracking-widest opacity-60">Scroll to continue</p>
                </motion.div>
            </motion.div>

            {/* Decorative background elements */}
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[var(--rose-gold)] rounded-full mix-blend-screen filter blur-[100px] opacity-20"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-900 rounded-full mix-blend-screen filter blur-[120px] opacity-30"></div>
        </section>
    );
};

export default HeroSection;
