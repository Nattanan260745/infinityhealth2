const prisma = require('../prisma');

// Helper: Get today's range
const getTodayRange = () => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return { start, end };
};

/**
 * Check and complete a mission for a user if target is met.
 * @param {number} userId - The user ID.
 * @param {string} missionName - The name of the mission to check.
 * @param {number} currentValue - The current value achieved (e.g., steps, water ml).
 */
const checkAndCompleteMission = async (userId, missionName, currentValue) => {
    try {
        const { start, end } = getTodayRange();

        // 1. Find the mission by name (Daily or Challenge)
        // Note: For CHALLENGE, we might check if it's active for the user's level, 
        // but for now we'll check all active missions with this name.
        const missions = await prisma.mission.findMany({
            where: {
                missionName: missionName,
                isActive: true
            }
        });

        if (!missions || missions.length === 0) return;

        for (const mission of missions) {
            // 2. Find or Create UserMission Record for Today/Ever
            let userMissionQuery = {
                userId: userId,
                missionId: mission.id
            };

            if (mission.missionType === 'DAILY') {
                userMissionQuery.createdAt = { gte: start, lte: end };
            }

            let userMission = await prisma.userMission.findFirst({
                where: userMissionQuery
            });

            const wasAlreadyCompleted = !!(userMission && userMission.status);
            const isNowCompleted = currentValue >= mission.targetValue;

            if (!userMission) {
                // Create new record with current progress
                userMission = await prisma.userMission.create({
                    data: {
                        userId: userId,
                        missionId: mission.id,
                        currentProgress: currentValue,
                        status: isNowCompleted,
                        completedAt: isNowCompleted ? new Date() : null
                    }
                });
            } else {
                // Update existing record progress (even if already completed, to allow sync/correction)
                userMission = await prisma.userMission.update({
                    where: { id: userMission.id },
                    data: {
                        currentProgress: currentValue,
                        status: isNowCompleted,
                        completedAt: isNowCompleted ? (userMission.completedAt || new Date()) : (userMission.completedAt || null)
                    }
                });
            }

            // 3. Grant Rewards ONLY IF it just became completed (transitions from false to true)
            if (isNowCompleted && !wasAlreadyCompleted) {
                await grantRewards(userId, mission);
            }
        }

        // 5. Trigger Streak Check (Maintain Consistency) - Only for Daily usually, but consistent behavior is fine.
        if (missionName !== 'รักษาความสม่ำเสมอ (Streak Mission)') {
            await checkStreakMission(userId);
        }

    } catch (error) {
        console.error(`Error checking mission ${missionName}:`, error);
    }
};

/**
 * Grant rewards to user
 */
const grantRewards = async (userId, mission) => {
    try {
        const userStats = await prisma.userStats.findUnique({ where: { userId } });
        if (!userStats) return;

        const newExp = userStats.currentExp + mission.rewardExp;
        const newPoints = userStats.totalPoints + mission.rewardPoints;

        // Level Calculation (Simplified)
        let level = userStats.level;
        const { calculateLevelWithCap } = require('./levelUtils'); // Assuming this exists or we use simple logic
        // We will try to use the existing utility if possible, otherwise simple logic
        try {
            level = await calculateLevelWithCap(level, newExp, userId, false);
        } catch (e) {
            // Fallback if util not available or fails
            console.warn("Level util failed, using simple increment if needed");
        }


        await prisma.userStats.update({
            where: { userId },
            data: {
                currentExp: newExp,
                totalPoints: newPoints,
                level: level,
                lastActivityDate: new Date()
            }
        });

        // Notification
        // OLD: Always create notification
        // NEW: Skip notification for ALL missions (User request: Only Routines)
        // if (mission.missionType !== 'DAILY') {
        //     await prisma.notification.create({
        //         data: {
        //             userId,
        //             type: 'MISSION_COMPLETED',
        //             title: 'Mission Completed! 🎉',
        //             message: `You completed: ${mission.missionName}. Earned ${mission.rewardExp} XP & ${mission.rewardPoints} Points.`,
        //             referenceId: mission.id
        //         }
        //     });
        // }

    } catch (error) {
        console.error('Error granting rewards:', error);
    }
};

/**
 * Check "Maintain Consistency" mission (3 missions per day)
 */
const checkStreakMission = async (userId) => {
    try {
        console.log(`--- [STREAK DEBUG] Starting check for User ${userId} ---`);
        
        // 1. Identify the Streak Mission using EXACT name first, then fallback
        let streakMission = await prisma.mission.findFirst({
            where: {
                missionName: 'รักษาความสม่ำเสมอ (Streak Mission)',
                isActive: true
            }
        });

        // Fallback if the exact name isn't found (using the previous contains logic)
        if (!streakMission) {
            streakMission = await prisma.mission.findFirst({
                where: {
                    missionName: { contains: 'รักษาความสม่ำเสมอ' },
                    isActive: true
                }
            });
        }

        if (!streakMission) {
            console.log('--- [STREAK DEBUG] Streak Mission NOT FOUND ---');
            return;
        }

        const streakMissionName = streakMission.missionName;
        const { start, end } = getTodayRange();

        // 2. Count missions COMPLETED today (using completedAt to be most accurate)
        // This should match the visual "Completed" count in the app
        const completedMissions = await prisma.userMission.findMany({
            where: {
                userId: userId,
                status: true,
                completedAt: { gte: start, lte: end },
                missionId: { not: streakMission.id }
            },
            include: { mission: true }
        });

        const completedCount = completedMissions.length;
        const cappedCount = Math.min(completedCount, 3); // Cap display at target (3)
        
        console.log(`--- [STREAK DEBUG] Found ${completedCount} missions, capping at ${cappedCount} for User ${userId} ---`);
        
        // 3. Sync the progress
        await checkAndCompleteMission(userId, streakMissionName, cappedCount);
        console.log(`--- [STREAK DEBUG] Check completed. Final Progress set to: ${cappedCount}/3 ---`);

    } catch (error) {
        console.error('--- [STREAK ERROR] ---', error);
    }
};

module.exports = {
    checkAndCompleteMission,
    checkStreakMission
};
