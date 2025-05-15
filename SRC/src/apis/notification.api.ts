import { Notification, CreateNotificationInput, GetNotificationsQuery } from 'src/types/utils.type'
import http1 from 'src/utils/http1'

const notificationApi = {
    getNotifications(phone: string, query: GetNotificationsQuery) {
        return http1.get<Notification[]>(`/api/chat/notification/get-notifications/${phone}`, { params: query })
    },

    createNotification(body: CreateNotificationInput) {
        return http1.post<Notification>('/api/chat/notification/send', body)
    },

    updateNotification(id: string, body: Notification) {
        return http1.patch<Notification>(`/api/chat/notification/send/${id}`, body)
    }
}

export default notificationApi