import { Schema, model, Document } from 'mongoose';
import { INotification } from '../interface/notification.interface';

const notificationSchema = new Schema<INotification & Document>({
  type: {
    type: String,
    required: true,
    enum: ['friend_request', 'friend_accept', 'friend_remove', 'message'],
  },
  content: { type: String, required: true },
  sender: { type: String, required: true },
  receiver: { type: String, required: true },
  timestamp: { type: Date, required: true, default: Date.now  },
  status: {
    type: String,
    required: true,
    enum: ['unread', 'read'],
    default: 'unread',
  },
  is_group: { type: Boolean, required: true }
});

export const NotificationModel = model<INotification & Document>('Notification', notificationSchema);
