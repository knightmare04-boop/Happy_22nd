import React from 'react';
import { motion } from 'framer-motion';

const memories = [
    {
        date: "August 29, 2022",
        title: "The Beginning",
        description: "The day our beautiful journey started. The moment I knew you were the one."
    },
    {
        date: "First Date",
        title: "Nervous Smiles",
        description: "I remember exactly what you were wearing. My heart couldn't stop racing."
    },
    {
        date: "First Trip",
        title: "Discovering the World Together",
        description: "Holding hands in new places, getting lost, and finding our way back together."
    },
    {
        date: "Today",
        title: "Happy 22nd Birthday",
        description: "You're more beautiful today than ever. I can't wait to see what our future holds."
    }
];

const JourneyTimeline = () => {
    return (
        <section className="py-20 px-6 max-w-4xl mx-auto relative overflow-hidden">
            <h2 className="text-4xl font-serif font-bold text-center mb-16 text-[var(--rose-gold)]">Our Journey</h2>

            <div className="relative border-l-2 border-[var(--rose-gold)] border-opacity-30 ml-4 md:ml-1/2 md:-translate-x-1/2">
                {memories.map((memory, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, type: 'spring', bounce: 0.4 }}
                        className={`mb-12 relative flex items-center w-full ${index % 2 === 0 ? 'md:justify-end md:text-right' : 'md:justify-start md:text-left'
                            }`}
                    >
                        {/* Timeline Dot */}
                        <div className={`absolute w-5 h-5 rounded-full bg-[var(--rose-gold)] shadow-[0_0_15px_var(--rose-gold)] -left-[10px] md:left-[50%] md:-translate-x-1/2 z-10`} />

                        {/* Content Card */}
                        <div className={`glass-card p-6 rounded-2xl w-[90%] md:w-[45%] ml-8 md:ml-0 transition-transform duration-300 hover:scale-105 ${index % 2 === 0 ? 'md:mr-8' : 'md:ml-8'
                            }`}>
                            <span className="text-sm uppercase tracking-wider text-[var(--rose-gold)] font-bold mb-2 block">{memory.date}</span>
                            <h3 className="text-2xl font-semibold mb-2 text-white">{memory.title}</h3>
                            <p className="opacity-80 leading-relaxed font-light text-gray-200">{memory.description}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
};

export default JourneyTimeline;
