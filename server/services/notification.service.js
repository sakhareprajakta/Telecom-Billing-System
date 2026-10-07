import Notification from '../models/Notification.js';

export const createNotification = async ({
  customerId,
  userId,
  type,
  title,
  message,
  channel = 'IN_APP',
  metadata = {},
}) => {
  try {
    const notification = await Notification.create({
      customerId,
      userId,
      type,
      title,
      message,
      channel,
      metadata,
    });
    return notification;
  } catch (error) {
    console.error('[NotificationService] Failed to record notification:', error.message);
    return null;
  }
};

export const getCustomerNotifications = async (customerId) => {
  return await Notification.find({ customerId })
    .sort({ createdAt: -1 })
    .limit(30);
};

export const markAsRead = async (notificationId) => {
  return await Notification.findByIdAndUpdate(
    notificationId,
    { read: true },
    { new: true }
  );
};
