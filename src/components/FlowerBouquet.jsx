import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FLOWER_REASONS = [
    "You’re the only person on earth capable of making me actually want to step away from my computer and stop typing.",
    "The way you’ve grown even more incredible this year, proving that 22 is definitely your golden era.",
    "Because even when \"life bosses\" like Rajiv throw TAT cannons and decimal points our way, you’re the only person I want in my corner.",
    "The way you can make a completely ordinary Tuesday feel like a core memory just by being there.",
    "The way you handle challenges with so much grace that you make it look easy (even though I know how hard you work).",
    "Just hearing your voice acts like an instant \"Love Heart\" power-up, making me feel totally invincible."
];

const EMOJI_FLOWERS = ["🌹", "🌷", "🌺", "🌻", "🌼", "🌸"];

const FlowerBouquet = () => {
    const [flowersInVase, setFlowersInVase] = useState([]);
    const [availableFlowers, setAvailableFlowers] = useState([0, 1, 2, 3, 4, 5]);
    const vaseRef = useRef(null);
    const [isHoveringVase, setIsHoveringVase] = useState(false);

    const checkOverlap = (e, index) => {
        // Simple bounding box check for drop zone
        if (!vaseRef.current) return;
        const vaseRect = vaseRef.current.getBoundingClientRect();

        // Extract client coordinates whether it's a mouse or touch event
        const clientX = e.clientX ?? (e.changedTouches && e.changedTouches[0]?.clientX) ?? 0;
        const clientY = e.clientY ?? (e.changedTouches && e.changedTouches[0]?.clientY) ?? 0;

        // Give a generous drop zone around the vase area
        if (
            clientX >= vaseRect.left - 80 &&
            clientX <= vaseRect.right + 80 &&
            clientY >= vaseRect.top - 150 &&
            clientY <= vaseRect.bottom + 100
        ) {
            handleDrop(index);
        }
    };

    const handleDrop = (index) => {
        setAvailableFlowers(prev => prev.filter(i => i !== index));
        setFlowersInVase(prev => [...prev, index]);
        setIsHoveringVase(false);
    };

    return (
        <section id="flower-bouquet" className="py-24 px-6 max-w-5xl mx-auto mb-20 relative">

            {/* Background glowing orb for aesthetic */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[var(--rose-gold)] rounded-full blur-[150px] opacity-10 pointer-events-none"></div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
            >
                <h2 className="text-5xl font-serif font-bold text-center mb-4 text-[var(--rose-gold)] drop-shadow-md">Virtual Bouquet</h2>
                <p className="text-center text-lg opacity-80 mb-16 font-light">
                    Drag the flowers from the garden into the vase to see why I love you. 🌸
                </p>
            </motion.div>

            <div className="flex flex-col md:flex-row gap-16 items-center justify-center relative z-10">

                {/* 1. The Garden (Draggable Flowers) */}
                <div className="flex-1 w-full max-w-md bg-white bg-opacity-[0.02] border border-white border-opacity-10 backdrop-blur-xl p-10 rounded-3xl shadow-2xl min-h-[300px] flex flex-col relative overflow-visible">
                    <h3 className="w-full text-center font-bold text-[var(--rose-gold)] opacity-90 mb-8 tracking-[0.2em] uppercase text-xs">The Garden</h3>

                    {availableFlowers.length === 0 && (
                        <motion.p
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="absolute inset-0 m-auto h-fit text-center opacity-50 italic text-xl font-serif"
                        >
                            The garden is empty,<br />but my heart is full. ❤️
                        </motion.p>
                    )}

                    <div className="flex flex-wrap justify-center gap-8 gap-y-10 relative z-50">
                        <AnimatePresence>
                            {availableFlowers.map((index) => (
                                <motion.div
                                    key={`dragger-${index}`}
                                    layoutId={`flower-layout-${index}`}
                                    initial={{ scale: 0, rotate: -30 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    exit={{ scale: 0, opacity: 0 }}
                                    whileHover={{ scale: 1.25, rotate: 15 }}
                                    whileTap={{ scale: 1.1, cursor: 'grabbing' }}
                                    drag
                                    dragSnapToOrigin={true}
                                    onDrag={(e, info) => {
                                        // Highlight vase if hovering near it
                                        if (!vaseRef.current) return;
                                        const vaseRect = vaseRef.current.getBoundingClientRect();
                                        const clientX = e.clientX ?? (e.changedTouches && e.changedTouches[0]?.clientX) ?? info.point.x;
                                        const clientY = e.clientY ?? (e.changedTouches && e.changedTouches[0]?.clientY) ?? info.point.y;

                                        if (clientX >= vaseRect.left - 80 && clientX <= vaseRect.right + 80 && clientY >= vaseRect.top - 150 && clientY <= vaseRect.bottom + 100) {
                                            setIsHoveringVase(true);
                                        } else {
                                            setIsHoveringVase(false);
                                        }
                                    }}
                                    onDragEnd={(e, info) => checkOverlap(e, index)}
                                    className="text-6xl cursor-grab drop-shadow-[0_10px_10px_rgba(0,0,0,0.3)] z-50 origin-bottom"
                                >
                                    {EMOJI_FLOWERS[index]}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>

                {/* 2. The Vase & Messages */}
                <div className="flex-1 w-full max-w-md flex flex-col items-center mt-10 md:mt-0 relative">

                    {/* Reasons List */}
                    <div className="w-full h-80 mb-8 flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-2 relative">
                        <AnimatePresence>
                            {flowersInVase.map((index, i) => (
                                <motion.div
                                    key={`reason-${index}`}
                                    layout
                                    initial={{ opacity: 0, x: -40, scale: 0.9 }}
                                    animate={{ opacity: 1, x: 0, scale: 1 }}
                                    transition={{ type: "spring", stiffness: 100, damping: 12, delay: 0.1 }}
                                    className="w-full bg-gradient-to-r from-[var(--rose-gold)] to-transparent p-[1px] rounded-xl shadow-lg shrink-0"
                                >
                                    <div className="bg-[#1a2138] w-full h-full p-4 rounded-xl flex items-start gap-4">
                                        <span className="text-2xl drop-shadow-md mt-1">{EMOJI_FLOWERS[index]}</span>
                                        <p className="font-serif italic text-white opacity-90 text-sm md:text-base leading-relaxed">"{FLOWER_REASONS[index]}"</p>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {flowersInVase.length === 0 && (
                            <div className="absolute inset-0 flex items-center justify-center opacity-30 border border-dashed border-white border-opacity-20 rounded-2xl h-full w-full">
                                <p className="font-light italic text-center px-4">Your reasons will appear here after you add a flower...</p>
                            </div>
                        )}
                    </div>

                    {/* Vase Drop Zone Container */}
                    <motion.div
                        className="relative mt-8 flex flex-col items-center"
                        animate={{ scale: isHoveringVase ? 1.05 : 1 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        {/* Flowers sitting IN the vase */}
                        <div className="flex justify-center items-end h-20 -mb-8 z-10 relative pointer-events-none">
                            {flowersInVase.map((index, i) => {
                                // Calculate a nice bouquet fan spread
                                const angle = (i - (flowersInVase.length - 1) / 2) * 15;
                                const heightOffset = Math.abs(i - (flowersInVase.length - 1) / 2) * 10;

                                return (
                                    <motion.div
                                        key={`vase-flower-${index}`}
                                        layoutId={`flower-layout-${index}`}
                                        initial={{ y: -100, opacity: 0, rotate: angle * 2 }}
                                        animate={{ y: heightOffset, opacity: 1, rotate: angle }}
                                        transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
                                        className="text-7xl absolute origin-bottom drop-shadow-2xl"
                                        style={{ transformOrigin: 'bottom center' }}
                                    >
                                        {EMOJI_FLOWERS[index]}
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* Physical Vase Element */}
                        <div
                            ref={vaseRef}
                            className={`w-40 h-48 rounded-br-[50px] rounded-bl-[50px] rounded-t-xl mx-auto relative z-20 flex flex-col items-center justify-start overflow-hidden transition-all duration-300 ${isHoveringVase ? 'shadow-[0_0_40px_var(--rose-gold)]' : 'shadow-[0_20px_50px_rgba(0,0,0,0.8)]'}`}
                            style={{
                                background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 100%)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255,255,255,0.3)',
                                borderTop: '2px solid rgba(255,255,255,0.5)'
                            }}
                        >
                            {/* Water inside vase line */}
                            <div className="w-full h-3/4 absolute bottom-0 bg-blue-400 bg-opacity-10 border-t border-blue-200 border-opacity-30"></div>

                            {/* Vase reflections */}
                            <div className="absolute top-0 left-4 w-2 h-full bg-white opacity-20 skew-x-[-10deg]"></div>
                            <div className="absolute top-0 left-8 w-1 h-full bg-white opacity-10 skew-x-[-10deg]"></div>

                            {isHoveringVase && (
                                <motion.div
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                    className="absolute inset-0 bg-[var(--rose-gold)] bg-opacity-20 animate-pulse"
                                />
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default FlowerBouquet;
