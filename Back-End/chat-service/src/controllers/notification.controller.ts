import { Request, Response } from 'express';
import { NotificationService } from '../services/notification.service';

export class NotificationController {
    // Tạo thông báo mới
    static async createNotification(req: Request, res: Response): Promise<void> {
      try {
        const data = req.body;
        const notification = await NotificationService.createNotification(data);
        res.status(201).json(notification);
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
    }
  
    // Cập nhật trạng thái thông báo (read/unread)
    static async updateStatus(req: Request, res: Response): Promise<void> {
      try {
        const { id } = req.params;
        const { status } = req.body;
  
        if (!['read', 'unread'].includes(status)) {
          res.status(400).json({ message: 'Invalid status value' });
          return;
        }
  
        const updated = await NotificationService.updateStatusById(id, status);
        if (!updated) {
          res.status(404).json({ message: 'Notification not found' });
          return;
        }
  
        res.status(200).json(updated);
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
    }
  
    // Lấy danh sách thông báo theo receiverId (kèm phân trang)
    static async getByReceiver(req: Request, res: Response): Promise<void> {
      try {
        const receiverId = req.params.receiverId;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 5;
  
        const notifications = await NotificationService.getNotificationsByReceiver(receiverId, page, limit);
        res.status(200).json(notifications);
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
    }
  }