import { Consumer, Producer } from "kafkajs";
import { MessageBroker } from "../broker";
import { HandleSubscriptionChat } from "./handle.service";
import { OrderEvent, IMessage, MessageType } from "../types";  // Make sure the import path is correct


export const InitializeBroker = async () => {
  
    const producer = await MessageBroker.connectProducer<Producer>();
    producer.on("producer.connect", async () => {
      console.log("Producer connected successfully");
    });

    const consumer = await MessageBroker.connectConsumer<Consumer>();
    consumer.on("consumer.connect", async () => {
      console.log("Consumer connected successfully");
});

  await MessageBroker.subscribe(HandleSubscriptionChat, "Message");

}

// publish dedicated events based on usecases
// export const SendMessage = async (data: any) => {
//     await MessageBroker.publish({
//       event: OrderEvent.SEND_MESSAGE,
//       topic: "Message",
//       headers: {},
//       message: data,
//     });
//   };
  
//   export const SendNotification = async (data: any) => {
//     await MessageBroker.publish({
//       event: OrderEvent.SEND_NOTIFICATION,
//       topic: "Notification",
//       headers: {},
//       message: data,
//     });
//   };
