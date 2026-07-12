import prisma from '../prisma/client.js';

export async function getPolicies(req, res) {
  try {
    const { search, status, page = 1, limit = 10, sort = 'createdAt', order = 'desc' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);
    const where = {};
    if (search) { where.OR = [{ title: { contains: search, mode: 'insensitive' } }, { description: { contains: search, mode: 'insensitive' } }]; }
    if (status) where.status = status;
    const orderBy = { [sort]: order };
    const [policies, total] = await Promise.all([
      prisma.eSGPolicy.findMany({ where, orderBy, skip, take, include: { _count: { select: { acknowledgements: true } } } }),
      prisma.eSGPolicy.count({ where }),
    ]);
    return res.json({ policies, pagination: { total, page: parseInt(page), limit: take, totalPages: Math.ceil(total / take) } });
  } catch (error) { console.error(error); return res.status(500).json({ error: 'Internal server error' }); }
}

export async function getPolicyById(req, res) {
  try {
    const policy = await prisma.eSGPolicy.findUnique({ where: { id: req.params.id }, include: { acknowledgements: { include: { user: { select: { id: true, fullName: true, email: true } } }, orderBy: { acknowledgedAt: 'desc' } } } });
    if (!policy) return res.status(404).json({ error: 'Policy not found' });
    return res.json({ policy });
  } catch (error) { console.error(error); return res.status(500).json({ error: 'Internal server error' }); }
}

export async function createPolicy(req, res) {
  try {
    const { title, description, content, version, status, effectiveAt } = req.body;
    if (!title || !content) return res.status(400).json({ error: 'Title and content are required' });
    const existing = await prisma.eSGPolicy.findFirst({ where: { title: { equals: title, mode: 'insensitive' } } });
    if (existing) return res.status(409).json({ error: 'Policy with this title already exists' });
    const policy = await prisma.eSGPolicy.create({ data: { title, description: description || null, content, version: version || '1.0', status: status || 'draft', effectiveAt: effectiveAt ? new Date(effectiveAt) : null } });
    return res.status(201).json({ policy });
  } catch (error) { console.error(error); return res.status(500).json({ error: 'Internal server error' }); }
}

export async function updatePolicy(req, res) {
  try {
    const { id } = req.params;
    const { title, description, content, version, status, effectiveAt } = req.body;
    const existing = await prisma.eSGPolicy.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Policy not found' });
    if (title && title !== existing.title) {
      const dup = await prisma.eSGPolicy.findFirst({ where: { title: { equals: title, mode: 'insensitive' }, id: { not: id } } });
      if (dup) return res.status(409).json({ error: 'Policy with this title already exists' });
    }
    const policy = await prisma.eSGPolicy.update({ where: { id }, data: { title: title || existing.title, description: description !== undefined ? description : existing.description, content: content || existing.content, version: version || existing.version, status: status || existing.status, effectiveAt: effectiveAt !== undefined ? (effectiveAt ? new Date(effectiveAt) : null) : existing.effectiveAt } });
    return res.json({ policy });
  } catch (error) { console.error(error); return res.status(500).json({ error: 'Internal server error' }); }
}

export async function deletePolicy(req, res) {
  try {
    const { id } = req.params;
    const existing = await prisma.eSGPolicy.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Policy not found' });
    await prisma.policyAcknowledgement.deleteMany({ where: { policyId: id } });
    await prisma.eSGPolicy.delete({ where: { id } });
    return res.json({ message: 'Policy deleted successfully' });
  } catch (error) { console.error(error); return res.status(500).json({ error: 'Internal server error' }); }
}

export async function acknowledgePolicy(req, res) {
  try {
    const { policyId } = req.body;
    if (!policyId) return res.status(400).json({ error: 'policyId is required' });
    const policy = await prisma.eSGPolicy.findUnique({ where: { id: policyId } });
    if (!policy) return res.status(404).json({ error: 'Policy not found' });
    const existing = await prisma.policyAcknowledgement.findUnique({ where: { userId_policyId: { userId: req.user.id, policyId } } });
    if (existing) return res.status(409).json({ error: 'Already acknowledged' });
    const ack = await prisma.policyAcknowledgement.create({ data: { userId: req.user.id, policyId }, include: { user: { select: { id: true, fullName: true } }, policy: { select: { id: true, title: true } } } });
    return res.status(201).json({ acknowledgement: ack });
  } catch (error) { console.error(error); return res.status(500).json({ error: 'Internal server error' }); }
}

export async function getPolicyStats(req, res) {
  try {
    const [total, active, draft, archived, totalAcks] = await Promise.all([
      prisma.eSGPolicy.count(),
      prisma.eSGPolicy.count({ where: { status: 'active' } }),
      prisma.eSGPolicy.count({ where: { status: 'draft' } }),
      prisma.eSGPolicy.count({ where: { status: 'archived' } }),
      prisma.policyAcknowledgement.count(),
    ]);
    return res.json({ total, active, draft, archived, totalAcknowledgements: totalAcks });
  } catch (error) { console.error(error); return res.status(500).json({ error: 'Internal server error' }); }
}
