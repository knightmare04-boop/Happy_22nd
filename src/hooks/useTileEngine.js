import { useState, useEffect, useCallback, useRef } from 'react';

// Tile Types: 
// 0: Floor
// 1: Wall/Cubicle
// 2: Plant
// 3: Water Cooler
// 4: Rajiv (Boss)
// 5: Akif (Goal)
// 6: Desk

export const TILE_SIZE = 40;
export const MAP_COLS = 15;
export const MAP_ROWS = 10;

// Example 15x10 Office Map
/*
1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
1 2 0 0 0 1 0 0 3 0 0 4 0 2 1
1 0 0 0 0 1 0 0 0 0 0 0 0 0 1
1 0 0 1 1 1 0 0 0 1 1 1 0 0 1
1 0 0 0 0 0 0 0 0 0 0 1 0 0 1
1 0 0 0 0 0 0 0 0 0 0 1 0 0 1
1 1 1 1 0 0 0 1 1 1 0 1 0 0 1
1 6 6 1 0 0 0 1 6 1 0 0 0 0 1
1 5 0 1 0 0 0 1 0 1 0 0 0 2 1
1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
*/
// Let's design a clear path. Start at Top-Right, Rajiv blocks the middle, Akif is Bottom-Left.

export const INITIAL_MAP = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 2, 0, 0, 0, 1, 0, 0, 3, 0, 0, 0, , 2, 1],
    [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 1, 0, 0, 1],
    [1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1],
    [1, 6, 6, 0, 0, 0, 0, 1, 6, 1, 0, 0, 0, 0, 1],
    [1, 5, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 2, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

// Fix map initial row 1 missing element
export const LEVEL_MAP = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 2, 0, 0, 0, 1, 0, 0, 3, 0, 0, 0, 0, 2, 1],
    [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 1, 0, 0, 1],
    [1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1],
    [1, 6, 6, 0, 0, 0, 0, 1, 6, 1, 0, 0, 0, 0, 1],
    [1, 5, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 2, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

const START_POS = { x: 12, y: 2 };
const RAJIV_POS = { x: 7, y: 5 }; // Based on map above
const AKIF_POS = { x: 1, y: 8 };

const WALK_SPEED = 150; // ms per tile

export const useTileEngine = () => {
    const [gameState, setGameState] = useState('start'); // start, playing, battling, dialog, won
    const [playerPos, setPlayerPos] = useState(START_POS);
    const [playerDir, setPlayerDir] = useState('down');
    const [isMoving, setIsMoving] = useState(false);
    const [dialogText, setDialogText] = useState('');
    const [dialogSpeaker, setDialogSpeaker] = useState('');

    const stateRef = useRef({
        pos: START_POS,
        dir: 'down',
        moving: false,
        rajivDefeated: false,
        targetPos: null,
        moveQueue: []
    });

    const isSolid = (x, y) => {
        if (y < 0 || y >= MAP_ROWS || x < 0 || x >= MAP_COLS) return true;
        const tile = LEVEL_MAP[y][x];
        // Solida: Wall(1), Plant(2), Water Cooler(3), Desk(6)
        // Rajiv(4) and Akif(5) are interactable solids.
        return [1, 2, 3, 4, 5, 6].includes(tile);
    };

    const getTile = (x, y) => {
        if (y < 0 || y >= MAP_ROWS || x < 0 || x >= MAP_COLS) return 1;
        return LEVEL_MAP[y][x];
    };

    const checkRajivSight = (x, y, dir) => {
        if (stateRef.current.rajivDefeated) return false;
        // Rajiv is at 7,5. Let's say he looks left and right
        // If player steps on y=5 and x is between 4 and 10
        if (y === RAJIV_POS.y && Math.abs(x - RAJIV_POS.x) <= 3) {
            return true;
        }
        // Or if moving right in front of him
        if (x === RAJIV_POS.x && Math.abs(y - RAJIV_POS.y) <= 3) {
            return true;
        }
        return false;
    };

    const triggerBattle = () => {
        setGameState('battling');
        setDialogSpeaker('Rajiv');
        setDialogText("Where is the report?! The TAT is too high! ...");

        // Auto-advance dialog and "win" battle
        setTimeout(() => {
            setDialogText("Wait, you're too fast! Fine, go ahead...");
            setTimeout(() => {
                stateRef.current.rajivDefeated = true;
                // Clear Rajiv from map
                LEVEL_MAP[RAJIV_POS.y][RAJIV_POS.x] = 0;
                setGameState('playing');
                setDialogSpeaker('');
                setDialogText('');
            }, 3000);
        }, 3000);
    };

    const interact = () => {
        if (stateRef.current.moving) return;

        let targetX = stateRef.current.pos.x;
        let targetY = stateRef.current.pos.y;

        if (stateRef.current.dir === 'up') targetY -= 1;
        if (stateRef.current.dir === 'down') targetY += 1;
        if (stateRef.current.dir === 'left') targetX -= 1;
        if (stateRef.current.dir === 'right') targetX += 1;

        const tile = getTile(targetX, targetY);

        // Check if interacting with Akif OR the desk next to him (Manhattan distance <= 1 from AKIF_POS)
        const isNearAkif = Math.abs(stateRef.current.pos.x - AKIF_POS.x) <= 1 && Math.abs(stateRef.current.pos.y - AKIF_POS.y) <= 1;

        if (tile === 5 || (tile === 6 && isNearAkif)) { // Akif or his Desk
            setGameState('dialog');
            setDialogSpeaker('Akif');
            setDialogText("You made it! You dodge TAT demands like a pro.");

            // Advance through a cute sequence
            setTimeout(() => {
                setDialogSpeaker('');
                setDialogText("*Akif pulls you into a tight, warm embrace*");

                setTimeout(() => {
                    setDialogSpeaker('Akif');
                    setDialogText("I'm so incredibly proud of everything you do. You are the smartest, most beautiful girl in the world.");

                    setTimeout(() => {
                        setDialogText("Happy 22nd Birthday, My Queen! 😍 Let's go celebrate.");

                        setTimeout(() => {
                            setGameState('won');
                        }, 4000);

                    }, 4000);

                }, 3000);

            }, 3000);

        } else if (tile === 4 && !stateRef.current.rajivDefeated) { // Rajiv manual interact
            triggerBattle();
        } else if (tile === 3) {
            setGameState('dialog');
            setDialogSpeaker('Thought');
            setDialogText("A water cooler. Gotta stay hydrated!");
            setTimeout(() => setGameState('playing'), 2000);
        }
    };

    const movePlayer = useCallback((dx, dy, dirName) => {
        if (stateRef.current.moving || gameState !== 'playing') {
            if (!stateRef.current.moving && gameState === 'playing' && stateRef.current.dir !== dirName) {
                stateRef.current.dir = dirName;
                setPlayerDir(dirName);
            }
            return;
        }

        stateRef.current.dir = dirName;
        setPlayerDir(dirName);

        const newX = stateRef.current.pos.x + dx;
        const newY = stateRef.current.pos.y + dy;

        if (!isSolid(newX, newY)) {
            stateRef.current.moving = true;
            setIsMoving(true);

            // Animate movement (we just set a timeout to release lock)
            // Visual interpolation will be handled by CSS transitions on the component
            stateRef.current.pos = { x: newX, y: newY };
            setPlayerPos({ x: newX, y: newY });

            setTimeout(() => {
                stateRef.current.moving = false;
                setIsMoving(false);

                // After move, check for Rajiv sight
                if (checkRajivSight(newX, newY, dirName)) {
                    triggerBattle();
                }

            }, WALK_SPEED);
        } else {
            // Just turn, maybe bonk animation?
        }
    }, [gameState]);

    const handleKeyDown = useCallback((e) => {
        if (gameState !== 'playing') {
            if (e.key === 'Enter' || e.key === ' ') {
                if (gameState === 'start') startGame();
                else if (gameState === 'dialog') setGameState('playing');
                else if (gameState === 'won') { /* handle next */ }
            }
            return;
        }

        switch (e.key) {
            case 'ArrowUp': case 'w': movePlayer(0, -1, 'up'); break;
            case 'ArrowDown': case 's': movePlayer(0, 1, 'down'); break;
            case 'ArrowLeft': case 'a': movePlayer(-1, 0, 'left'); break;
            case 'ArrowRight': case 'd': movePlayer(1, 0, 'right'); break;
            case 'Enter': case ' ': interact(); break;
            default: break;
        }
    }, [movePlayer, gameState]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    const startGame = () => {
        // Reset map modifications
        LEVEL_MAP[RAJIV_POS.y][RAJIV_POS.x] = 4;
        stateRef.current.rajivDefeated = false;
        stateRef.current.pos = START_POS;
        setPlayerPos(START_POS);
        setPlayerDir('down');
        setGameState('playing');
    };

    return {
        gameState,
        startGame,
        playerPos,
        playerDir,
        isMoving,
        LEVEL_MAP,
        movePlayer,
        interact,
        dialogText,
        dialogSpeaker,
        RAJIV_POS,
        AKIF_POS
    };
};
