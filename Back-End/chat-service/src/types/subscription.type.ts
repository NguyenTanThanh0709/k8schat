export enum OrderEvent {
    SEND_MESSAGE = "send_message",
    SEND_NOTIFICATION = "send_notification",
    TYPING = "typing",
    READ_RECEIPT = "read_receipt",
  }
  
  export type TOPIC_TYPE = "Message" | "Notification" | "Typing" | "Read";  
  
  export interface MessageType {
    headers?: Record<string, any>;
    event: OrderEvent;
    data: Record<string, any>;
  }


  export interface IMessage {
    sender: string;
    receiver: string;
    is_group: boolean;
    content_type: 'text' | 'image' | 'file' | 'video' | 'video_call_signal';
    timestamp?: Date;
    status?: 'sent' | 'delivered' | 'read';
    url_file?: string;
    name_file?: string;
    size_file?: string;
    mime_type_file?: string;
    duration_video?: string;
    text?: string;
    type_video_call?: 'offer' | 'answer' | 'ice-candidate';
    sdp?: string;
    candidate?: string;
    sdpMid?: string;
    sdpMLineIndex?: string;
  }
  