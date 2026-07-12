import prisma from '../prisma/client.js';

export async function getNotifications(req, res) {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    const unreadCount = await prisma.notification.count({ where: { userId: req.user.id, isRead: false } });
    return res.json({ notifications, unreadCount });
  } catch (error) { console.error(error); return res.status(500).json({ error: 'Internal server error' }); }
}

export async function markAsRead(req, res) {
  try {
    const { id } = req.params;
    await prisma.notification.update({ where: { id }, data: { isRead: true } });
    return res.json({ message: 'Marked as read' });
  } catch (error) { console.error(error); return res.status(500).json({ error: 'Internal server error' }); }
}

export async function markAllAsRead(req, res) {
  try {
    await prisma.notification.updateMany({ where: { userId: req.user.id, isRead: false }, data: { isRead: true } });
    return res.json({ message: 'All notifications marked as read' });
  } catch (error) { console.error(error); return res.status(500).json({ error: 'Internal server error' }); }
}
