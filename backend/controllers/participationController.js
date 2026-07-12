import prisma from '../prisma/client.js';
import { checkAndAwardBadges } from '../services/badgeService.js';
import { createNotification } from '../services/notificationService.js';

// GET /api/participations
export async function getParticipations(req, res) {
  try {
    const { search, status, activityId, page = 1, limit = 10, sort = 'createdAt', order = 'desc' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {};
    if (status) where.approvalStatus = status;
    if (activityId) where.activityId = activityId;
    if (search) {
      where.OR = [
        { user: { fullName: { contains: search, mode: 'insensitive' } } },
        { activity: { title: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const orderBy = {};
    orderBy[sort] = order;

    const [participations, total] = await Promise.all([
      prisma.employeeParticipation.findMany({
        where,
        orderBy,
        skip,
        take,
        include: {
          user: { select: { id: true, fullName: true, email: true } },
          activity: { select: { id: true, title: true, startDate: true, endDate: true } },
        },
      }),
      prisma.employeeParticipation.count({ where }),
    ]);

    return res.json({
      participations,
      pagination: { total, page: parseInt(page), limit: take, totalPages: Math.ceil(total / take) },
    });
  } catch (error) {
    console.error('Get participations error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// GET /api/participations/my
export async function getMyParticipations(req, res) {
  try {
    const participations = await prisma.employeeParticipation.findMany({
      where: { userId: req.user.id },
      include: {
        activity: {
          select: { id: true, title: true, startDate: true, endDate: true },
          include: { category: { select: { name: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ participations });
  } catch (error) {
    console.error('Get my participations error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// POST /api/participations/join
export async function joinActivity(req, res) {
  try {
    const { activityId } = req.body;
    if (!activityId) return res.status(400).json({ error: 'activityId is required' });

    const activity = await prisma.cSRActivity.findUnique({ where: { id: activityId } });
    if (!activity) return res.status(404).json({ error: 'Activity not found' });

    const existing = await prisma.employeeParticipation.findUnique({
      where: { userId_activityId: { userId: req.user.id, activityId } },
    });
    if (existing) return res.status(409).json({ error: 'Already participating in this activity' });

    if (activity.maxParticipants) {
      const count = await prisma.employeeParticipation.count({ where: { activityId } });
      if (count >= activity.maxParticipants) {
        return res.status(400).json({ error: 'Activity is at maximum capacity' });
      }
    }

    const participation = await prisma.employeeParticipation.create({
      data: { userId: req.user.id, activityId },
      include: {
        activity: { select: { id: true, title: true } },
        user: { select: { id: true, fullName: true } },
      },
    });

    return res.status(201).json({ participation });
  } catch (error) {
    console.error('Join activity error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// PUT /api/participations/:id/approve
export async function approveParticipation(req, res) {
  try {
    const { id } = req.params;
    const { approvalStatus, pointsEarned } = req.body;

    if (!['approved', 'rejected'].includes(approvalStatus)) {
      return res.status(400).json({ error: 'approvalStatus must be approved or rejected' });
    }

    const existing = await prisma.employeeParticipation.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Participation not found' });

    const participation = await prisma.employeeParticipation.update({
      where: { id },
      data: {
        approvalStatus,
        pointsEarned: approvalStatus === 'approved' ? (parseInt(pointsEarned) || 10) : 0,
        completionDate: approvalStatus === 'approved' ? new Date() : null,
      },
      include: {
        user: { select: { id: true, fullName: true } },
        activity: { select: { id: true, title: true } },
      },
    });

    // Notify the employee
    await createNotification(existing.userId, 'csr_approval', `Your CSR activity "${participation.activity.title}" was ${approvalStatus}`);

    // If approved, check for badge auto-award
    if (approvalStatus === 'approved') {
      const newBadges = await checkAndAwardBadges(existing.userId);
      for (const badgeName of newBadges) {
        await createNotification(existing.userId, 'badge_unlock', `You unlocked the "${badgeName}" badge!`);
      }
    }

    return res.json({ participation });
  } catch (error) {
    console.error('Approve participation error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// PUT /api/participations/:id/proof
export async function uploadProof(req, res) {
  try {
    const { id } = req.params;
    const { proofUrl } = req.body;

    if (!proofUrl) return res.status(400).json({ error: 'proofUrl is required' });

    const existing = await prisma.employeeParticipation.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Participation not found' });

    const participation = await prisma.employeeParticipation.update({
      where: { id },
      data: { proofUrl },
      include: {
        user: { select: { id: true, fullName: true } },
        activity: { select: { id: true, title: true } },
      },
    });

    return res.json({ participation });
  } catch (error) {
    console.error('Upload proof error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// DELETE /api/participations/:id
export async function deleteParticipation(req, res) {
  try {
    const { id } = req.params;
    const existing = await prisma.employeeParticipation.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Participation not found' });

    await prisma.employeeParticipation.delete({ where: { id } });
    return res.json({ message: 'Participation removed successfully' });
  } catch (error) {
    console.error('Delete participation error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
