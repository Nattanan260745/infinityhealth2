import { useState, useEffect, useRef } from 'react';
import { Pedometer } from 'expo-sensors';
import { Platform, AppState, AppStateStatus } from 'react-native';
import storage from '../utils/storage';

export function usePedometer() {
    const [currentStepCount, setCurrentStepCount] = useState(0);
    const [isPedometerAvailable, setIsPedometerAvailable] = useState<string>('checking');

    const appState = useRef(AppState.currentState);
    const isFetching = useRef(false);

    const getTodayRange = () => {
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const end = new Date();
        return { start, end };
    };

    const getStorageKey = async () => {
        const userId = await storage.getItem('internalUserId') || await storage.getItem('userId') || 'guest';
        const { start } = getTodayRange();
        const todayStr = start.toISOString().split('T')[0];
        return `pedometer_steps_${userId}_${todayStr}`;
    };

    // Core function: Get Truth from System
    const fetchTotalSteps = async () => {
        if (isFetching.current) return;
        isFetching.current = true;

        try {
            const isAvailable = await Pedometer.isAvailableAsync();
            if (isAvailable) {
                const { start, end } = getTodayRange();

                // 1. Get History (The Truth)
                let systemSteps = 0;
                try {
                    const result = await Pedometer.getStepCountAsync(start, end);
                    if (result) systemSteps = result.steps;
                } catch (e) {
                    console.log('[Pedometer] History fetch failed:', e);
                }

                // 2. Get Local (The Backup)
                const key = await getStorageKey();
                const savedVal = await storage.getItem(key);
                const localSteps = savedVal ? parseInt(savedVal, 10) : 0;

                // 3. Ratchet: Never go down.
                // If System says 0 (bug), use Local.
                // If System says 500 (walked), update Local.
                // Note: We do NOT use "current internal state" here. Source of truth is external.
                // Actually, to be safe, let's also check current state? 
                // No, state might be stale. Trust usage of Local Storage + System.

                const finalSteps = Math.max(systemSteps, localSteps);

                console.log(`[Pedometer] Sync: System=${systemSteps}, Local=${localSteps} -> Final=${finalSteps}`);

                setCurrentStepCount(finalSteps);

                if (finalSteps > localSteps) {
                    storage.setItem(key, finalSteps.toString());
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            isFetching.current = false;
        }
    };

    useEffect(() => {
        let subscription: Pedometer.Subscription | null = null;

        const init = async () => {
            const perm = await Pedometer.requestPermissionsAsync();
            if (!perm.granted) {
                setIsPedometerAvailable('denied');
                return;
            }

            const available = await Pedometer.isAvailableAsync();
            setIsPedometerAvailable(String(available));

            if (available) {
                // 1. Initial Sync
                await fetchTotalSteps();

                // 2. Watcher: Just a Trigger!
                // We don't care about the 'result' object values (which can be confusing).
                // We just know "User moved" -> "Go check the updated total".
                subscription = Pedometer.watchStepCount(() => {
                    fetchTotalSteps();
                });
            }
        };

        init();

        // 3. App State Background -> Foreground
        const subscriptionAppState = AppState.addEventListener('change', nextAppState => {
            if (
                appState.current.match(/inactive|background/) &&
                nextAppState === 'active'
            ) {
                console.log('[Pedometer] Resumed. Fetching...');
                fetchTotalSteps();
            }
            appState.current = nextAppState;
        });

        return () => {
            subscription && subscription.remove();
            subscriptionAppState.remove();
        };
    }, []);

    return { currentStepCount, isPedometerAvailable };
}
