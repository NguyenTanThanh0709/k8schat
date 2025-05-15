// socket.ts
import { io, Socket } from "socket.io-client";


// Khởi tạo socket client
let socket: Socket;

export const connectSocket = (userId: string | "") => {
  socket = io("http://localhost:8182", {
    query: { userId },
    transports: ["websocket"],
  });

  socket.on("connect", () => {
    console.log("Connected to server");
  });

  // Xử lý khi nhận danh sách người dùng online
  socket.on("getOnlineUsers", (onlineUsers: string[]) => {
    console.log("🟢 Users online:", onlineUsers);
    // Cập nhật trạng thái online cho tất cả người dùng (state/UI)
  });

  // // Gửi heartbeat định kỳ mỗi 30 giây để duy trì trạng thái online
  // setInterval(() => {
  //   socket.emit("heartbeat", userId);
  // }, 30000);
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
  }
};

export const getSocket = () => socket;