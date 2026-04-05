import { useState, useEffect, useCallback, useRef } from 'react';

export function useTimer() {
    const [time, setTime] = useState(0); // Time in seconds
    const [isRunning, setIsRunning] = useState(false);
    
    // We use a ref to store the timestamp of when the timer started/resumed 
    // to prevent drift and handle backgrounding smoothly if needed.
    const startTimeRef = useRef<number | null>(null);
    const accruedTimeRef = useRef<number>(0);
    const frameRef = useRef<number | null>(null);

    const tick = useCallback(() => {
        if (startTimeRef.current !== null) {
            const now = Date.now();
            const elapsed = Math.floor((now - startTimeRef.current) / 1000);
            setTime(accruedTimeRef.current + elapsed);
            frameRef.current = requestAnimationFrame(tick);
        }
    }, []);

    const start = useCallback(() => {
        if (!isRunning) {
            setIsRunning(true);
            startTimeRef.current = Date.now();
            frameRef.current = requestAnimationFrame(tick);
        }
    }, [isRunning, tick]);

    const pause = useCallback(() => {
        if (isRunning) {
            setIsRunning(false);
            if (startTimeRef.current !== null) {
                const now = Date.now();
                accruedTimeRef.current += Math.floor((now - startTimeRef.current) / 1000);
            }
            if (frameRef.current) cancelAnimationFrame(frameRef.current);
            startTimeRef.current = null;
        }
    }, [isRunning]);

    const reset = useCallback(() => {
        setIsRunning(false);
        if (frameRef.current) cancelAnimationFrame(frameRef.current);
        startTimeRef.current = null;
        accruedTimeRef.current = 0;
        setTime(0);
    }, []);

    useEffect(() => {
        // Cleanup loop on unmount
        return () => {
            if (frameRef.current) cancelAnimationFrame(frameRef.current);
        };
    }, []);

    const formatTime = (totalSeconds: number) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = Math.floor(totalSeconds % 60);

        return {
            hours: hours.toString().padStart(2, '0'),
            minutes: minutes.toString().padStart(2, '0'),
            seconds: seconds.toString().padStart(2, '0'),
        };
    };

    return {
        time,
        isRunning,
        start,
        pause,
        reset,
        formattedTime: formatTime(time)
    };
}
