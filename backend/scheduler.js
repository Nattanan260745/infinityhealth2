
const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const OneSignal = require('onesignal-node');

// --- CONFIGURATION ---
const ONESIGNAL_APP_ID = '62a8a981-4a2b-4a4f-8b7b-e67c65ff0017';
const ONESIGNAL_API_KEY = 'os_v2_app_mkuktakkfnfe7c334z6gl7yac5iwthdmnr2uypfemn7m5pnf4d2ur53ptfm24ikcishttvm2q6gitygq6wryqsi7v3ax7q7j3e54hty';

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

            const notification = {
                headings: { en: 'InfinityHealth 🧘', th: 'ได้เวลาแล้ว!' },
                contents: {
                    en: `It's time for your routine: ${routine.title}`,
                    th: `ถึงเวลา ${routine.title} แล้วนะครับ`
                },
                include_aliases: {
                    external_id: [userId] // Target specific user by our DB ID
                },
                target_channel: 'push',
            };

            try {
                const response = await client.createNotification(notification);
                console.log(`      Success! OneSignal ID: ${response.body.id}`);
            } catch (e) {
                console.error(`      Failed to send to User ${userId}:`, e.statusCode, e.body);
            }
        }

    } catch (error) {
        console.error('[Scheduler] Error in cron job:', error);
    }
});

// Keep process alive
process.stdin.resume();
