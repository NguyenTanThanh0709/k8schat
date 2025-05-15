import { MessageModel } from '../model/message.model';
import { IMessage } from '../interface/message.interface';

export class MessageService {

    static async sendMessage(messageData: IMessage): Promise<IMessage> {
        console.log(messageData);
        try {
          const message = new MessageModel({
            ...messageData,
            // timestamp: messageData.timestamp ? new Date(messageData.timestamp) : new Date(), 
            status: messageData.status || 'sent',
          });
          return await message.save();
        } catch (error) {
          throw new Error(`Send message failed: ${error}`);
        }
      }

      static async getMessages(
        sender: string, 
        receiver: string, 
        isGroup: boolean,
        limit: number = 5,  // default to 20 messages per page
        lastMessageTimestamp?: string // optional parameter to fetch messages after the given timestamp
    ): Promise<IMessage[]> {
        try {
            // Prepare the query filter
            let query: {
                $or: { sender: string; receiver: string; }[];
                is_group: boolean;
                timestamp?: { $lt: Date };
            } = {
                $or: [
                    { sender, receiver },
                    { sender: receiver, receiver: sender }  // Bi-directional messages
                ],
                is_group: isGroup,
            };

            // If the lastMessageTimestamp is provided, add it to the query
            if (lastMessageTimestamp) {
                query = { ...query, timestamp: { $lt: new Date(lastMessageTimestamp) } };
                            // Fetch the messages sorted by timestamp (descending) and limit the number of results
            const messages = await MessageModel.find(query)
            .sort({ timestamp: -1 })
            .limit(limit)
            .exec();

            // Return the fetched messages
            return messages.reverse();
            }

            // Fetch the messages sorted by timestamp (descending) and limit the number of results
            const messages = await MessageModel.find(query)
                .sort({ timestamp: -1 })
                .limit(limit)
                .exec();

            // Return the fetched messages
            return messages.reverse();
        } catch (error: any) {
            console.error("Error while retrieving messages:", error);
            throw new Error(`Get messages failed: ${error.message || error}`);
        }
    }
      
}