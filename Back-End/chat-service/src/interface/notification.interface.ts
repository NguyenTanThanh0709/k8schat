export interface INotification {
  type: 'friend_request' | 'friend_accept' | 'friend_remove' | 'message';
  content: string;
  sender: string;
  receiver: string;
  timestamp: Date;
  status: 'unread' | 'read';
  is_group: Boolean
}


export interface CreateNotificationInput {
  type: 'friend_request' | 'friend_accept' | 'friend_remove' | 'message';
  content: string;
  sender: string;
  receiver: string;
  is_group: boolean;
}
