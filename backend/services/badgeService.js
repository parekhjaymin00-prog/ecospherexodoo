import prisma from '../prisma/client.js';

/**
 * Parse simple unlock rules from the badge's unlockRule text field.
 * Supported patterns:
 *   "XP >= 500"  or  "xp >= 500"
 *   "5 challenges completed" or "challenges >= 5"
 *   "points >= 100" or "csr points >= 100"
 * Returns { type, threshold } or null if unparseable.
 */
function parseUnlockRule(rule) {
  if (!rule) return null;
  const lower = rule.toLowerCase().trim();

  // Pattern: "xp >= N" or "xp > N"
  const xpMatch = lower.match(/xp\s*>=?\s*(\d+)/);
  if (xpMatch) return { type: 'xp', threshold: parseInt(xpMatch[1]) };

  // Pattern: "N challenges completed" or "challenges >= N"
  const chalMatch1 = lower.match(/(\d+)\s*challenges?\s*(completed|done)/);
  if (chalMatch1) return { type: 'challenges', threshold: parseInt(chalMatch1[1]) };
  const chalMatch2 = lower.match(/challenges?\s*>=?\s*(\d+)/);
  if (chalMatch2) return { type: 'challenges', threshold: parseInt(chalMatch2[1]) };

  // Pattern: "points >= N" or "csr points >= N"
  const ptsMatch = lower.match(/(csr\s*)?points?\s*>=?\s*(\d+)/);
  if (ptsMatch) return { type: 'points', threshold: parseInt(ptsMatch[2]) };

  // Pattern: "total >= N" (total XP + points)
  const totalMatch = lower.match(/total\s*>=?\s*(\d+)/);
  if (totalMatch) return { type: 'total', threshold: parseInt(totalMatch[1]) };

  return null;
}

/**
 * Check all badges and award any that the employee qualifies for.
 * Returns array of newly awarded badge names (for notifications).
 */
export async function checkAndAwardBadges(userId) {
  try {
    // Check if auto badge award is enabled
    const setting = await prisma.appSettings.findUnique({ where: { key: 'business.autoBadgeAward' } });
    if (setting && setting.value === 'false') return [];

    // Get employee metrics
    const [xpResult, completedChallenges, csrPoints] = await Promise.all([
      prisma.challengeParticipation.aggregate({ where: { userId, approvalStatus: 'approved' }, _sum: { xpAwarded: true } }),
      prisma.challengeParticipation.count({ where: { userId, approvalStatus: 'approved' } }),
      prisma.employeeParticipation.aggregate({ where: { userId, approvalStatus: 'approved' }, _sum: { pointsEarned: true } }),
    ]);

    const totalXP = xpResult._sum.xpAwarded || 0;
    const totalPoints = csrPoints._sum.pointsEarned || 0;
    const totalScore = totalXP + totalPoints;

    // Get all badges
    const badges = await prisma.badge.findMany();

    // Get already awarded badges
    const alreadyAwarded = await prisma.employeeBadge.findMany({ where: { userId }, select: { badgeId: true } });
    const awardedIds = new Set(alreadyAwarded.map(ab => ab.badgeId));

    const newlyAwarded = [];

    for (const badge of badges) {
      if (awardedIds.has(badge.id)) continue;

      const rule = parseUnlockRule(badge.unlockRule);
      if (!rule) continue; // Skip unparseable rules

      let qualifies = false;
      switch (rule.type) {
        case 'xp': qualifies = totalXP >= rule.threshold; break;
        case 'challenges': qualifies = completedChallenges >= rule.threshold; break;
        case 'points': qualifies = totalPoints >= rule.threshold; break;
        case 'total': qualifies = totalScore >= rule.threshold; break;
      }

      if (qualifies) {
        await prisma.employeeBadge.create({ data: { userId, badgeId: badge.id } });
        newlyAwarded.push(badge.name);
      }
    }

    return newlyAwarded;
  } catch (error) {
    console.error('Badge auto-award error:', error);
    return [];
  }
}
