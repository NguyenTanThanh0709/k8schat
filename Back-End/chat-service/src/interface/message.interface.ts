export interface IMessage {
    sender: string;
    receiver: string;
    is_group: boolean;
    content_type: 'text' | 'image' | 'file' | 'video' | 'video_call_signal';
    timestamp: Date;
    status: 'sent' | 'delivered' | 'read';
    url_file?: string;
    name_file?: string;
    size_file?: number;
    mime_type_file?: string;
    duration_video?: number;
    text?: string;
    type_video_call?: 'offer' | 'answer' | 'ice-candidate';
    sdp?: string;
    candidate?: string;
    sdpMid?: string;
    sdpMLineIndex?: number;
  }
  