import prisma from '../prisma/client.js';

export async function getEnvironmentalReport(req, res) {
  try {
    const { startDate, endDate } = req.query;
    const dateFilter = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);
    const txWhere = Object.keys(dateFilter).length ? { transactionDate: dateFilter } : {};

    const [totalEmissions, byScope, monthlyTrend, goals, goalStats] = await Promise.all([
      prisma.carbonTransaction.aggregate({ _sum: { emissionAmount: true }, _count: true, where: txWhere }),
      prisma.carbonTransaction.groupBy({ by: ['scope'], _sum: { emissionAmount: true }, _count: true, where: txWhere }),
      prisma.carbonTransaction.findMany({ where: txWhere, orderBy: { transactionDate: 'asc' }, select: { emissionAmount: true, transactionDate: true, scope: true } }),
      prisma.environmentalGoal.findMany({ orderBy: { endDate: 'asc' } }),
      prisma.environmentalGoal.aggregate({ _count: true }),
    ]);

    const monthly = {};
    monthlyTrend.forEach((t) => {
      const m = t.transactionDate.toISOString().slice(0, 7);
      if (!monthly[m]) monthly[m] = { total: 0, scope1: 0, scope2: 0, scope3: 0 };
      monthly[m].total += t.emissionAmount;
      monthly[m][`scope${t.scope}`] += t.emissionAmount;
    });
    const trend = Object.entries(monthly).map(([month, d]) => ({ month, ...d, total: Math.round(d.total * 100) / 100, scope1: Math.round(d.scope1 * 100) / 100, scope2: Math.round(d.scope2 * 100) / 100, scope3: Math.round(d.scope3 * 100) / 100 }));

    const scopeData = byScope.map(s => ({ scope: s.scope, total: Math.round((s._sum.emissionAmount || 0) * 100) / 100, count: s._count }));
    const goalsFormatted = goals.map(g => ({ ...g, progress: g.targetValue > 0 ? Math.min(Math.round((g.currentValue / g.targetValue) * 100), 100) : 0 }));

    return res.json({
      totalEmissions: Math.round((totalEmissions._sum.emissionAmount || 0) * 100) / 100,
      totalTransactions: totalEmissions._count,
      byScope: scopeData,
      monthlyTrend: trend,
      goals: goalsFormatted,
      totalGoals: goalStats._count,
    });
  } catch (error) { console.error(error); return res.status(500).json({ error: 'Internal server error' }); }
}

export async function getSocialReport(req, res) {
  try {
    const { startDate, endDate } = req.query;
    const dateFilter = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);
    const actWhere = Object.keys(dateFilter).length ? { startDate: dateFilter } : {};

    const [activities, participations, budgetAgg, byDept] = await Promise.all([
      prisma.cSRActivity.findMany({ where: actWhere, include: { category: { select: { name: true } }, department: { select: { name: true } }, _count: { select: { participations: true } } }, orderBy: { startDate: 'desc' } }),
      prisma.employeeParticipation.aggregate({ _count: true, where: { activity: actWhere } }),
      prisma.cSRActivity.aggregate({ _sum: { budget: true }, where: actWhere }),
      prisma.cSRActivity.groupBy({ by: ['departmentId'], _count: true, where: { ...actWhere, departmentId: { not: null } } }),
    ]);

    const now = new Date();
    const completed = activities.filter(a => new Date(a.endDate) < now).length;
    const active = activities.filter(a => new Date(a.startDate) <= now && new Date(a.endDate) >= now).length;

    const monthly = {};
    activities.forEach((a) => { const m = a.startDate.toISOString().slice(0, 7); monthly[m] = (monthly[m] || 0) + 1; });
    const monthlyActivity = Object.entries(monthly).map(([month, count]) => ({ month, count }));

    return res.json({
      totalActivities: activities.length,
      activeActivities: active,
      completedActivities: completed,
      totalParticipations: participations._count,
      totalBudget: budgetAgg._sum.budget || 0,
      monthlyActivity,
      departmentActivity: byDept,
      participationRate: activities.length > 0 ? Math.round((participations._count / Math.max(activities.length, 1)) * 100) / 100 : 0,
    });
  } catch (error) { console.error(error); return res.status(500).json({ error: 'Internal server error' }); }
}

