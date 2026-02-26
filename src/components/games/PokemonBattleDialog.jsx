import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PokemonBattleDialog = ({ speaker, text, onNext, avatar }) => {
    const [displayedText, setDisplayedText] = useState('');

    useEffect(() => {
        setDisplayedText('');
        let i = 0;
        const interval = setInterval(() => {
            setDisplayedText(text.substring(0, i + 1));
            i++;
            if (i >= text.length) clearInterval(interval);
        }, 50); // Typewriter speed
        return () => clearInterval(interval);
    }, [text]);

    return (
        <div className="absolute bottom-4 left-4 right-4 h-32 bg-white bg-opacity-90 border-4 border-gray-800 rounded-xl p-4 flex gap-4 font-mono shadow-[4px_4px_0_rgba(0,0,0,0.5)] z-50">
            {avatar && (
                <div className="w-20 h-20 flex-shrink-0 border-2 border-gray-300 rounded overflow-hidden bg-gray-100 flex items-center justify-center">
                    {avatar}
                </div>
            )}
            <div className="flex-1 flex flex-col">
                {speaker && <div className="font-bold text-lg mb-1 text-gray-800 uppercase tracking-widest">{speaker}</div>}
                <div className="text-gray-700 text-lg leading-relaxed flex-1">
                    {displayedText}
                    {displayedText.length === text.length && <span className="animate-pulse ml-1">▼</span>}
                </div>
            </div>

            {/* Invisible overlay to capture clicks to fast-forward/next */}
            <div className="absolute inset-0 z-10 cursor-pointer" onClick={onNext} />
        </div>
    );
};

export default PokemonBattleDialog;
