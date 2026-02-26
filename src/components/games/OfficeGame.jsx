import React, { useRef } from 'react';
import { useTileEngine, TILE_SIZE, MAP_COLS, MAP_ROWS } from '../../hooks/useTileEngine';
import { motion, AnimatePresence } from 'framer-motion';
import PokemonBattleDialog from './PokemonBattleDialog';

// CSS Sprites fallback to Emojis with CSS animations if images fail
const TileMap = ({ mapData }) => {
    return (
        <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${MAP_COLS}, ${TILE_SIZE}px)`, gridTemplateRows: `repeat(${MAP_ROWS}, ${TILE_SIZE}px)` }}>
            {mapData.map((row, y) =>
                row.map((tile, x) => {
                    let bgClass = "bg-gray-200 border border-gray-300 border-opacity-30"; // Floor 0
                    let content = null;

                    if (tile === 1) bgClass = "bg-gray-600 border border-gray-700 shadow-inner"; // Wall
                    if (tile === 2) { bgClass = "bg-green-100"; content = "🪴"; } // Plant
                    if (tile === 3) { bgClass = "bg-blue-50"; content = "🚰"; } // Water Cooler
                    if (tile === 6) { bgClass = "bg-yellow-800 border-t-4 border-yellow-700 text-yellow-900 flex items-center justify-center font-bold text-xs"; content = "DESK"; } // Desk

                    return (
                        <div key={`${x}-${y}`} className={`w-full h-full ${bgClass} flex items-center justify-center text-xl overflow-hidden`}>
                            {content && <span className="drop-shadow-md">{content}</span>}
                        </div>
                    );
                })
            )}
        </div>
    );
};

const OfficeGame = () => {
    const {
        gameState, startGame, playerPos, playerDir, isMoving,
        LEVEL_MAP, movePlayer, interact, dialogText, dialogSpeaker, RAJIV_POS, AKIF_POS
    } = useTileEngine();

    const containerRef = useRef();

    return (
        <section className="py-20 px-4 max-w-5xl mx-auto flex flex-col items-center">
            <h2 className="text-4xl font-serif font-bold text-center mb-4 text-[var(--rose-gold)]">Love Labs: The Office Escape</h2>
            <p className="text-center opacity-80 mb-8 max-w-2xl">
                Explore the office! Dodge Rajiv's TAT demands and find my desk so we can celebrate!
            </p>

            {/* Game Window Container */}
            <div
                ref={containerRef}
                className="relative bg-gray-200 border-8 border-gray-800 rounded-xl overflow-hidden shadow-2xl touch-none select-none"
                style={{ width: MAP_COLS * TILE_SIZE, height: MAP_ROWS * TILE_SIZE }}
            >
                {gameState === 'start' && (
                    <div className="absolute inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-50">
                        <h1 className="text-white text-3xl font-bold font-mono tracking-widest mb-6">POKEMON: OFFICE EDITION</h1>
                        <button
                            onClick={startGame}
                            className="px-8 py-4 bg-white text-black text-xl font-bold font-mono border-4 border-gray-400 hover:bg-gray-200 active:scale-95 transition-all outline-none focus:outline-none"
                        >
                            PRESS START
                        </button>
                    </div>
                )}

                {/* Tile Map Layer */}
                <TileMap mapData={LEVEL_MAP} />

                {/* Object Layer (Sprites) */}
                <div className="absolute inset-0 pointer-events-none">
                    {/* Rajiv Boss */}
                    {LEVEL_MAP[RAJIV_POS.y][RAJIV_POS.x] === 4 && (
                        <div
                            className="absolute flex items-center justify-center text-3xl drop-shadow-lg"
                            style={{ left: RAJIV_POS.x * TILE_SIZE, top: RAJIV_POS.y * TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE }}
                        >
                            <div className="relative">
                                👳🏽‍♂️
                                {gameState === 'battling' && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0 }}
                                        animate={{ opacity: 1, y: -25, scale: 1 }}
                                        className="absolute left-1/2 -ml-2 top-0 text-red-500 font-bold text-2xl drop-shadow-[0_2px_2px_rgba(255,255,255,1)]"
                                    >!</motion.div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Akif Goal */}
                    <div
                        className="absolute flex items-center justify-center text-3xl drop-shadow-lg"
                        style={{ left: AKIF_POS.x * TILE_SIZE, top: AKIF_POS.y * TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE }}
                    >
                        🧑🏻‍💻
                        {gameState === 'won' && (
                            <motion.div
                                initial={{ opacity: 0, y: 0 }} animate={{ opacity: 1, y: -20 }} transition={{ repeat: Infinity, duration: 1, repeatType: 'reverse' }}
                                className="absolute -top-6 text-red-500 text-2xl"
                            >❤️</motion.div>
                        )}
                    </div>

                    {/* Player */}
                    <div
                        className="absolute flex items-center justify-center text-3xl transition-all z-20"
                        style={{
                            left: playerPos.x * TILE_SIZE,
                            top: playerPos.y * TILE_SIZE,
                            width: TILE_SIZE,
                            height: TILE_SIZE,
                            // Smooth sliding transition matching the engine's 150ms timeout
                            transitionDuration: isMoving ? '150ms' : '0ms',
                            transitionTimingFunction: 'linear'
                        }}
                    >
                        <motion.div
                            animate={{
                                // basic wobble to pretend walking
                                rotate: isMoving ? [-5, 5, -5] : 0,
                                scale: isMoving ? [1, 1.1, 1] : 1
                            }}
                            transition={{ repeat: Infinity, duration: 0.3 }}
                            className="drop-shadow-lg transform origin-bottom"
                        >
                            {playerDir === 'left' ? '🏃🏻‍♀️' : playerDir === 'right' ? '🏃🏻‍♀️' : playerDir === 'up' ? '🚶🏻‍♀️' : '🚶🏻‍♀️'}
                        </motion.div>
                    </div>
                </div>

                {/* UI Overlay / Dialog Layer */}
                <AnimatePresence>
                    {(gameState === 'battling' || gameState === 'dialog' || gameState === 'won') && (
                        <motion.div
                            initial={{ y: 100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 100, opacity: 0 }}
                        >
                            <PokemonBattleDialog
                                speaker={dialogSpeaker}
                                text={dialogText}
                                onNext={() => { }} // Could be wired up to skip dialog
                                avatar={dialogSpeaker === 'Rajiv' ? <span className="text-5xl">👳🏽‍♂️</span> : dialogSpeaker === 'Akif' ? <span className="text-5xl">🧑🏻‍💻</span> : dialogSpeaker === '' ? <span className="text-5xl animate-pulse text-red-500">❤️</span> : <span className="text-5xl">🏃🏻‍♀️</span>}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Full screen pop over for actual Win */}
                {gameState === 'won' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 4 }} // Show after dialog finishes
                        className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--rose-gold)_0%,_#12182b_100%)] bg-opacity-95 flex flex-col items-center justify-center z-50 p-6 text-center"
                    >
                        <h2 className="text-5xl font-serif font-bold mb-6 text-white text-shadow-lg">You Made It!</h2>
                        <p className="text-xl font-light italic text-white">"I knew you could dodge those TAT requests! Happy 22nd Birthday, My Queen!"</p>
                        <button className="mt-8 px-6 py-3 border-2 font-bold border-white text-white rounded-full hover:bg-white hover:text-[#12182b] transition-colors" onClick={() => document.getElementById('flower-bouquet').scrollIntoView({ behavior: 'smooth' })}>
                            Continue to next surprise
                        </button>
                    </motion.div>
                )}
            </div>

            {/* On-screen touch controls for mobile (D-PAD) */}
            <div className="mt-8 flex gap-6 md:hidden">
                <div className="grid grid-cols-3 gap-2 w-48 h-48 bg-gray-200 bg-opacity-10 p-4 rounded-full border-4 border-[var(--rose-gold)] border-opacity-30 relative select-none touch-none">
                    {/* Center indent */}
                    <div className="absolute inset-0 m-auto w-12 h-12 bg-gray-900 rounded-full shadow-inner z-0 pointer-events-none"></div>

                    <div />
                    <button
                        className="bg-gray-800 rounded-t-xl hover:bg-gray-700 active:bg-gray-600 shadow-[0_4px_0_#333] active:shadow-[0_0px_0_#333] active:translate-y-1 z-10 font-bold"
                        onTouchStart={(e) => { e.preventDefault(); movePlayer(0, -1, 'up'); }}
                        onMouseDown={() => movePlayer(0, -1, 'up')}
                    >▲</button>
                    <div />

                    <button
                        className="bg-gray-800 rounded-l-xl hover:bg-gray-700 active:bg-gray-600 shadow-[0_4px_0_#333] active:shadow-[0_0px_0_#333] active:translate-y-1 z-10 font-bold"
                        onTouchStart={(e) => { e.preventDefault(); movePlayer(-1, 0, 'left'); }}
                        onMouseDown={() => movePlayer(-1, 0, 'left')}
                    >◀</button>
                    <button
                        className="bg-gray-800 rounded-full w-12 h-12 mx-auto my-auto active:scale-90 z-20 flex items-center justify-center font-bold text-xs"
                        onTouchStart={(e) => { e.preventDefault(); interact(); }}
                        onMouseDown={() => interact()}
                    >A</button>
                    <button
                        className="bg-gray-800 rounded-r-xl hover:bg-gray-700 active:bg-gray-600 shadow-[0_4px_0_#333] active:shadow-[0_0px_0_#333] active:translate-y-1 z-10 font-bold"
                        onTouchStart={(e) => { e.preventDefault(); movePlayer(1, 0, 'right'); }}
                        onMouseDown={() => movePlayer(1, 0, 'right')}
                    >▶</button>

                    <div />
                    <button
                        className="bg-gray-800 rounded-b-xl hover:bg-gray-700 active:bg-gray-600 shadow-[0_4px_0_#333] active:shadow-[0_0px_0_#333] active:translate-y-1 z-10 font-bold"
                        onTouchStart={(e) => { e.preventDefault(); movePlayer(0, 1, 'down'); }}
                        onMouseDown={() => movePlayer(0, 1, 'down')}
                    >▼</button>
                    <div />
                </div>
            </div>
            <p className="md:hidden mt-4 text-sm opacity-60">Use the D-Pad to move. Press 'A' to interact.</p>
            <p className="hidden md:block mt-4 text-sm opacity-60">Use WASD or Arrow Keys to move. Press Space/Enter to interact.</p>
        </section>
    );
};

export default OfficeGame;
