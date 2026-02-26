import { useRef, useState, useEffect, useCallback } from 'react';

const GAME_WIDTH = 800; // Logical width
const GAME_HEIGHT = 600; // Logical height
const PLAYER_SPEED = 4;
const PLAYER_SIZE = 40;
const BOSS_SIZE = 80;
const DESK_SIZE = 100;

export const useGameEngine = () => {
    const [gameState, setGameState] = useState('start'); // start, playing, won, lost
    const [playerInfo, setPlayerInfo] = useState({ x: 100, y: 300, hasCoffee: false, hasShield: false });
    const [projectiles, setProjectiles] = useState([]);
    const [powerUps, setPowerUps] = useState([]);
    const [bossDialog, setBossDialog] = useState('');
    const [playerDialog, setPlayerDialog] = useState('');
    const [praiseMessage, setPraiseMessage] = useState(null);

    // Mutable refs for the game loop to avoid dependency issues
    const stateRef = useRef({
        player: { x: 50, y: Math.floor(GAME_HEIGHT / 2) - PLAYER_SIZE / 2, vx: 0, vy: 0, speedMult: 1, invulnerable: false },
        projectiles: [],
        powerUps: [],
        boss: { x: GAME_WIDTH - 200, y: Math.floor(GAME_HEIGHT / 2) - BOSS_SIZE / 2, type: 'rajiv', hp: 100 },
        desk: { x: GAME_WIDTH - 120, y: Math.floor(GAME_HEIGHT / 2) - DESK_SIZE / 2 },
        keys: { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false, w: false, a: false, s: false, d: false },
        lastShotTime: 0,
        shotInterval: 1000,
        startTime: 0,
        powerUpTimers: { speed: 0, shield: 0 },
        gameState: 'start',
        praiseTimeout: null
    });

    const requestRef = useRef();

    // Handle Input
    const handleKeyDown = useCallback((e) => {
        if (stateRef.current.keys.hasOwnProperty(e.key)) {
            stateRef.current.keys[e.key] = true;
        }
        if (e.key === 'w' || e.key === 'a' || e.key === 's' || e.key === 'd') {
            stateRef.current.keys[e.key] = true;
        }
    }, []);

    const handleKeyUp = useCallback((e) => {
        if (stateRef.current.keys.hasOwnProperty(e.key)) {
            stateRef.current.keys[e.key] = false;
        }
        if (e.key === 'w' || e.key === 'a' || e.key === 's' || e.key === 'd') {
            stateRef.current.keys[e.key] = false;
        }
    }, []);

    // For touch controls
    const handleJoystickMove = (dx, dy) => {
        stateRef.current.player.vx = dx * PLAYER_SPEED * stateRef.current.player.speedMult;
        stateRef.current.player.vy = dy * PLAYER_SPEED * stateRef.current.player.speedMult;
    };

    const stopJoystick = () => {
        stateRef.current.player.vx = 0;
        stateRef.current.player.vy = 0;
    };

    const showPraise = (msg) => {
        setPraiseMessage(msg);
        if (stateRef.current.praiseTimeout) clearTimeout(stateRef.current.praiseTimeout);
        stateRef.current.praiseTimeout = setTimeout(() => {
            setPraiseMessage(null);
        }, 2500);
    };

    const spawnPowerUp = () => {
        const type = Math.random() > 0.5 ? 'coffee' : 'heart';
        stateRef.current.powerUps.push({
            id: Date.now() + Math.random(),
            x: 150 + Math.random() * (GAME_WIDTH - 400),
            y: 50 + Math.random() * (GAME_HEIGHT - 100),
            type,
            size: 30
        });
    };

    const startGame = () => {
        stateRef.current = {
            ...stateRef.current,
            player: { x: 50, y: GAME_HEIGHT / 2 - PLAYER_SIZE / 2, vx: 0, vy: 0, speedMult: 1, invulnerable: false },
            projectiles: [],
            powerUps: [],
            gameState: 'playing',
            lastShotTime: performance.now(),
            startTime: performance.now(),
            shotInterval: 1200,
        };
        setGameState('playing');
        setBossDialog("Where is the report?!");
        setPlayerDialog('');

        // Spawn initial powerups
        spawnPowerUp();
        spawnPowerUp();
    };

    const checkCollision = (rect1, rect2) => {
        return (
            rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.height + rect1.y > rect2.y
        );
    };

    const update = useCallback((time) => {
        if (stateRef.current.gameState !== 'playing') return;

        const state = stateRef.current;

        // Player movement keyboard
        if (state.keys.ArrowLeft || state.keys.a) state.player.x -= PLAYER_SPEED * state.player.speedMult;
        if (state.keys.ArrowRight || state.keys.d) state.player.x += PLAYER_SPEED * state.player.speedMult;
        if (state.keys.ArrowUp || state.keys.w) state.player.y -= PLAYER_SPEED * state.player.speedMult;
        if (state.keys.ArrowDown || state.keys.s) state.player.y += PLAYER_SPEED * state.player.speedMult;

        // Player movement joystick
        if (!state.keys.ArrowLeft && !state.keys.a && !state.keys.ArrowRight && !state.keys.d &&
            !state.keys.ArrowUp && !state.keys.w && !state.keys.ArrowDown && !state.keys.s) {
            state.player.x += state.player.vx;
            state.player.y += state.player.vy;
        }

        // Boundaries
        state.player.x = Math.max(0, Math.min(state.player.x, GAME_WIDTH - PLAYER_SIZE));
        state.player.y = Math.max(0, Math.min(state.player.y, GAME_HEIGHT - PLAYER_SIZE));

        // Powerup Timers
        if (state.powerUpTimers.speed > 0 && time > state.powerUpTimers.speed) {
            state.player.speedMult = 1;
            state.powerUpTimers.speed = 0;
        }
        if (state.powerUpTimers.shield > 0 && time > state.powerUpTimers.shield) {
            state.player.invulnerable = false;
            state.powerUpTimers.shield = 0;
        }

        // Boss AI / Difficulty scaling (closer = faster)
        const progress = state.player.x / (GAME_WIDTH - 200); // 0 to 1
        state.shotInterval = Math.max(400, 1200 - (progress * 800));

        if (time - state.lastShotTime > state.shotInterval) {
            const type = Math.random() > 0.4 ? 'number' : 'cigarette'; // 60% numbers, 40% cigarette
            const isNumber = type === 'number';
            const numberValue = [0.05, 1.2, 0.99, 3.14, 0.8][Math.floor(Math.random() * 5)];

            let targetX = state.player.x;
            let targetY = state.player.y;

            // Calculate angle
            const dx = targetX - state.boss.x;
            const dy = targetY - state.boss.y;
            const mag = Math.sqrt(dx * dx + dy * dy);
            const speed = isNumber ? 5 : 3;

            state.projectiles.push({
                id: time,
                x: state.boss.x,
                y: state.boss.y + BOSS_SIZE / 2,
                vx: (dx / mag) * speed,
                vy: (dy / mag) * speed,
                type,
                value: isNumber ? numberValue : null,
                size: 20
            });
            state.lastShotTime = time;

            if (Math.random() > 0.7) setBossDialog("The TAT is too high!");
            else if (Math.random() > 0.8) setBossDialog("Where is the report?!");
        }

        // Update Projectiles & Check Collisions
        for (let i = state.projectiles.length - 1; i >= 0; i--) {
            let p = state.projectiles[i];
            p.x += p.vx;
            p.y += p.vy;

            // Target hit
            const pRect = { x: p.x, y: p.y, width: p.size, height: p.size };
            const playerRect = { x: state.player.x, y: state.player.y, width: PLAYER_SIZE, height: PLAYER_SIZE };

            if (checkCollision(pRect, playerRect)) {
                state.projectiles.splice(i, 1);
                if (state.player.invulnerable) {
                    // Play pop effect
                } else {
                    // Just push player back a bit (she can't actually lose)
                    state.player.x = Math.max(0, state.player.x - 30);
                    showPraise("Almost there, love! Keep pushing!");
                    if (state.powerUps.length < 3) spawnPowerUp(); // Spawn help
                }
                continue;
            }

            if (p.x < 0 || p.x > GAME_WIDTH || p.y < 0 || p.y > GAME_HEIGHT) {
                state.projectiles.splice(i, 1);
            }
        }

        // Power-Up Collisions
        for (let i = state.powerUps.length - 1; i >= 0; i--) {
            let pup = state.powerUps[i];
            const pRect = { x: pup.x, y: pup.y, width: pup.size, height: pup.size };
            const playerRect = { x: state.player.x, y: state.player.y, width: PLAYER_SIZE, height: PLAYER_SIZE };

            if (checkCollision(pRect, playerRect)) {
                if (pup.type === 'coffee') {
                    state.player.speedMult = 2;
                    state.powerUpTimers.speed = time + 5000;
                    showPraise("Speeding through like a pro! Nothing can stop you!");
                } else {
                    state.player.invulnerable = true;
                    state.powerUpTimers.shield = time + 4000;
                    showPraise("My love makes you invincible! You're doing amazing!");
                }
                state.powerUps.splice(i, 1);
            }
        }

        // Random powerup spawn
        if (Math.random() < 0.005 && state.powerUps.length < 4) spawnPowerUp();

        // Check Win Condition
        const deskRect = { x: state.desk.x, y: state.desk.y, width: DESK_SIZE, height: DESK_SIZE };
        const playerRect = { x: state.player.x, y: state.player.y, width: PLAYER_SIZE, height: PLAYER_SIZE };

        if (checkCollision(deskRect, playerRect)) {
            state.gameState = 'won';
            setGameState('won');
            setBossDialog('');
            setPlayerDialog("I've been waiting for you! Now that he's gone, I can finally give you my full attention. Happy 22nd Birthday, My Queen!");
        }

        // Commit to React state for rendering
        setPlayerInfo({
            x: state.player.x,
            y: state.player.y,
            hasCoffee: state.powerUpTimers.speed > 0,
            hasShield: state.powerUpTimers.shield > 0
        });
        setProjectiles([...state.projectiles]);
        setPowerUps([...state.powerUps]);

        requestRef.current = requestAnimationFrame(update);
    }, []);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        requestRef.current = requestAnimationFrame(update);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            cancelAnimationFrame(requestRef.current);
        };
    }, [handleKeyDown, handleKeyUp, update]);

    return {
        gameState,
        startGame,
        playerInfo,
        projectiles,
        powerUps,
        boss: stateRef.current.boss,
        desk: stateRef.current.desk,
        GAME_WIDTH,
        GAME_HEIGHT,
        handleJoystickMove,
        stopJoystick,
        bossDialog,
        playerDialog,
        praiseMessage
    };
};
