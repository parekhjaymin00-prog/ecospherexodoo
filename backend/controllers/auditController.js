import prisma from '../prisma/client.js';

export async function getAudits(req, res) {
  try {
    const { search, status, page = 1, limit = 10, sort = 'auditDate', order = 'desc' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);
    const where = {};
    if (search) { where.OR = [{ title: { contains: search, mode: 'insensitive' } }, { description: { contains: search, mode: 'insensitive' } }]; }
    if (status) where.status = status;
    const [audits, total] = await Promise.all([
      prisma.audit.findMany({ where, orderBy: { [sort]: order }, skip, take, include: { lead: { select: { id: true, fullName: true } }, _count: { select: { complianceIssues: true } } } }),
      prisma.audit.count({ where }),
    ]);
    return res.json({ audits, pagination: { total, page: parseInt(page), limit: take, totalPages: Math.ceil(total / take) } });
  } catch (error) { console.error(error); return res.status(500).json({ error: 'Internal server error' }); }
}

export async function getAuditById(req, res) {
  try {
    const audit = await prisma.audit.findUnique({ where: { id: req.params.id }, include: { lead: { select: { id: true, fullName: true, email: true } }, complianceIssues: { include: { owner: { select: { id: true, fullName: true } } }, orderBy: { createdAt: 'desc' } } } });
    if (!audit) return res.status(404).json({ error: 'Audit not found' });
    return res.json({ audit });
  } catch (error) { console.error(error); return res.status(500).json({ error: 'Internal server error' }); }
}

export async function createAudit(req, res) {
  try {
    const { title, description, auditDate, status, findings } = req.body;
    if (!title || !auditDate) return res.status(400).json({ error: 'Title and auditDate are required' });
    const audit = await prisma.audit.create({ data: { title, description: description || null, auditDate: new Date(auditDate), status: status || 'scheduled', findings: findings || null, leadId: req.user.id }, include: { lead: { select: { id: true, fullName: true } } } });
    return res.status(201).json({ audit });
  } catch (error) { console.error(error); return res.status(500).json({ error: 'Internal server error' }); }
}

export async function updateAudit(req, res) {
  try {
    const { id } = req.params;
    const { title, description, auditDate, status, findings } = req.body;
    const existing = await prisma.audit.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Audit not found' });
    const audit = await prisma.audit.update({ where: { id }, data: { title: title || existing.title, description: description !== undefined ? description : existing.description, auditDate: auditDate ? new Date(auditDate) : existing.auditDate, status: status || existing.status, findings: findings !== undefined ? findings : existing.findings }, include: { lead: { select: { id: true, fullName: true } } } });
    return res.json({ audit });
  } catch (error) { console.error(error); return res.status(500).json({ error: 'Internal server error' }); }
}

export async function deleteAudit(req, res) {
  try {
    const { id } = req.params;
    const existing = await prisma.audit.findUnique({ where: { id }, include: { _count: { select: { complianceIssues: true } } } });
    if (!existing) return res.status(404).json({ error: 'Audit not found' });
    if (existing._count.complianceIssues > 0) { await prisma.complianceIssue.deleteMany({ where: { auditId: id } }); }
    await prisma.audit.delete({ where: { id } });
    return res.json({ message: 'Audit deleted successfully' });
  } catch (error) { console.error(error); return res.status(500).json({ error: 'Internal server error' }); }
}

export async function getAuditStats(req, res) {
  try {
    const [total, scheduled, inProgress, completed] = await Promise.all([
      prisma.audit.count(),
      prisma.audit.count({ where: { status: 'scheduled' } }),
      prisma.audit.count({ where: { status: 'in_progress' } }),
      prisma.audit.count({ where: { status: 'completed' } }),
    ]);
    return res.json({ total, scheduled, inProgress, completed });
  } catch (error) { console.error(error); return res.status(500).json({ error: 'Internal server error' }); }
}
