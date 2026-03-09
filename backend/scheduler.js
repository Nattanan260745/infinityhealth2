
const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const OneSignal = require('onesignal-node');

// --- CONFIGURATION ---
const ONESIGNAL_APP_ID = '62a8a981-4a2b-4a4f-8b7b-e67c65ff0017';
const ONESIGNAL_API_KEY = 'os_v2_app_mkuktakkfnfe7c334z6gl7yac5nng24zwq4ujmuvkkb5elazbom7feqa4aucoeiwidpocsfmr7hyvkh2yteoid3fz52bywxfj4x4dsq';

// --- INITIALIZATION ---
const prisma = new PrismaClient();
const client = new OneSignal.Client(ONESIGNAL_APP_ID, ONESIGNAL_API_KEY);

console.log('[Scheduler] InfinityHealth Notification Service Started... 🚀');

// --- HELPER: Get Current Time (HH:MM) ---
// --- HELPER: Get Current Time (Thailand) ---
function getCurrentTime() {
    const now = new Date();
    // Force UTC+7 (Thailand)
    // Server is likely UTC. 
    now.setHours(now.getHours() + 7);

    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}

// --- CRON JOB: Runs every minute ---
cron.schedule('* * * * *', async () => {
    const timeStr = getCurrentTime();
    console.log(`[Scheduler] Checking for routines at ${timeStr}...`);

    try {
        // DEBUG: Print ALL routines to find why query fails
        const allRoutines = await prisma.routine.findMany({ take: 5, orderBy: { createdAt: 'desc' } });
        console.log('[DEBUG] Last 5 routines in DB:', JSON.stringify(allRoutines, null, 2));

        // 1. Find Routines scheduled for NOW
        // Schema: Routine.scheduledTime (String "HH:MM")
        const routines = await prisma.routine.findMany({
            where: {
                scheduledTime: timeStr,
                // Note: Currently no 'days' column in schema, assuming daily for now.
                completed: false
            },
            include: {
                user: true // Include user to get ID for OneSignal
            }
        });

        if (routines.length === 0) {
            console.log(`[Scheduler] No routines found for ${timeStr}.`);
            return;
        }

        console.log(`[Scheduler] Found ${routines.length} routines to notify.`);

        // 2. Send Notifications
        for (const routine of routines) {
            if (!routine.userId && !routine.user?.id) continue;

            const userId = String(routine.userId || routine.user.id);
            console.log(`   -> Notifying User ${userId} for routine: ${routine.title}`);

            try {
                // 1.5 Check if we already notified this user for this routine TODAY
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const tomorrow = new Date(today);
                tomorrow.setDate(tomorrow.getDate() + 1);

                const existingNotification = await prisma.notification.findFirst({
                    where: {
                        userId: parseInt(userId),
                        type: 'ROUTINE_REMINDER',
                        referenceId: routine.id,
                        createdAt: {
                            gte: today,
                            lt: tomorrow
                        }
                    }
                });

                if (existingNotification) {
                    console.log(`      Already notified today for routine ${routine.id}. Skipping.`);
                    continue;
                }

                // Instead of OneSignal, create a Notification record in DB
                // Frontend will poll for 'isSent: false' notifications
                const newNotification = await prisma.notification.create({
                    data: {
                        userId: parseInt(userId),
                        type: 'ROUTINE_REMINDER',
                        title: 'ได้เวลาแล้ว!',
                        message: `ถึงเวลา ${routine.title} แล้วนะครับ`,
                        isRead: false,
                        isSent: false,
                        notiAt: new Date(), // Set current time as notification time
                        referenceId: routine.id
                    }
                });
                console.log(`      Created DB Notification ID: ${newNotification.id}`);
            } catch (e) {
                console.error(`      Failed to create DB notification for User ${userId}:`, e);
            }
        }

    } catch (error) {
        console.error('[Scheduler] Error in cron job:', error);
    }
});

// Keep process alive
process.stdin.resume();
