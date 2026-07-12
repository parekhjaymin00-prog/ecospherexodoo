import prisma from '../prisma/client.js';
import { checkAndAwardBadges } from '../services/badgeService.js';
import { createNotification } from '../services/notificationService.js';

export async function getChallenges(req, res) {
  try {
    const { search, status, difficulty, page = 1, limit = 10, sort = 'createdAt', order = 'desc' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);
    const where = {};
    if (search) { where.OR = [{ title: { contains: search, mode: 'insensitive' } }, { description: { contains: search, mode: 'insensitive' } }]; }
    if (status) where.status = status;
    if (difficulty) where.difficulty = difficulty;
    const [challenges, total] = await Promise.all([
      prisma.challenge.findMany({ where, orderBy: { [sort]: order }, skip, take, include: { category: { select: { id: true, name: true } }, _count: { select: { participations: true } } } }),
      prisma.challenge.count({ where }),
    ]);
    return res.json({ challenges, pagination: { total, page: parseInt(page), limit: take, totalPages: Math.ceil(total / take) } });
  } catch (error) { console.error(error); return res.status(500).json({ error: 'Internal server error' }); }
}

export async function getChallengeById(req, res) {
  try {
    const challenge = await prisma.challenge.findUnique({ where: { id: req.params.id }, include: { category: { select: { id: true, name: true } }, participations: { include: { user: { select: { id: true, fullName: true } } }, orderBy: { createdAt: 'desc' } } } });
    if (!challenge) return res.status(404).json({ error: 'Challenge not found' });
    return res.json({ challenge });
  } catch (error) { console.error(error); return res.status(500).json({ error: 'Internal server error' }); }
}

export async function createChallenge(req, res) {
  try {
    const { title, description, xpReward, difficulty, evidenceRequired, deadline, status, categoryId } = req.body;
    if (!title || !categoryId) return res.status(400).json({ error: 'Title and categoryId are required' });
    const challenge = await prisma.challenge.create({ data: { title, description: description || null, xpReward: parseInt(xpReward) || 0, difficulty: difficulty || 'medium', evidenceRequired: evidenceRequired || false, deadline: deadline ? new Date(deadline) : null, status: status || 'draft', categoryId }, include: { category: { select: { id: true, name: true } } } });
    return res.status(201).json({ challenge });
  } catch (error) { console.error(error); return res.status(500).json({ error: 'Internal server error' }); }
}

export async function updateChallenge(req, res) {
  try {
    const { id } = req.params;
    const { title, description, xpReward, difficulty, evidenceRequired, deadline, status, categoryId } = req.body;
    const existing = await prisma.challenge.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Challenge not found' });
    const challenge = await prisma.challenge.update({ where: { id }, data: { title: title || existing.title, description: description !== undefined ? description : existing.description, xpReward: xpReward !== undefined ? parseInt(xpReward) : existing.xpReward, difficulty: difficulty || existing.difficulty, evidenceRequired: evidenceRequired !== undefined ? evidenceRequired : existing.evidenceRequired, deadline: deadline !== undefined ? (deadline ? new Date(deadline) : null) : existing.deadline, status: status || existing.status, categoryId: categoryId || existing.categoryId }, include: { category: { select: { id: true, name: true } } } });
    return res.json({ challenge });
  } catch (error) { console.error(error); return res.status(500).json({ error: 'Internal server error' }); }
}

export async function deleteChallenge(req, res) {
  try {
    const { id } = req.params;
    const existing = await prisma.challenge.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Challenge not found' });
    await prisma.challengeParticipation.deleteMany({ where: { challengeId: id } });
    await prisma.challenge.delete({ where: { id } });
    return res.json({ message: 'Challenge deleted successfully' });
  } catch (error) { console.error(error); return res.status(500).json({ error: 'Internal server error' }); }
}

