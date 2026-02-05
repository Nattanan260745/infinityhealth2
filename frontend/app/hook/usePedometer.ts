import { useState, useEffect } from 'react';
import { Pedometer } from 'expo-sensors';
import { Platform } from 'react-native';

export function usePedometer() {
    const [currentStepCount, setCurrentStepCount] = useState(0);
    const [isPedometerAvailable, setIsPedometerAvailable] = useState<string>('checking');

    useEffect(() => {
        let subscription: Pedometer.Subscription | null = null;
        let isMounted = true;

        const subscribe = async () => {
            try {
                // Request permissions first (Required for Android 10+)
                const perm = await Pedometer.requestPermissionsAsync();

                if (!isMounted) return;

                if (!perm.granted) {
                    setIsPedometerAvailable('denied');
                    return;
                }

                const isAvailable = await Pedometer.isAvailableAsync();

                if (!isMounted) return;
                setIsPedometerAvailable(String(isAvailable));

                if (isAvailable) {
                    if (Platform.OS === 'ios') {
                        const end = new Date();
                        const start = new Date();
                        start.setHours(0, 0, 0, 0);

                        // Get steps already taken today before app opened
                        const pastStepCountResult = await Pedometer.getStepCountAsync(start, end);
                        let initialSteps = 0;

                        if (pastStepCountResult) {
                            initialSteps = pastStepCountResult.steps;
                            if (isMounted) setCurrentStepCount(initialSteps); // Set initial
                        }

                        // Watch for NEW steps during this session
                        subscription = Pedometer.watchStepCount(result => {
                            // On iOS, result.steps in watchStepCount is cumulative for the current session.
                            if (isMounted) setCurrentStepCount(initialSteps + result.steps);
                        });
                    } else {
                        // Android
                        // For Android, watchStepCount returns steps since boot or per session differently across vendors.
                        // We will just listen to the stream.

                        // Set initial to 0 to indicate "Ready" instead of "Loading"
                        if (isMounted) setCurrentStepCount(0);

                        subscription = Pedometer.watchStepCount(result => {
                            // On some Androids, this is steps since boot.
                            // We can't easily distinguish "today" without extensive logic (Google Fit API).
                            // For now, we display the raw sensor value.
                            if (isMounted) setCurrentStepCount(result.steps);
                        });
                    }
                }
            } catch (error) {
                if (isMounted) setIsPedometerAvailable('error');
                console.error('[Pedometer] Error:', error);
            }
        };

        subscribe();

        return () => {
            isMounted = false;
            subscription && subscription.remove();
        };
    }, []);

    return { currentStepCount, isPedometerAvailable };
}