export async function getGovernanceReport(req, res) {
  try {
    const [policyStats, auditStats, complianceStats, policies, audits, bySeverity] = await Promise.all([
      prisma.eSGPolicy.groupBy({ by: ['status'], _count: true }),
      prisma.audit.groupBy({ by: ['status'], _count: true }),
      prisma.complianceIssue.groupBy({ by: ['status'], _count: true }),
      prisma.eSGPolicy.findMany({ where: { status: 'active' }, include: { _count: { select: { acknowledgements: true } } } }),
      prisma.audit.findMany({ orderBy: { auditDate: 'desc' }, take: 20, include: { _count: { select: { complianceIssues: true } } } }),
      prisma.complianceIssue.groupBy({ by: ['severity'], _count: true }),
    ]);

    const totalUsers = await prisma.user.count();
    const totalAcks = await prisma.policyAcknowledgement.count();
    const activePolicies = policies.length;
    const ackRate = activePolicies > 0 && totalUsers > 0 ? Math.round((totalAcks / (activePolicies * totalUsers)) * 100) : 0;

    return res.json({
      policies: { byStatus: policyStats, activePolicies, totalAcknowledgements: totalAcks, acknowledgementRate: ackRate },
      audits: { byStatus: auditStats, recent: audits },
      compliance: { byStatus: complianceStats, bySeverity },
    });
  } catch (error) { console.error(error); return res.status(500).json({ error: 'Internal server error' }); }
}

export async function getOverallESGReport(req, res) {
  try {
    const [scores, config, deptScores, leaderboard, carbonTotal, csrCount, policyCount, auditCount, challengeCount, userCount, deptCount] = await Promise.all([
      prisma.departmentScore.findMany({ orderBy: { scoredAt: 'desc' }, take: 50, include: { department: { select: { name: true, code: true } } } }),
      prisma.eSGConfig.findFirst(),
      prisma.departmentScore.findMany({ distinct: ['departmentId'], orderBy: { scoredAt: 'desc' }, include: { department: { select: { name: true, code: true } } } }),
      prisma.user.findMany({ select: { id: true, fullName: true, department: { select: { name: true } }, challengeParticipations: { where: { approvalStatus: 'approved' }, select: { xpAwarded: true } }, employeeParticipations: { where: { approvalStatus: 'approved' }, select: { pointsEarned: true } } } }),
      prisma.carbonTransaction.aggregate({ _sum: { emissionAmount: true } }),
      prisma.cSRActivity.count(),
      prisma.eSGPolicy.count({ where: { status: 'active' } }),
      prisma.audit.count(),
      prisma.challenge.count({ where: { status: 'active' } }),
      prisma.user.count(),
      prisma.department.count({ where: { status: 'active' } }),
    ]);

    const weights = config || { environmentalWeight: 40, socialWeight: 30, governanceWeight: 30 };
    let envAvg = 0, socAvg = 0, govAvg = 0;
    if (scores.length > 0) {
      envAvg = scores.reduce((s, sc) => s + sc.environmentalScore, 0) / scores.length;
      socAvg = scores.reduce((s, sc) => s + sc.socialScore, 0) / scores.length;
      govAvg = scores.reduce((s, sc) => s + sc.governanceScore, 0) / scores.length;
    }
    const overall = (envAvg * weights.environmentalWeight + socAvg * weights.socialWeight + govAvg * weights.governanceWeight) / 100;

    const topDepts = deptScores.sort((a, b) => b.totalScore - a.totalScore).slice(0, 10).map(d => ({ name: d.department.name, code: d.department.code, score: Math.round(d.totalScore * 10) / 10 }));
    const topEmployees = leaderboard.map(u => ({ id: u.id, name: u.fullName, department: u.department?.name, score: u.challengeParticipations.reduce((s, p) => s + p.xpAwarded, 0) + u.employeeParticipations.reduce((s, p) => s + p.pointsEarned, 0) })).sort((a, b) => b.score - a.score).slice(0, 10);

    // Monthly trend
    const monthly = {};
    scores.forEach(s => { const m = s.scoredAt.toISOString().slice(0, 7); if (!monthly[m]) monthly[m] = { env: [], soc: [], gov: [] }; monthly[m].env.push(s.environmentalScore); monthly[m].soc.push(s.socialScore); monthly[m].gov.push(s.governanceScore); });
    const monthlyTrend = Object.entries(monthly).sort().map(([month, d]) => ({ month, environmental: Math.round((d.env.reduce((a, b) => a + b, 0) / d.env.length) * 10) / 10, social: Math.round((d.soc.reduce((a, b) => a + b, 0) / d.soc.length) * 10) / 10, governance: Math.round((d.gov.reduce((a, b) => a + b, 0) / d.gov.length) * 10) / 10 }));

    return res.json({
      overall: Math.round(overall * 10) / 10,
      environmental: Math.round(envAvg * 10) / 10,
      social: Math.round(socAvg * 10) / 10,
      governance: Math.round(govAvg * 10) / 10,
      weights,
      topDepartments: topDepts,
      topEmployees,
      monthlyTrend,
      summary: { carbon: Math.round((carbonTotal._sum.emissionAmount || 0) * 100) / 100, csrActivities: csrCount, policies: policyCount, audits: auditCount, challenges: challengeCount, employees: userCount, departments: deptCount },
    });
  } catch (error) { console.error(error); return res.status(500).json({ error: 'Internal server error' }); }
}

