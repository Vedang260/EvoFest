// app/api/socket/route.ts
import { NextResponse } from 'next/server';
import { Server } from 'socket.io';

let io: Server;

export const runtime = 'nodejs';

const SocketHandler = async (req: Request) => {
  if (!io) {
    const response = NextResponse.next();
    io = new Server({
      addTrailingSlash: false,
    });
    
    (response as any).socket.server.io = io;
    
    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);
      
      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });
    
    return response;
  }
  
  return NextResponse.json({ success: true });
}

export { SocketHandler as GET, SocketHandler as POST };