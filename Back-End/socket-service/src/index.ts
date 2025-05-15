import express from 'express';
import dotenv from 'dotenv';
import cookieParser from "cookie-parser";
import cors from "cors";
import { InitializeBroker } from "./services/broker.service";
import { app, server } from "./socket/socket";
import { initializeSocketServer } from "./socket/socket";

dotenv.config();

async function bootstrap() {
  app.use(express.json());
  app.use(cookieParser());

  await InitializeBroker();             // Kafka / broker logic
  await initializeSocketServer();       // Redis + Socket.IO

  app.use(
    cors({
      origin: "http://localhost:3000",
      credentials: true,
    })
  );

  const PORT = 8182;
  server.listen(PORT, () => {
    console.log(`🚀 Socket service listening on port ${PORT}`);
  });
}

bootstrap().catch(console.error);
