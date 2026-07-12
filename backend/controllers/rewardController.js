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
