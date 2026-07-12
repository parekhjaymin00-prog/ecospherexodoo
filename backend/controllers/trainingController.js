import prisma from '../prisma/client.js';

export async function getTrainingRecords(req, res) {
  try {
    const { search, status, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);
    const where = {};
    if (status) where.status = status;
    if (search) { where.OR = [{ trainingName: { contains: search, mode: 'insensitive' } }, { user: { fullName: { contains: search, mode: 'insensitive' } } }]; }
    const [records, total] = await Promise.all([
      prisma.trainingRecord.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take, include: { user: { select: { id: true, fullName: true, email: true } } } }),
      prisma.trainingRecord.count({ where }),
    ]);
    return res.json({ records, pagination: { total, page: parseInt(page), limit: take, totalPages: Math.ceil(total / take) } });
  } catch (error) { console.error(error); return res.status(500).json({ error: 'Internal server error' }); }
}

export async function createTrainingRecord(req, res) {
  try {
    const { trainingName, userId, status } = req.body;
    if (!trainingName || !userId) return res.status(400).json({ error: 'trainingName and userId are required' });
    const record = await prisma.trainingRecord.create({ data: { trainingName, userId, status: status || 'not_started' }, include: { user: { select: { id: true, fullName: true } } } });
    return res.status(201).json({ record });
  } catch (error) { console.error(error); return res.status(500).json({ error: 'Internal server error' }); }
}

export async function updateTrainingRecord(req, res) {
  try {
    const { id } = req.params;
    const { status, completionDate } = req.body;
    const existing = await prisma.trainingRecord.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Record not found' });
    const data = {};
    if (status) data.status = status;
    if (status === 'completed') data.completionDate = completionDate ? new Date(completionDate) : new Date();
    if (status === 'not_started' || status === 'in_progress') data.completionDate = null;
    const record = await prisma.trainingRecord.update({ where: { id }, data, include: { user: { select: { id: true, fullName: true } } } });
    return res.json({ record });
  } catch (error) { console.error(error); return res.status(500).json({ error: 'Internal server error' }); }
}

export async function deleteTrainingRecord(req, res) {
  try {
    const { id } = req.params;
    await prisma.trainingRecord.delete({ where: { id } });
    return res.json({ message: 'Record deleted' });
  } catch (error) { console.error(error); return res.status(500).json({ error: 'Internal server error' }); }
}

export async function getDiversityMetrics(req, res) {
  try {
    const [byGender, byEmploymentType, byDepartment, total] = await Promise.all([
      prisma.user.groupBy({ by: ['gender'], _count: true }),
      prisma.user.groupBy({ by: ['employmentType'], _count: true }),
      prisma.user.groupBy({ by: ['departmentId'], _count: true }),
      prisma.user.count(),
    ]);
    // Resolve department names
    const deptIds = byDepartment.filter(d => d.departmentId).map(d => d.departmentId);
    const depts = await prisma.department.findMany({ where: { id: { in: deptIds } }, select: { id: true, name: true } });
    const deptMap = Object.fromEntries(depts.map(d => [d.id, d.name]));
    const departmentBreakdown = byDepartment.map(d => ({ department: d.departmentId ? deptMap[d.departmentId] || 'Unknown' : 'Unassigned', count: d._count }));

    return res.json({
      total,
      byGender: byGender.map(g => ({ gender: g.gender || 'Not specified', count: g._count })),
      byEmploymentType: byEmploymentType.map(e => ({ type: e.employmentType || 'Not specified', count: e._count })),
      byDepartment: departmentBreakdown,
    });
  } catch (error) { console.error(error); return res.status(500).json({ error: 'Internal server error' }); }
}
