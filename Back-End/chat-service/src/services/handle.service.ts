import { MessageType, OrderEvent } from "../types";
import { MessageService } from '../services/message.service';
import { IMessage } from '../interface/message.interface';
export const HandleSubscriptionChat = async (message: MessageType) => {
  console.log("📩 Received message from Kafka:", message);
  // TODO: handle message logic here
  if (message.event === OrderEvent.SEND_MESSAGE) {
        const receivedMessage = message.data as IMessage;
  
        console.log("📥 Tin nhắn nhận được từ Kafka:", receivedMessage);
        const savedMessage = await MessageService.sendMessage(receivedMessage);
        console.log(savedMessage);
      }
};
