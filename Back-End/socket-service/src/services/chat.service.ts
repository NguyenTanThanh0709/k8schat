import { MessageType } from "../types";

export const HandleSubscription = async (message: MessageType) => {
  console.log("📩 Received message from Kafka:", message);
  // TODO: handle message logic here
};