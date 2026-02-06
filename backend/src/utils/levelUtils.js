const prisma = require('../prisma');

/**
 * Calculates the new level based on EXP, enforcing a cap every 10 levels.
 * @param {number} currentLevel - The user's current level.
 * @param {number} newExp - The user's new total EXP.
 * @param {number} userId - The user's ID (to check for challenge completion).
 * @param {boolean} isManualRankUp - If true, allows crossing the barrier if conditions met.
 * @returns {Promise<number>} - The final level (capped or upgraded).
 */
const calculateLevelWithCap = async (currentLevel, newExp, userId, isManualRankUp = false) => {
    // 1. Find the potential level based on XP
    const levelObj = await prisma.level.findFirst({
        where: { minExp: { lte: newExp } },
        orderBy: { levelNumber: 'desc' }
    });

    if (!levelObj) return currentLevel;

    const potentialLevel = levelObj.levelNumber;

    // 2. If potential level is same or lower, return currentLevel (Avoid de-leveling from Admin overrides)
    if (potentialLevel <= currentLevel) return currentLevel;

    // 3. Define the Barrier (Multiple of 10)
    // If Level 9, Barrier is 10.
    // If Level 10, Barrier is 10.
    const barrier = Math.ceil((currentLevel || 1) / 10) * 10;

    // 4. Check if we are trying to cross the barrier
    if (potentialLevel > barrier) {
        // Attempting to exceed barrier (10 -> 11)

        // Check challenge
        const challengeMission = await prisma.mission.findFirst({
            where: {
                missionType: 'CHALLENGE',
                requiredLevel: barrier,
                isActive: true
            }
        });

        if (challengeMission) {
            const userMission = await prisma.userMission.findFirst({
                where: {
                    userId: parseInt(userId),
                    missionId: challengeMission.id,
                    status: true // Completed
                }
            });

            if (!userMission) {
                // Challenge NOT completed -> Cap at Barrier.
                return barrier;
            }

            // Challenge Completed.

            // KEY CHANGE: Even if challenge is completed, do NOT auto-upgrade if at the cap.
            // We wait for Manual Rank Up action.
            // Exception: If we are simply MOVING TO the cap (9->10), we allow it.
            // But crossing (10->11) requires manual action OR passing the flag.

            if (currentLevel === barrier) {
                if (isManualRankUp) {
                    return potentialLevel; // Allow upgrade
                } else {
                    return barrier; // Hold at cap until manual press
                }
            }
        }
    }

    // If not crossing barrier, or if no challenge exists, return potential
    return potentialLevel;
};

module.exports = { calculateLevelWithCap };
