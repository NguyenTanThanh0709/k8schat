import { NotificationModel } from '../model/notification.model';
import { INotification, CreateNotificationInput } from '../interface/notification.interface';
import { Types } from 'mongoose';
export class NotificationService {
 // Gửi (tạo) một thông báo
    static async createNotification(data: CreateNotificationInput): Promise<INotification> {
        try {
        const notification = new NotificationModel(data);
        return await notification.save();
        } catch (error) {
        console.error("Create notification failed:", error);
        throw new Error(`Create notification failed: ${error}`);
        }
    }

    // Cập nhật status theo _id (Mongo ObjectId)
    static async updateStatusById(id: string, status: 'read' | 'unread'): Promise<INotification | null> {
        try {
        // Convert id string to Mongo ObjectId
        const objectId = new Types.ObjectId(id);

        // Cập nhật status theo ObjectId
        const updatedNotification = await NotificationModel.findByIdAndUpdate(
            objectId,
            { status },
            { new: true } // Trả về document đã được cập nhật
        );

        return updatedNotification;
        } catch (error) {
        console.error(`Update notification status failed:`, error);
        throw new Error(`Update notification status failed: ${error}`);
        }
    }

    // 📥 Lấy danh sách thông báo theo receiverId (mới nhất trước), có phân trang
  static async getNotificationsByReceiver(
    receiverId: string,
    page: number = 1,
    limit: number = 5
  ): Promise<INotification[]> {
    try {
      const skip = (page - 1) * limit;

      const notifications = await NotificationModel.find({ receiver: receiverId })
        .sort({ timestamp: -1 }) // Mới nhất trước
        .skip(skip)
        .limit(limit)
        .exec();

      return notifications;
    } catch (error) {
      console.error("Get notifications failed:", error);
      throw new Error(`Get notifications failed: ${error}`);
    }
  }
      
}