export async function joinChallenge(req, res) {
  try {
    const { challengeId } = req.body;
    if (!challengeId) return res.status(400).json({ error: 'challengeId is required' });
    const challenge = await prisma.challenge.findUnique({ where: { id: challengeId } });
    if (!challenge) return res.status(404).json({ error: 'Challenge not found' });
    if (challenge.status !== 'active') return res.status(400).json({ error: 'Challenge is not active' });
    const existing = await prisma.challengeParticipation.findUnique({ where: { userId_challengeId: { userId: req.user.id, challengeId } } });
    if (existing) return res.status(409).json({ error: 'Already joined this challenge' });
    const participation = await prisma.challengeParticipation.create({ data: { userId: req.user.id, challengeId }, include: { challenge: { select: { id: true, title: true, xpReward: true } } } });
    return res.status(201).json({ participation });
  } catch (error) { console.error(error); return res.status(500).json({ error: 'Internal server error' }); }
}

export async function updateChallengeProgress(req, res) {
  try {
    const { id } = req.params;
    const { progress, proofUrl } = req.body;
    const existing = await prisma.challengeParticipation.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Participation not found' });
    const data = {};
    if (progress !== undefined) data.progress = Math.min(parseFloat(progress), 100);
    if (proofUrl !== undefined) data.proofUrl = proofUrl;
    const updated = await prisma.challengeParticipation.update({ where: { id }, data, include: { challenge: { select: { id: true, title: true, xpReward: true } }, user: { select: { id: true, fullName: true } } } });
    return res.json({ participation: updated });
  } catch (error) { console.error(error); return res.status(500).json({ error: 'Internal server error' }); }
}

export async function approveChallengeParticipation(req, res) {
  try {
    const { id } = req.params;
    const { approvalStatus } = req.body;
    if (!['approved', 'rejected'].includes(approvalStatus)) return res.status(400).json({ error: 'Invalid status' });
    const existing = await prisma.challengeParticipation.findUnique({ where: { id }, include: { challenge: true } });
    if (!existing) return res.status(404).json({ error: 'Participation not found' });
    const xpAwarded = approvalStatus === 'approved' ? existing.challenge.xpReward : 0;
    const updated = await prisma.challengeParticipation.update({ where: { id }, data: { approvalStatus, xpAwarded, progress: approvalStatus === 'approved' ? 100 : existing.progress }, include: { challenge: { select: { id: true, title: true } }, user: { select: { id: true, fullName: true } } } });

    // Notify the employee
    await createNotification(existing.userId, 'challenge_approval', `Your challenge "${updated.challenge.title}" was ${approvalStatus}`);

    // If approved, check for badge auto-award
    if (approvalStatus === 'approved') {
      const newBadges = await checkAndAwardBadges(existing.userId);
      for (const badgeName of newBadges) {
        await createNotification(existing.userId, 'badge_unlock', `You unlocked the "${badgeName}" badge!`);
      }
    }

    return res.json({ participation: updated, newBadges: approvalStatus === 'approved' ? await getNewBadgeNames(existing.userId) : [] });
  } catch (error) { console.error(error); return res.status(500).json({ error: 'Internal server error' }); }
}

async function getNewBadgeNames(userId) {
  // Helper to return recently awarded badges (last minute) for toast display
  const oneMinAgo = new Date(Date.now() - 60000);
  const recent = await prisma.employeeBadge.findMany({ where: { userId, awardedAt: { gte: oneMinAgo } }, include: { badge: { select: { name: true } } } });
  return recent.map(r => r.badge.name);
}

export async function getChallengeStats(req, res) {
  try {
    const [total, active, completed, totalParticipants] = await Promise.all([
      prisma.challenge.count(),
      prisma.challenge.count({ where: { status: 'active' } }),
      prisma.challenge.count({ where: { status: 'completed' } }),
      prisma.challengeParticipation.count(),
    ]);
    const totalXP = await prisma.challengeParticipation.aggregate({ _sum: { xpAwarded: true } });
    return res.json({ total, active, completed, totalParticipants, totalXPAwarded: totalXP._sum.xpAwarded || 0 });
  } catch (error) { console.error(error); return res.status(500).json({ error: 'Internal server error' }); }
}
