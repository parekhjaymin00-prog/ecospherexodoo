import prisma from '../prisma/client.js';

export async function getBadges(req, res) {
  try {
    const badges = await prisma.badge.findMany({ orderBy: { name: 'asc' } });
    return res.json({ badges });
  } catch (error) { console.error(error); return res.status(500).json({ error: 'Internal server error' }); }
}

export async function createBadge(req, res) {
  try {
    const { name, description, unlockRule, icon } = req.body;
    if (!name || !unlockRule) return res.status(400).json({ error: 'Name and unlockRule are required' });
    const badge = await prisma.badge.create({ data: { name, description: description || null, unlockRule, icon: icon || null } });
    return res.status(201).json({ badge });
  } catch (error) { console.error(error); return res.status(500).json({ error: 'Internal server error' }); }
}

export async function updateBadge(req, res) {
  try {
    const { id } = req.params;
    const { name, description, unlockRule, icon } = req.body;
    const existing = await prisma.badge.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Badge not found' });
    const badge = await prisma.badge.update({ where: { id }, data: { name: name || existing.name, description: description !== undefined ? description : existing.description, unlockRule: unlockRule || existing.unlockRule, icon: icon !== undefined ? icon : existing.icon } });
    return res.json({ badge });
  } catch (error) { console.error(error); return res.status(500).json({ error: 'Internal server error' }); }
}

export async function deleteBadge(req, res) {
  try {
    const { id } = req.params;
    await prisma.badge.delete({ where: { id } });
    return res.json({ message: 'Badge deleted successfully' });
  } catch (error) { console.error(error); return res.status(500).json({ error: 'Internal server error' }); }
}
