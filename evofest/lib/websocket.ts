import { Server } from 'socket.io';

let io: Server | null = null;

export function initializeWebSocket(server: any) {
  io = new Server(server, {
    cors: {
      origin: process.env.NEXT_PUBLIC_BASE_URL,
      methods: ["GET", "POST"]
    }
  });
  
  return io;
}

export function getIO() {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
}