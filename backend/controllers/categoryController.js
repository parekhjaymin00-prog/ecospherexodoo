import prisma from '../prisma/client.js';

// GET /api/categories
export async function getCategories(req, res) {
  try {
    const { type, status } = req.query;
    const where = {};
    if (type) where.type = type;
    if (status) where.status = status;

    const categories = await prisma.category.findMany({
      where,
      orderBy: { name: 'asc' },
    });
    return res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// POST /api/categories
export async function createCategory(req, res) {
  try {
    const { name, type, status } = req.body;
    if (!name || !type) return res.status(400).json({ error: 'Name and type are required' });
    if (!['CSR_ACTIVITY', 'CHALLENGE'].includes(type)) {
      return res.status(400).json({ error: 'Type must be CSR_ACTIVITY or CHALLENGE' });
    }

    const existing = await prisma.category.findFirst({
      where: { name: { equals: name, mode: 'insensitive' }, type },
    });
    if (existing) return res.status(409).json({ error: 'Category already exists' });

    const category = await prisma.category.create({
      data: { name, type, status: status || 'active' },
    });
    return res.status(201).json({ category });
  } catch (error) {
    console.error('Create category error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
