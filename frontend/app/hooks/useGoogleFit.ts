import { useState, useEffect, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { authorizeGoogleFit, getDailySteps, checkPermissions } from '../service/GoogleFitService';
import GoogleFit from 'react-native-google-fit';
import { Pedometer } from 'expo-sensors';
import storage from '../utils/storage';

const SYSTEM_STEPS_KEY = 'google_fit_steps_today';

export const useGoogleFit = () => {
    const [steps, setSteps] = useState<number>(0);
    const [sessionSteps, setSessionSteps] = useState<number>(0);
    const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);

    // Load cached steps on mount
    useEffect(() => {
        const loadCache = async () => {
            const cached = await storage.getItem(SYSTEM_STEPS_KEY);
            if (cached) {
                setSteps(parseInt(cached, 10));
            }
        };
        loadCache();
    }, []);

    const fetchSteps = useCallback(async () => {
        try {
            const stepCount = await getDailySteps();
            console.log("Fetched GoogleFit steps:", stepCount);
            setSteps(stepCount);
            // Reset session steps on every fresh fetch from Google Fit to avoid double counting
            setSessionSteps(0);
            // Cache the new value
            storage.setItem(SYSTEM_STEPS_KEY, stepCount.toString());
        } catch (error) {
            console.error("Failed to fetch steps:", error);
        }
    }, []);

    const initializeGoogleFit = useCallback(async () => {
        setLoading(true);

        const isAuthorizedFit = GoogleFit.isAuthorized;
        const hasRuntimePermissions = await checkPermissions();

        console.log(`[GoogleFit] Authorized: ${isAuthorizedFit}, RuntimePerms: ${hasRuntimePermissions}`);

        if (isAuthorizedFit && hasRuntimePermissions) {
            console.log("[GoogleFit] Already authorized with permissions. Fetching silently...");
            setIsAuthorized(true);
            await fetchSteps();
        } else {
            console.log("[GoogleFit] Not fully authorized. Requesting auth...");
            const success = await authorizeGoogleFit();
            console.log("[GoogleFit] Auth Success:", success);

            if (success) {
                setIsAuthorized(true);
                await fetchSteps();

                GoogleFit.startRecording(
                    (callback) => {
                    },
                    ['step']
                );
            } else {
                setIsAuthorized(false);
            }
        }

        setLoading(false);
    }, [fetchSteps]);

    // Hybrid Logic: Pedometer for Real-time Foreground Updates
    useEffect(() => {
        initializeGoogleFit();

        const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
            if (nextAppState === 'active') {
                // When coming back to foreground, re-sync with Google Fit to get the latest background data
                // and reset our local session counter.
                if (GoogleFit.isAuthorized) {
                    fetchSteps();
                }
            }
        });

        // Pedometer Subscription
        let pedometerSubscription: any;

        const startPedometer = async () => {
            const isAvailable = await Pedometer.isAvailableAsync();
            if (isAvailable) {
                // Watch for real-time updates
                pedometerSubscription = Pedometer.watchStepCount(result => {
                    // Pedometer returns number of steps since subscription started
                    setSessionSteps(result.steps);
                });
            }
        };

        startPedometer();

        return () => {
            subscription.remove();
            if (pedometerSubscription) {
                pedometerSubscription.remove();
            }
        };
    }, [initializeGoogleFit, fetchSteps]);

    // Expose a refetch function
    // Total steps = Google Fit Baseline + Session Pedometer Steps
    return {
        steps: steps + sessionSteps,
        isAuthorized,
        loading,
        refetch: fetchSteps,
        authorize: initializeGoogleFit
    };
};
