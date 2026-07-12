import prisma from '../prisma/client.js';

/**
 * Check if a notification type is enabled via app_settings.
 */
async function isNotificationEnabled(type) {
  const keyMap = {
    'badge_unlock': 'notification.badge',
    'challenge_approval': 'notification.challenge',
    'csr_approval': 'notification.csr',
    'compliance_issue': 'notification.compliance',
    'policy_reminder': 'notification.policyReminder',
    'audit': 'notification.audit',
  };
  const key = keyMap[type];
  if (!key) return true; // Default to enabled if no matching setting

  const setting = await prisma.appSettings.findUnique({ where: { key } });
  // If no setting exists, default to enabled
  if (!setting) return true;
  return setting.value === 'true';
}

/**
 * Create a notification for a user (if the notification type is enabled).
 */
export async function createNotification(userId, type, message) {
  try {
    const enabled = await isNotificationEnabled(type);
    if (!enabled) return null;

    const notification = await prisma.notification.create({
      data: { userId, type, message },
    });
    return notification;
  } catch (error) {
    console.error('Create notification error:', error);
    return null;
  }
}

/**
 * Create notifications for multiple users (batch).
 */
export async function createBulkNotifications(userIds, type, message) {
  try {
    const enabled = await isNotificationEnabled(type);
    if (!enabled) return;

    const data = userIds.map(userId => ({ userId, type, message }));
    await prisma.notification.createMany({ data });
  } catch (error) {
    console.error('Bulk notification error:', error);
  }
}
