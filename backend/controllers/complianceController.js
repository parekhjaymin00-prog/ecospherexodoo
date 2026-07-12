import prisma from '../prisma/client.js';
import { createNotification } from '../services/notificationService.js';

export async function getComplianceIssues(req, res) {
  try {
    const { search, status, severity, page = 1, limit = 10, sort = 'createdAt', order = 'desc' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);
    const where = {};
    if (search) where.description = { contains: search, mode: 'insensitive' };
    if (status) where.status = status;
    if (severity) where.severity = severity;
    const [issues, total] = await Promise.all([
      prisma.complianceIssue.findMany({ where, orderBy: { [sort]: order }, skip, take, include: { audit: { select: { id: true, title: true } }, owner: { select: { id: true, fullName: true } } } }),
      prisma.complianceIssue.count({ where }),
    ]);
    return res.json({ issues, pagination: { total, page: parseInt(page), limit: take, totalPages: Math.ceil(total / take) } });
  } catch (error) { console.error(error); return res.status(500).json({ error: 'Internal server error' }); }
}

export async function createComplianceIssue(req, res) {
  try {
    const { description, severity, dueDate, status, auditId, ownerId } = req.body;
    if (!description || !severity || !dueDate || !auditId || !ownerId) return res.status(400).json({ error: 'Description, severity, dueDate, auditId, and ownerId are required' });
    const issue = await prisma.complianceIssue.create({ data: { description, severity, dueDate: new Date(dueDate), status: status || 'open', auditId, ownerId }, include: { audit: { select: { id: true, title: true } }, owner: { select: { id: true, fullName: true } } } });
    // Notify the assigned owner
    await createNotification(ownerId, 'compliance_issue', `New compliance issue assigned: "${description.slice(0, 60)}"`);
    return res.status(201).json({ issue });
  } catch (error) { console.error(error); return res.status(500).json({ error: 'Internal server error' }); }
}

export async function updateComplianceIssue(req, res) {
  try {
    const { id } = req.params;
    const { description, severity, dueDate, status, ownerId } = req.body;
    const existing = await prisma.complianceIssue.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Issue not found' });
    const issue = await prisma.complianceIssue.update({ where: { id }, data: { description: description || existing.description, severity: severity || existing.severity, dueDate: dueDate ? new Date(dueDate) : existing.dueDate, status: status || existing.status, ownerId: ownerId || existing.ownerId }, include: { audit: { select: { id: true, title: true } }, owner: { select: { id: true, fullName: true } } } });
    return res.json({ issue });
  } catch (error) { console.error(error); return res.status(500).json({ error: 'Internal server error' }); }
}

export async function deleteComplianceIssue(req, res) {
  try {
    const { id } = req.params;
    const existing = await prisma.complianceIssue.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Issue not found' });
    await prisma.complianceIssue.delete({ where: { id } });
    return res.json({ message: 'Issue deleted successfully' });
  } catch (error) { console.error(error); return res.status(500).json({ error: 'Internal server error' }); }
}

export async function getComplianceStats(req, res) {
  try {
    const [total, open, resolved, overdue] = await Promise.all([
      prisma.complianceIssue.count(),
      prisma.complianceIssue.count({ where: { status: 'open' } }),
      prisma.complianceIssue.count({ where: { status: 'resolved' } }),
      prisma.complianceIssue.count({ where: { status: 'overdue' } }),
    ]);
    const bySeverity = await prisma.complianceIssue.groupBy({ by: ['severity'], _count: true });
    return res.json({ total, open, resolved, overdue, bySeverity });
  } catch (error) { console.error(error); return res.status(500).json({ error: 'Internal server error' }); }
}
