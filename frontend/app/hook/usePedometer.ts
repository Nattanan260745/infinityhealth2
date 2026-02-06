import { useState, useEffect, useRef } from 'react';
import { Pedometer } from 'expo-sensors';
import { Platform, AppState, AppStateStatus } from 'react-native';
import storage from '../utils/storage';

export function usePedometer() {
    const [currentStepCount, setCurrentStepCount] = useState(0);
    const [isPedometerAvailable, setIsPedometerAvailable] = useState<string>('checking');

    // Refs to track values without re-renders
    const baseStepsRef = useRef(0); // Loaded from storage
    const initialSensorValRef = useRef<number | null>(null); // First value from sensor in this session
    const currentSessionStepsRef = useRef(0); // Steps taken in this active session
    const todayStrRef = useRef<string>('');

    const getTodayStr = () => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    };

    const loadRef = useRef(false);

    useEffect(() => {
        let subscription: Pedometer.Subscription | null = null;
        let isMounted = true;

        const initPedometer = async () => {
            try {
                // 1. Load saved steps for TODAY
                const today = getTodayStr();
                todayStrRef.current = today;

                const savedKey = `pedometer_steps_${today}`;
                console.log('[Pedometer] Loading saved steps from:', savedKey);
                const savedVal = await storage.getItem(savedKey);
                console.log('[Pedometer] Saved value:', savedVal);

                if (savedVal) {
                    baseStepsRef.current = parseInt(savedVal, 10) || 0;
                } else {
                    baseStepsRef.current = 0;
                }

                if (isMounted) {
                    console.log('[Pedometer] Setting initial step count:', baseStepsRef.current);
                    setCurrentStepCount(baseStepsRef.current);
                }

                // 2. Request Permissions
                const perm = await Pedometer.requestPermissionsAsync();
                if (!isMounted) return;
                if (!perm.granted) {
                    setIsPedometerAvailable('denied');
                    return;
                }

                const isAvailable = await Pedometer.isAvailableAsync();
                if (!isMounted) return;
                setIsPedometerAvailable(String(isAvailable));

                // 3. Start Watching
                if (isAvailable) {
                    subscription = Pedometer.watchStepCount(result => {
                        if (!isMounted) return;

                        // Check if day changed while running
                        const currentToday = getTodayStr();
                        if (currentToday !== todayStrRef.current) {
                            // Reset for new day
                            todayStrRef.current = currentToday;
                            baseStepsRef.current = 0;
                            initialSensorValRef.current = null; // Reset sensor baseline
                            currentSessionStepsRef.current = 0;
                        }

                        // Handle Android Sensor Logic
                        // Sensor value might be:
                        // A) Cumulative from boot (e.g. 15000, 15002...)
                        // B) Session based starting at 0 (e.g. 0, 2, 5...)
                        // We normalize both by capturing the FIRST value as baseline.

                        if (initialSensorValRef.current === null) {
                            initialSensorValRef.current = result.steps;
                        }

                        // Calculate steps taken SINCE subscribing
                        const sessionDelta = result.steps - initialSensorValRef.current;

                        // Sanity check: Ensure delta is positive (in case of weird reset)
                        // If delta is huge negative, maybe reboot happened? -> Just ignore or reset baseline
                        if (sessionDelta < 0) {
                            initialSensorValRef.current = result.steps; // Reset baseline
                            return;
                        }

                        currentSessionStepsRef.current = sessionDelta;

                        // Total = Saved(Base) + Session
                        const total = baseStepsRef.current + currentSessionStepsRef.current;

                        setCurrentStepCount(total);

                        // Auto-Save constantly (debouncing is better but this is fine for local KV)
                        storage.setItem(`pedometer_steps_${todayStrRef.current}`, total);
                    });
                }

            } catch (error) {
                if (isMounted) setIsPedometerAvailable('error');
                console.error('[Pedometer] Error:', error);
            }
        };

        initPedometer();

        return () => {
            isMounted = false;
            subscription && subscription.remove();
        };
    }, []);

    return { currentStepCount, isPedometerAvailable };
}
