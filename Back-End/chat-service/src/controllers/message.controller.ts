import { Request, Response } from 'express';
import { MessageService } from '../services/message.service';

export class MessageController {
    /**
     * Gửi tin nhắn
     */
    static async sendMessage(req: Request, res: Response): Promise<void> {
      try {
        const messageData = req.body;
        const savedMessage = await MessageService.sendMessage(messageData);
        res.status(201).json(savedMessage);
      } catch (error: any) {
        res.status(500).json({
          message: 'Failed to send message',
          error: error.message || error,
        });
      }
    }

    static async getMessages(req: Request, res: Response): Promise<void> {
        const { sender, receiver, is_group } = req.query;
        const limit = parseInt(req.query.limit as string) || 5;  // Default to 20 messages
        const lastMessageTimestamp = req.query.lastMessageTimestamp as string;

        if (!sender || !receiver) {
            res.status(400).json({ message: 'Sender and receiver are required' });
            return;
        }

        try {
            const messages = await MessageService.getMessages(
                sender as string,
                receiver as string,
                is_group === 'true', // Convert to boolean
                limit,
                lastMessageTimestamp
            );
            
            res.status(200).json(messages);
        } catch (error: any) {
            console.error("Error in getMessages controller:", error);
            res.status(500).json({
                success: false,
                message: `Error retrieving messages: ${error.message || error}`,
            });
        }
    }

  }