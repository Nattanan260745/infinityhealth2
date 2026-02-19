import GoogleFit, { Scopes, BucketUnit } from 'react-native-google-fit';
import { Platform, PermissionsAndroid } from 'react-native';

const GOOGLE_FIT_OPTIONS = {
    scopes: [
        Scopes.FITNESS_ACTIVITY_READ,
        Scopes.FITNESS_ACTIVITY_WRITE,
        Scopes.FITNESS_LOCATION_READ
    ],
};

export const checkPermissions = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
        try {
            const granted = await PermissionsAndroid.requestMultiple([
                PermissionsAndroid.PERMISSIONS.ACTIVITY_RECOGNITION,
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
            ]);

            return (
                granted['android.permission.ACTIVITY_RECOGNITION'] === PermissionsAndroid.RESULTS.GRANTED &&
                granted['android.permission.ACCESS_FINE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED
            );
        } catch (err) {
            console.warn(err);
            return false;
        }
    }
    return true;
};

export const authorizeGoogleFit = async (): Promise<boolean> => {
    try {
        // Check runtime permissions first
        const hasPermissions = await checkPermissions();
        if (!hasPermissions) {
            // Continue anyway, GoogleFit.authorize might trigger its own flow or fail gracefully
            console.log("Runtime permissions not fully granted, attempting Google Fit auth...");
        }

        const authResult = await GoogleFit.authorize(GOOGLE_FIT_OPTIONS);
        if (authResult.success) {
            return true;
        } else {
            console.warn("Google Fit Authorization failed:", authResult.message);
            return false;
        }
    } catch (error) {
        console.error("Google Fit Authorization error:", error);
        return false;
    }
};

export const checkIsAuthorized = async (): Promise<boolean> => {
    // checkIsAuthorized is a sync property in some versions or method in others, 
    // but the library exposes `GoogleFit.isAuthorized` as a boolean property after initialization.
    // However, it's safer to rely on `authorize` which is idempotent if already authorized.
    return GoogleFit.isAuthorized;
}


export const getDailySteps = async (date: Date = new Date()): Promise<number> => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const options = {
        startDate: startOfDay.toISOString(),
        endDate: endOfDay.toISOString(),
        bucketUnit: BucketUnit.DAY, // Correct enum usage
        bucketInterval: 1,
    };

    try {
        const res = await GoogleFit.getDailyStepCountSamples(options);

        // Find 'com.google.android.gms:estimated_steps' which is the merged stream
        const estimatedSource = res.find(source => source.source === "com.google.android.gms:estimated_steps");

        let totalSteps = 0;

        if (estimatedSource) {
            estimatedSource.steps.forEach(step => {
                totalSteps += step.value;
            });
        } else {
            // Fallback: if multiple sources (watch, phone), avoid double counting.
            // Taking the one with the highest count is a common heuristic if merged stream is missing,
            // OR summing them up if they are distinct time intervals (which is hard to know here).
            // Let's try to find *any* valid source if estimated is missing.
            if (res.length > 0) {
                const maxStepsSource = res.reduce((prev, current) => {
                    const currentTotal = current.steps.reduce((sum, s) => sum + s.value, 0);
                    const prevTotal = prev.steps.reduce((sum, s) => sum + s.value, 0);
                    return currentTotal > prevTotal ? current : prev;
                });

                maxStepsSource.steps.forEach(step => {
                    totalSteps += step.value;
                });
            }
        }

        return totalSteps;
    } catch (error) {
        console.error("Error fetching daily steps:", error);
        return 0;
    }
};
