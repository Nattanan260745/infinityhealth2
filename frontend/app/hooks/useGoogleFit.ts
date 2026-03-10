import { useState, useEffect, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { authorizeGoogleFit, getDailySteps, checkPermissions } from '../service/GoogleFitService';
import GoogleFit from 'react-native-google-fit';
import { Pedometer } from 'expo-sensors';
import storage from '../utils/storage';

const SYSTEM_STEPS_KEY = 'google_fit_steps_today';

// Global shared state to prevent race conditions across multiple hook instances
let globalHasAttemptedAuth = false;
let globalIsAuthInProgress = false;

export const useGoogleFit = () => {
    const [steps, setSteps] = useState<number>(0);
    const [sessionSteps, setSessionSteps] = useState<number>(0);
    const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    // Local state to trigger re-renders, synced with global
    const [attempted, setAttempted] = useState<boolean>(globalHasAttemptedAuth);

    // Load cached steps on mount
    useEffect(() => {
        const loadCache = async () => {
            try {
                const now = new Date();
                const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
                const legacyTodayStr = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`; // Non-padded

                const cached = await storage.getItem(SYSTEM_STEPS_KEY);
                const cachedDate = await storage.getItem('google_fit_steps_date');

                // Support both formats during transition
                if (cached && (cachedDate === todayStr || cachedDate === legacyTodayStr)) {
                    setSteps(parseInt(cached, 10));
                    console.log(`[GoogleFit] Restored cached steps: ${cached}`);

                    // Migrate to new format if it was legacy
                    if (cachedDate === legacyTodayStr && cachedDate !== todayStr) {
                        storage.setItem('google_fit_steps_date', todayStr);
                    }
                }
            } catch (err) {
                console.warn("[GoogleFit] Failed to load cache:", err);
            } finally {
                // Initial baseline established
                setLoading(false);
            }
        };
        loadCache();
    }, []);

    const fetchSteps = useCallback(async () => {
        try {
            const stepCount = await getDailySteps();
            console.log("Fetched GoogleFit steps:", stepCount);

            const now = new Date();
            const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
            const cachedDate = await storage.getItem('google_fit_steps_date');
            const cachedValueStr = await storage.getItem(SYSTEM_STEPS_KEY);
            const cachedValue = cachedValueStr ? parseInt(cachedValueStr, 10) : 0;

            // If it's a new day, we allow 0 or any value (reset)
            if (todayStr !== cachedDate) {
                console.log(`[GoogleFit] Day change detected (${cachedDate} -> ${todayStr}). Resetting steps.`);
                setSteps(stepCount);
                setSessionSteps(0);
                storage.setItem(SYSTEM_STEPS_KEY, stepCount.toString());
                storage.setItem('google_fit_steps_date', todayStr);
            } else if (stepCount > cachedValue) {
                // Only update if it's an increase for the same day
                setSteps(stepCount);
                setSessionSteps(0);
                storage.setItem(SYSTEM_STEPS_KEY, stepCount.toString());
            } else {
                console.log(`[GoogleFit] Ignoring zero/lower value (${stepCount}) for same day (${cachedValue})`);
            }
        } catch (error) {
            console.error("Failed to fetch steps:", error);
        }
    }, []);

    const initializeGoogleFit = useCallback(async () => {
        if (globalIsAuthInProgress) {
            console.log("[GoogleFit] Auth already in progress, skipping concurrent call.");
            return;
        }

        setLoading(true);
        const isAuthorizedFit = GoogleFit.isAuthorized;
        const hasRuntimePermissions = await checkPermissions();

        console.log(`[GoogleFit] Authorized: ${isAuthorizedFit}, RuntimePerms: ${hasRuntimePermissions}`);

        if (isAuthorizedFit && hasRuntimePermissions) {
            setIsAuthorized(true);
            await fetchSteps();
        } else {
            console.log("[GoogleFit] Not fully authorized. Requesting auth...");
            globalIsAuthInProgress = true;
            const success = await authorizeGoogleFit();
            globalIsAuthInProgress = false;

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
                globalHasAttemptedAuth = true;

                const cachedValueStr = await storage.getItem(SYSTEM_STEPS_KEY);
                const cachedDate = await storage.getItem('google_fit_steps_date');
                const now = new Date();
                const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

                if (cachedValueStr && cachedDate === todayStr) {
                    setSteps(parseInt(cachedValueStr, 10));
                }
            }
        }

        setLoading(false);
    }, [fetchSteps]);

    // Hybrid Logic: Pedometer for Real-time Foreground Updates
    useEffect(() => {
        // Only auto-initialize if we haven't failed an attempt yet globally
        if (!globalHasAttemptedAuth) {
            initializeGoogleFit();
        }

        const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
            if (nextAppState === 'active') {
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
                    setSessionSteps(result.steps);

                    // Periodically cache total to avoid loss on app close
                    // Note: We use the local 'steps' (Google Fit baseline) + the real-time session increment
                    // Since we can't easily access the current 'steps' value inside this closure safely without it being stale
                    // we accept that this might slightly lag until the next Hook re-render cycle, 
                    // but for storage it's generally okay as it only INCREASES.
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

    // Total steps = Google Fit Baseline + Session Pedometer Steps
    const totalSteps = loading ? steps : (steps + sessionSteps);

    return {
        steps: totalSteps,
        setBaselineSteps: setSteps, // Allow upward syncing from API
        isAuthorized,
        loading,
        refetch: fetchSteps,
        authorize: initializeGoogleFit
    };
};
