import prisma from '../prisma/client.js';

export async function getRewards(req, res) {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);
    const where = {};
    if (status) where.status = status;
    const [rewards, total] = await Promise.all([
      prisma.reward.findMany({ where, orderBy: { pointsRequired: 'asc' }, skip, take }),
      prisma.reward.count({ where }),
    ]);
    return res.json({ rewards, pagination: { total, page: parseInt(page), limit: take, totalPages: Math.ceil(total / take) } });
  } catch (error) { console.error(error); return res.status(500).json({ error: 'Internal server error' }); }
}

export async function createReward(req, res) {
  try {
    const { name, description, pointsRequired, stock, status } = req.body;
    if (!name || !pointsRequired) return res.status(400).json({ error: 'Name and pointsRequired are required' });
    const reward = await prisma.reward.create({ data: { name, description: description || null, pointsRequired: parseInt(pointsRequired), stock: parseInt(stock) || 0, status: status || 'active' } });
    return res.status(201).json({ reward });
  } catch (error) { console.error(error); return res.status(500).json({ error: 'Internal server error' }); }
}

export async function updateReward(req, res) {
  try {
    const { id } = req.params;
    const { name, description, pointsRequired, stock, status } = req.body;
    const existing = await prisma.reward.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Reward not found' });
    const reward = await prisma.reward.update({ where: { id }, data: { name: name || existing.name, description: description !== undefined ? description : existing.description, pointsRequired: pointsRequired ? parseInt(pointsRequired) : existing.pointsRequired, stock: stock !== undefined ? parseInt(stock) : existing.stock, status: status || existing.status } });
    return res.json({ reward });
  } catch (error) { console.error(error); return res.status(500).json({ error: 'Internal server error' }); }
}

export async function deleteReward(req, res) {
  try {
    const { id } = req.params;
    await prisma.reward.delete({ where: { id } });
    return res.json({ message: 'Reward deleted successfully' });
  } catch (error) { console.error(error); return res.status(500).json({ error: 'Internal server error' }); }
}

export async function redeemReward(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const reward = await prisma.reward.findUnique({ where: { id } });
    if (!reward) return res.status(404).json({ error: 'Reward not found' });
    if (reward.stock <= 0) return res.status(400).json({ error: 'Reward is out of stock' });

    // Calculate employee's total points (CSR participation points + challenge XP)
    const [csrPoints, challengeXP] = await Promise.all([
      prisma.employeeParticipation.aggregate({ where: { userId, approvalStatus: 'approved' }, _sum: { pointsEarned: true } }),
      prisma.challengeParticipation.aggregate({ where: { userId, approvalStatus: 'approved' }, _sum: { xpAwarded: true } }),
    ]);

    const totalPoints = (csrPoints._sum.pointsEarned || 0) + (challengeXP._sum.xpAwarded || 0);

    if (totalPoints < reward.pointsRequired) {
      return res.status(400).json({ error: `Insufficient points. You have ${totalPoints} but need ${reward.pointsRequired}`, currentPoints: totalPoints, required: reward.pointsRequired });
    }

    // Deduct points by reducing the most recent approved CSR participation points
    // We'll deduct from XP first, then CSR points
    let remaining = reward.pointsRequired;

    // Deduct from challenge XP
    if (remaining > 0) {
      const challengeParticipations = await prisma.challengeParticipation.findMany({ where: { userId, approvalStatus: 'approved', xpAwarded: { gt: 0 } }, orderBy: { createdAt: 'desc' } });
      for (const cp of challengeParticipations) {
        if (remaining <= 0) break;
        const deduct = Math.min(cp.xpAwarded, remaining);
        await prisma.challengeParticipation.update({ where: { id: cp.id }, data: { xpAwarded: cp.xpAwarded - deduct } });
        remaining -= deduct;
      }
    }

    // Deduct from CSR points if still remaining
    if (remaining > 0) {
      const csrParticipations = await prisma.employeeParticipation.findMany({ where: { userId, approvalStatus: 'approved', pointsEarned: { gt: 0 } }, orderBy: { createdAt: 'desc' } });
      for (const ep of csrParticipations) {
        if (remaining <= 0) break;
        const deduct = Math.min(ep.pointsEarned, remaining);
        await prisma.employeeParticipation.update({ where: { id: ep.id }, data: { pointsEarned: ep.pointsEarned - deduct } });
        remaining -= deduct;
      }
    }

    // Decrement stock
    const updatedReward = await prisma.reward.update({ where: { id }, data: { stock: reward.stock - 1, status: reward.stock - 1 <= 0 ? 'out_of_stock' : reward.status } });

    return res.json({ message: 'Reward redeemed successfully!', reward: updatedReward, pointsSpent: reward.pointsRequired });
  } catch (error) { console.error(error); return res.status(500).json({ error: 'Internal server error' }); }
}

export async function getMyPoints(req, res) {
  try {
    const userId = req.user.id;
    const [csrPoints, challengeXP] = await Promise.all([
      prisma.employeeParticipation.aggregate({ where: { userId, approvalStatus: 'approved' }, _sum: { pointsEarned: true } }),
      prisma.challengeParticipation.aggregate({ where: { userId, approvalStatus: 'approved' }, _sum: { xpAwarded: true } }),
    ]);
    const totalPoints = (csrPoints._sum.pointsEarned || 0) + (challengeXP._sum.xpAwarded || 0);
    return res.json({ totalPoints, csrPoints: csrPoints._sum.pointsEarned || 0, challengeXP: challengeXP._sum.xpAwarded || 0 });
  } catch (error) { console.error(error); return res.status(500).json({ error: 'Internal server error' }); }
}
