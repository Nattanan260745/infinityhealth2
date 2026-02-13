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
    console.log(`DEBUG: CalcLevel user=${userId} cur=${currentLevel} exp=${newExp}`);
    // 1. Find the potential level based on XP
    const levelObj = await prisma.level.findFirst({
        where: { minExp: { lte: newExp } },
        orderBy: { levelNumber: 'desc' }
    });

    if (!levelObj) return currentLevel;

    let potentialLevel = levelObj.levelNumber;

    // 2. If potential level is same or lower, return currentLevel
    if (potentialLevel <= currentLevel) return currentLevel;

    // 3. Logic: User must complete "Level X Challenge" to move from X to X+1
    // Updated: User wants MANUAL Rank Up for ALL levels.
    // So if isManualRankUp is false, we just cap them at current level, even if they have XP and Challenge.

    if (potentialLevel > currentLevel && !isManualRankUp) {
        // Auto-level up DISABLED. User must press Rank Up button.
        return currentLevel;
    }

    // We check purely based on currentLevel. 
    // If user is Level 1, they MUST complete "Level 1 Challenge" to become Level 2.
    // Even if they have enough XP for Level 5, they can only go to Level 2 if they did Level 1 Challenge.
    // Then they need Level 2 Challenge to go to Level 3.
    // So we effectively calculate one step at a time or check the highest "unlocked" level.

    // Let's check if the specific challenge for the *Current Level* is done.
    // If done, we allow +1 level. Then recursively (or iteratively) check if next is done?
    // For simplicity/safety, let's just allow +1 level max per action OR simple check:
    // "You are locked at Current Level until you finish Current Level's Challenge"

    const currentLevelChallenge = await prisma.mission.findFirst({
        where: {
            missionType: 'CHALLENGE',
            requiredLevel: currentLevel, // The challenge FOR this level
            isActive: true
        }
    });

    if (!currentLevelChallenge) {
        // If no challenge exists for this level, allow progress?
        // Or strictly block?
        // Given we seeded 1-99, there SHOULD be a challenge.
        // If missing, let's be safe and allow progress to avoid softlock (unless strictly requested otherwise).
        return potentialLevel;
    }

    const userMission = await prisma.userMission.findFirst({
        where: {
            userId: parseId(userId),
            missionId: currentLevelChallenge.id,
            status: true // Completed
        }
    });

    if (!userMission) {
        // Challenge NOT completed -> Stuck at currentLevel.
        return currentLevel;
    }

    // 4. Points Check (Every 10 levels: 9->10? or 10->11?)
    // User said: "Use points every 10 levels"
    // Usually "Boss Level" is 10, 20...
    // Let's assume you need points to PASS Level 10 (move to 11) or REACH Level 10?
    // Let's say: To move from 10 -> 11, you need points.
    // Or 9 -> 10?
    // Implementation: "Every 10th level requires points".
    // Let's enforce it on the barrier: 10, 20, 30.
    // If currentLevel is 10, and we want to go to 11, check points.

    if (currentLevel % 10 === 0) {
        // We are at a boss level (e.g. 10). Trying to go to 11.
        // Check Points cost? 
        // Wait, the requirement was "Use points". Does it mean DEDUCT points? or just HAVE points?
        // "ไม่ต้องใช้point ยกเว้นทุกๆ10เลเวลที่ต้องทำภารกิจchallengeและใช้pointเหมือนเดิม"
        // "Don't use points, except every 10 levels... use points as before."

        // As before? Originally manual rank up cost points.
        // Let's assume we need to DEDUCT points or just CHECK? 
        // Manual Rank Up usually implies deduction.
        // But `calculateLevelWithCap` is a check function.
        // If `isManualRankUp` is true, we assume the deduction happens elsewhere or we allow it.

        // If NOT manual rank up, we might block 10->11 transition if it requires manual intervention.
        // Let's return `currentLevel` if it's a boss level and `isManualRankUp` is false.
        if (!isManualRankUp) {
            return currentLevel;
        }
        // If manual, we assume points were handled/checked by the caller (rank-up endpoint).
    }

    // If challenge is done, allow move to Next Level.
    // But what if they have XP for Level 5 but are at Level 1?
    // Only moving to Level 2 is safe.
    // If we just return `potentialLevel` (e.g. 5), we skip challenges 2, 3, 4.
    // User restriction: "Challenge every level".
    // So strictly: return currentLevel + 1.

    // Safety: don't exceed potential based on XP.
    if (currentLevel + 1 > potentialLevel) return potentialLevel;

    return currentLevel + 1;
};

// Helper
const parseId = (id) => parseInt(id, 10);

module.exports = { calculateLevelWithCap };