export async function globalSearch(req, res) {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) return res.json({ results: [] });

    const [departments, policies, activities, challenges, audits, issues] = await Promise.all([
      prisma.department.findMany({ where: { OR: [{ name: { contains: q, mode: 'insensitive' } }, { code: { contains: q, mode: 'insensitive' } }] }, take: 5, select: { id: true, name: true, code: true } }),
      prisma.eSGPolicy.findMany({ where: { title: { contains: q, mode: 'insensitive' } }, take: 5, select: { id: true, title: true, status: true } }),
      prisma.cSRActivity.findMany({ where: { title: { contains: q, mode: 'insensitive' } }, take: 5, select: { id: true, title: true } }),
      prisma.challenge.findMany({ where: { title: { contains: q, mode: 'insensitive' } }, take: 5, select: { id: true, title: true, status: true } }),
      prisma.audit.findMany({ where: { title: { contains: q, mode: 'insensitive' } }, take: 5, select: { id: true, title: true, status: true } }),
      prisma.complianceIssue.findMany({ where: { description: { contains: q, mode: 'insensitive' } }, take: 5, select: { id: true, description: true, severity: true } }),
    ]);

    const results = [
      ...departments.map(d => ({ type: 'department', id: d.id, title: d.name, subtitle: d.code, link: '/departments' })),
      ...policies.map(p => ({ type: 'policy', id: p.id, title: p.title, subtitle: p.status, link: '/governance' })),
      ...activities.map(a => ({ type: 'activity', id: a.id, title: a.title, subtitle: 'CSR Activity', link: '/social' })),
      ...challenges.map(c => ({ type: 'challenge', id: c.id, title: c.title, subtitle: c.status, link: '/gamification' })),
      ...audits.map(a => ({ type: 'audit', id: a.id, title: a.title, subtitle: a.status, link: '/governance' })),
      ...issues.map(i => ({ type: 'issue', id: i.id, title: i.description.slice(0, 60), subtitle: i.severity, link: '/governance' })),
    ];

    return res.json({ results });
  } catch (error) { console.error(error); return res.status(500).json({ error: 'Internal server error' }); }
}

