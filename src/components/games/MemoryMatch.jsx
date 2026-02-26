import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const CARDS_DATA = [
    "You're beautiful! 💖",
    "Your smile 😍",
    "Smartest girl 🧠",
    "Best hugs 🤗",
    "Cutest laugh 😹",
    "My whole world 🌍"
];

const generateDeck = () => {
    const deck = [...CARDS_DATA, ...CARDS_DATA]
        .sort(() => Math.random() - 0.5)
        .map((text, id) => ({ id, text, isFlipped: false, isMatched: false }));
    return deck;
};

const MemoryMatch = () => {
    const [cards, setCards] = useState([]);
    const [flippedIndices, setFlippedIndices] = useState([]);
    const [matches, setMatches] = useState(0);
    const [message, setMessage] = useState('');

    useEffect(() => {
        setCards(generateDeck());
    }, []);

    const handleCardClick = (index) => {
        if (flippedIndices.length === 2 || cards[index].isFlipped || cards[index].isMatched) return;

        const newCards = [...cards];
        newCards[index].isFlipped = true;
        setCards(newCards);

        const newFlippedIndices = [...flippedIndices, index];
        setFlippedIndices(newFlippedIndices);

        if (newFlippedIndices.length === 2) {
            const [firstIndex, secondIndex] = newFlippedIndices;
            if (newCards[firstIndex].text === newCards[secondIndex].text) {
                // Match found
                setTimeout(() => {
                    const matchedCards = [...newCards];
                    matchedCards[firstIndex].isMatched = true;
                    matchedCards[secondIndex].isMatched = true;
                    setCards(matchedCards);
                    setFlippedIndices([]);
                    setMatches((prev) => prev + 1);
                    setMessage("You're a genius! My talented girl!");
                }, 800);
            } else {
                // No match
                setTimeout(() => {
                    const resetCards = [...newCards];
                    resetCards[firstIndex].isFlipped = false;
                    resetCards[secondIndex].isFlipped = false;
                    setCards(resetCards);
                    setFlippedIndices([]);
                    setMessage("Almost there, love! You've got this!");
                }, 1200);
            }
        }
    };

    return (
        <section className="py-20 px-6 max-w-4xl mx-auto">
            <h2 className="text-4xl font-serif font-bold text-center mb-4 text-[var(--rose-gold)]">Love Labs: Memory Match</h2>
            <p className="text-center opacity-80 mb-8 max-w-xl mx-auto">Match the cards to reveal all the things I love about you.</p>

            {message && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={message}
                    className="text-center mb-8 font-bold text-lg md:text-xl text-[var(--rose-gold)] bg-[var(--rose-gold)] bg-opacity-10 py-3 px-6 rounded-full max-w-fit mx-auto shadow-sm"
                >
                    {message}
                </motion.div>
            )}

            {matches === CARDS_DATA.length && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center mb-10 p-6 glass-card rounded-2xl">
                    <h3 className="text-3xl font-bold mb-4">You won! 🏆</h3>
                    <p className="text-lg opacity-90">Of course you won, you're amazing! I love everything about you.</p>
                </motion.div>
            )}

            <div className="grid grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
                {cards.map((card, index) => (
                    <div
                        key={card.id}
                        className="w-full aspect-[3/4] perspective-1000 cursor-pointer"
                        onClick={() => handleCardClick(index)}
                    >
                        <motion.div
                            className="w-full h-full relative preserve-3d"
                            animate={{ rotateY: card.isFlipped || card.isMatched ? 180 : 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            {/* Card Front (Face down) */}
                            <div className="absolute inset-0 backface-hidden glass-card flex items-center justify-center rounded-xl bg-[var(--midnight-blue)] border border-white border-opacity-10 shadow-md hover:shadow-lg transition-all hover:-translate-y-1">
                                <span className="text-4xl opacity-40 text-white">?</span>
                            </div>

                            {/* Card Back (Face up) */}
                            <div className="absolute inset-0 backface-hidden !rotate-y-180 glass-card flex items-center justify-center p-3 rounded-xl bg-white text-[var(--midnight-blue)] font-bold text-center text-sm md:text-lg shadow-xl border border-[var(--rose-gold)]">
                                {card.text}
                            </div>
                        </motion.div>
                    </div>
                ))}
            </div>

            {/* Required CSS for 3D flip effect */}
            <style>{`
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .\\!rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
        </section>
    );
};

export default MemoryMatch;
