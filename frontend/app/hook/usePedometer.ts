import { useState, useEffect } from 'react';
import { Pedometer } from 'expo-sensors';
import { Platform } from 'react-native';

export function usePedometer() {
    const [currentStepCount, setCurrentStepCount] = useState(0);
    const [isPedometerAvailable, setIsPedometerAvailable] = useState<string>('checking');

    useEffect(() => {
        let subscription: Pedometer.Subscription | null = null;

        const subscribe = async () => {
            const isAvailable = await Pedometer.isAvailableAsync();
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
                        setCurrentStepCount(initialSteps); // Set initial
                    }

                    // Watch for NEW steps during this session
                    // On iOS, result.steps in watchStepCount is cumulative for the current session.
                    // So we should NOT add it to 'prev', but rather: Total = Initial + SessionSteps
                    subscription = Pedometer.watchStepCount(result => {
                        setCurrentStepCount(initialSteps + result.steps);
                    });
                } else {
                    // Android
                    // watchStepCount returns steps since boot.
                    subscription = Pedometer.watchStepCount(result => {
                        setCurrentStepCount(result.steps);
                    });
                }
            }
        };

        subscribe();

        return () => {
            subscription && subscription.remove();
        };
    }, []);

    return { currentStepCount, isPedometerAvailable };
}