export async function getCustomReport(req, res) {
  try {
    const { module, departmentId, startDate, endDate, status, groupBy = 'month' } = req.query;
    const dateFilter = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);

    let data = [];

    if (module === 'environmental' || !module) {
      const where = {};
      if (Object.keys(dateFilter).length) where.transactionDate = dateFilter;
      const txs = await prisma.carbonTransaction.findMany({ where, include: { emissionFactor: { select: { name: true, category: true } }, user: { select: { fullName: true, department: { select: { name: true } } } } }, orderBy: { transactionDate: 'desc' }, take: 500 });
      data.push(...txs.map(t => ({ module: 'Environmental', type: 'Carbon Transaction', date: t.transactionDate, description: t.description || t.emissionFactor.name, value: t.emissionAmount, unit: 'kg CO₂e', department: t.user?.department?.name || 'N/A', employee: t.user?.fullName })));
    }

    if (module === 'social' || !module) {
      const where = {};
      if (Object.keys(dateFilter).length) where.startDate = dateFilter;
      if (departmentId) where.departmentId = departmentId;
      const acts = await prisma.cSRActivity.findMany({ where, include: { category: { select: { name: true } }, department: { select: { name: true } }, _count: { select: { participations: true } } }, orderBy: { startDate: 'desc' }, take: 500 });
      data.push(...acts.map(a => ({ module: 'Social', type: 'CSR Activity', date: a.startDate, description: a.title, value: a._count.participations, unit: 'participants', department: a.department?.name || 'N/A', employee: '' })));
    }

    if (module === 'governance' || !module) {
      const where = {};
      if (status) where.status = status;
      const issues = await prisma.complianceIssue.findMany({ where, include: { audit: { select: { title: true } }, owner: { select: { fullName: true } } }, orderBy: { createdAt: 'desc' }, take: 500 });
      data.push(...issues.map(i => ({ module: 'Governance', type: 'Compliance Issue', date: i.createdAt, description: i.description, value: i.severity, unit: i.status, department: '', employee: i.owner?.fullName })));
    }

    if (module === 'gamification' || !module) {
      const challenges = await prisma.challenge.findMany({ where: status ? { status } : {}, include: { category: { select: { name: true } }, _count: { select: { participations: true } } }, orderBy: { createdAt: 'desc' }, take: 200 });
      data.push(...challenges.map(c => ({ module: 'Gamification', type: 'Challenge', date: c.createdAt, description: c.title, value: c.xpReward, unit: 'XP', department: c.category?.name || '', employee: '' })));
    }

    // Group by month if requested
    let grouped = null;
    if (groupBy === 'month') {
      grouped = {};
      data.forEach(d => {
        const m = new Date(d.date).toISOString().slice(0, 7);
        if (!grouped[m]) grouped[m] = { month: m, count: 0, items: [] };
        grouped[m].count++;
        grouped[m].items.push(d);
      });
      grouped = Object.values(grouped).sort((a, b) => a.month.localeCompare(b.month));
    }

    return res.json({ data, grouped, total: data.length });
  } catch (error) { console.error(error); return res.status(500).json({ error: 'Internal server error' }); }
}

export async function getReportDashboard(req, res) {
  try {
    const [esgConfig, carbonAgg, csrCount, policyCount, auditCount, challengeCount, userCount, deptCount, complianceOpen, goalStats] = await Promise.all([
      prisma.eSGConfig.findFirst(),
      prisma.carbonTransaction.aggregate({ _sum: { emissionAmount: true }, _count: true }),
      prisma.cSRActivity.count(),
      prisma.eSGPolicy.count({ where: { status: 'active' } }),
      prisma.audit.count(),
      prisma.challenge.count({ where: { status: 'active' } }),
      prisma.user.count(),
      prisma.department.count({ where: { status: 'active' } }),
      prisma.complianceIssue.count({ where: { status: 'open' } }),
      prisma.environmentalGoal.count({ where: { status: 'active' } }),
    ]);

    const scores = await prisma.departmentScore.findMany({ orderBy: { scoredAt: 'desc' }, take: 50 });
    let envAvg = 0, socAvg = 0, govAvg = 0;
    if (scores.length > 0) {
      envAvg = scores.reduce((s, sc) => s + sc.environmentalScore, 0) / scores.length;
      socAvg = scores.reduce((s, sc) => s + sc.socialScore, 0) / scores.length;
      govAvg = scores.reduce((s, sc) => s + sc.governanceScore, 0) / scores.length;
    }
    const weights = esgConfig || { environmentalWeight: 40, socialWeight: 30, governanceWeight: 30 };
    const overall = (envAvg * weights.environmentalWeight + socAvg * weights.socialWeight + govAvg * weights.governanceWeight) / 100;

    return res.json({
      overallESG: Math.round(overall * 10) / 10,
      environmental: Math.round(envAvg * 10) / 10,
      social: Math.round(socAvg * 10) / 10,
      governance: Math.round(govAvg * 10) / 10,
      carbon: Math.round((carbonAgg._sum.emissionAmount || 0) * 100) / 100,
      carbonTransactions: carbonAgg._count,
      csrActivities: csrCount,
      activePolicies: policyCount,
      audits: auditCount,
      activeChallenges: challengeCount,
      employees: userCount,
      departments: deptCount,
      openCompliance: complianceOpen,
      activeGoals: goalStats,
    });
  } catch (error) { console.error(error); return res.status(500).json({ error: 'Internal server error' }); }
}
