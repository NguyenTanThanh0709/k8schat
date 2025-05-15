import express from "express";
import http from "http";
import { Server } from "socket.io";
import { createClient } from "redis";
import { createAdapter } from "@socket.io/redis-adapter";
import {IMessage} from '../types/index'
import { SendMessage } from "@/services/broker.service";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000"],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

let redisClient: ReturnType<typeof createClient>;

export function getReceiverSocketId(userId: string) {
  return redisClient.get(`socket:${userId}`);
}

export async function initializeSocketServer() {
  const pubClient = createClient({
    url: "redis://localhost:6379",
  });
  const subClient = pubClient.duplicate();

  redisClient = createClient({ url: "redis://localhost:6379" });
  await redisClient.connect();
  await Promise.all([pubClient.connect(), subClient.connect()]);

  io.adapter(createAdapter(pubClient, subClient));
  console.log("✅ Redis adapter connected");

  io.on("connection", async (socket) => {
    const userId = socket.handshake.query.userId as string;

    if (userId) {
        const existingSocket = await redisClient.get(`socket:${userId}`);
        if (existingSocket && existingSocket !== socket.id) {
          io.to(existingSocket).disconnectSockets(); // Đảm bảo socket cũ bị ngắt
        }
      await redisClient.set(`socket:${userId}`, socket.id, { EX: 60 });
      await redisClient.sAdd("online-users", userId);
      console.log(`✅ User ${userId} connected with socket ${socket.id}`);
    }

    const usersOnline = await redisClient.sMembers("online-users");
    io.emit("getOnlineUsers", usersOnline);

    socket.on("heartbeat", async () => {
      if (userId) {
        await redisClient.expire(`socket:${userId}`, 60);
      }
    });

socket.on("disconnect", async () => {
  if (userId) {
    const currentSocket = await redisClient.get(`socket:${userId}`);
    if (currentSocket === socket.id) {
      await redisClient.del(`socket:${userId}`);
      await redisClient.sRem("online-users", userId);
      console.log(`❌ User ${userId} disconnected`);
    } else {
      console.log(`ℹ️ Socket ${socket.id} was already replaced for user ${userId}`);
    }
  }

  const usersOnline = await redisClient.sMembers("online-users");
  io.emit("getOnlineUsers", usersOnline);
});

    socket.on("sendMessage", async (message: IMessage) => {
      console.log("📩 Message received:", message);
      await SendMessage(message)
    
      // Lưu trữ vào database nếu bạn dùng DB
      // await saveMessageToDB(message);
    
      // Gửi đến receiver nếu đang online
      const receiverSocketId = await getReceiverSocketId(message.receiver);
    
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("receiveMessage", message);
    
        // Optionally cập nhật trạng thái đã gửi/delivered
        message.status = "delivered";
        console.log(`📬 Delivered to ${message.receiver} at socket ${receiverSocketId}`);
      } else {
        // Nếu offline, có thể queue lại hoặc lưu trữ trạng thái chờ
        message.status = "sent";
        console.log(`📭 ${message.receiver} is offline, message queued/stored`);
      }
    });
    
    
  });
}

export { app, server };
