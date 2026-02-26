import React, { useState, useEffect } from 'react';

const CountdownTimer = () => {
    const [timePassed, setTimePassed] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });

    useEffect(() => {
        // February 27, 2026 (Month is 0-indexed, so 1 = February)
        const targetDate = new Date(2026, 1, 27, 0, 0, 0);

        const updateTimer = () => {
            const now = new Date();
            const difference = targetDate.getTime() - now.getTime();

            if (difference <= 0) {
                setTimePassed({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                return;
            }

            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((difference / 1000 / 60) % 60);
            const seconds = Math.floor((difference / 1000) % 60);

            setTimePassed({ days, hours, minutes, seconds });
        };

        updateTimer();
        const intervalId = setInterval(updateTimer, 1000);

        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className="flex gap-4 justify-center mt-6 flex-wrap">
            {Object.entries(timePassed).map(([unit, value]) => (
                <div key={unit} className="glass-card flex flex-col items-center justify-center p-4 rounded-xl min-w-[80px]">
                    <span className="text-3xl font-bold text-[var(--rose-gold)] leading-none">{value}</span>
                    <span className="text-xs uppercase tracking-wider opacity-80 mt-1">{unit}</span>
                </div>
            ))}
        </div>
    );
};

export default CountdownTimer;
