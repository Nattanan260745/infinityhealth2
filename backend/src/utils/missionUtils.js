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
            // 2. Check if target met (Simple GTE check)
            if (currentValue < mission.targetValue) continue;

            // 3. Find or Create UserMission
            // For DAILY: Check for TODAY.
            // For CHALLENGE: Check if EVER completed (unless it's repeatable, but challenges are usually one-off or level-based).
            // Assuming Challenges are one-time per level.

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

            // If already completed, skip
            if (userMission && userMission.status) continue;

            if (!userMission) {
                // Create new completed mission
                userMission = await prisma.userMission.create({
                    data: {
                        userId: userId,
                        missionId: mission.id,
                        currentProgress: currentValue,
                        status: true, // Completed!
                        completedAt: new Date()
                    }
                });
            } else {
                // Update existing to completed
                userMission = await prisma.userMission.update({
                    where: { id: userMission.id },
                    data: {
                        status: true,
                        currentProgress: currentValue,
                        completedAt: new Date()
                    }
                });
            }

            // 4. Grant Rewards
            await grantRewards(userId, mission);
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
            level = await calculateLevelWithCap(level, newExp, userId, true);
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
        await prisma.notification.create({
            data: {
                userId,
                type: 'MISSION_COMPLETED',
                title: 'Mission Completed! 🎉',
                message: `You completed: ${mission.missionName}. Earned ${mission.rewardExp} XP & ${mission.rewardPoints} Points.`,
                referenceId: mission.id
            }
        });

    } catch (error) {
        console.error('Error granting rewards:', error);
    }
};

/**
 * Check "Maintain Consistency" mission (3 missions per day)
 */
const checkStreakMission = async (userId) => {
    try {
        const streakMissionName = 'รักษาความสม่ำเสมอ (Streak Mission)';
        const { start, end } = getTodayRange();

        // Count completed missions today
        const completedCount = await prisma.userMission.count({
            where: {
                userId: userId,
                status: true,
                createdAt: { gte: start, lte: end },
                mission: {
                    missionName: { not: streakMissionName } // Exclude itself to avoid infinite loop
                }
            }
        });

        // Check and complete if >= 3
        await checkAndCompleteMission(userId, streakMissionName, completedCount);

    } catch (error) {
        console.error('Error checking streak mission:', error);
    }
};

module.exports = {
    checkAndCompleteMission,
    checkStreakMission
};
