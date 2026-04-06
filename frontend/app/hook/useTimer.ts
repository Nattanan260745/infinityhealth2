import { useState, useEffect, useCallback, useRef } from 'react';

export function useTimer() {
    const [time, setTime] = useState(0); // Current countdown time
    const [isRunning, setIsRunning] = useState(false);
    const [initialTime, setInitialTime] = useState(0);
    // New state to track if the timer has been started and is "in progress"
    const [isActive, setIsActive] = useState(false);
    
    const startTimeRef = useRef<number | null>(null);
    const baseTimeRef = useRef<number>(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Main Update Loop
    useEffect(() => {
        if (isRunning) {
            intervalRef.current = setInterval(() => {
                const now = Date.now();
                if (startTimeRef.current !== null) {
                    const elapsed = (now - startTimeRef.current) / 1000;
                    const remaining = Math.max(0, baseTimeRef.current - elapsed);
                    setTime(remaining);

                    if (remaining === 0) {
                        setIsRunning(false);
                        setIsActive(false); // Reset active state when done
                        startTimeRef.current = null;
                        baseTimeRef.current = 0;
                    }
                }
            }, 100); 
        } else {
            if (intervalRef.current) clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isRunning]);

    const start = useCallback(() => {
        if (!isRunning && time > 0) {
            startTimeRef.current = Date.now();
            baseTimeRef.current = time;
            setIsRunning(true);
            setIsActive(true); // Now it's officially active
        }
    }, [isRunning, time]);

    const pause = useCallback(() => {
        if (isRunning) {
            const now = Date.now();
            const elapsed = (now - (startTimeRef.current || now)) / 1000;
            const finalRemaining = Math.max(0, baseTimeRef.current - elapsed);
            
            setTime(finalRemaining);
            baseTimeRef.current = finalRemaining;
            startTimeRef.current = null;
            setIsRunning(false);
            // isActive stays true because we are just pausing
        }
    }, [isRunning]);

    const reset = useCallback(() => {
        setIsRunning(false);
        setIsActive(false); // Go back to setting/initial mode
        startTimeRef.current = null;
        baseTimeRef.current = 0;
        setTime(0);
        setInitialTime(0);
    }, []);

    const adjustTime = useCallback((seconds: number) => {
        if (!isRunning) {
            const newTime = Math.max(0, time + seconds);
            setTime(newTime);
            setInitialTime(newTime);
            baseTimeRef.current = newTime;
        }
    }, [isRunning, time]);

    const setTimeByHms = useCallback((h: number, m: number, s: number) => {
        if (!isRunning && !isActive) {
            const newSeconds = (h * 3600) + (m * 60) + s;
            setTime(newSeconds);
            setInitialTime(newSeconds);
            baseTimeRef.current = newSeconds;
        }
    }, [isRunning, isActive]);

    const formatTime = (totalSeconds: number) => {
        const floorSeconds = Math.floor(totalSeconds + 0.05); 
        const hrs = Math.floor(floorSeconds / 3600);
        const mins = Math.floor((floorSeconds % 3600) / 60);
        const secs = floorSeconds % 60;

        return {
            hours: hrs.toString().padStart(2, '0'),
            minutes: mins.toString().padStart(2, '0'),
            seconds: secs.toString().padStart(2, '0'),
        };
    };

    return {
        time,
        isRunning,
        isActive,
        initialTime,
        start,
        pause,
        reset,
        adjustTime,
        setTimeByHms,
        formattedTime: formatTime(time),
    };
}
