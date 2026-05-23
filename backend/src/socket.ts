import { Server, Socket } from 'socket.io';

const roomHosts = new Map<string, string>();

export const setupSocket = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log(`[Socket] User connected: ${socket.id}`);

    const handleLeave = (roomId: string) => {
      if (roomHosts.get(roomId) === socket.id) {
        const room = io.sockets.adapter.rooms.get(roomId);
        if (room && room.size > 0) {
          // Exclude the leaving socket just in case it's still in the set
          const clients = Array.from(room).filter(id => id !== socket.id);
          if (clients.length > 0) {
            const nextHostId = clients[0];
            roomHosts.set(roomId, nextHostId);
            io.to(nextHostId).emit('host-status', { isHost: true });
          } else {
            roomHosts.delete(roomId);
          }
        } else {
          roomHosts.delete(roomId);
        }
      }
    };

    // Room Management
    socket.on('joinRoom', (roomId: string) => {
      socket.join(roomId);
      console.log(`[Socket] ${socket.id} joined room ${roomId}`);

      if (!roomHosts.has(roomId)) {
        roomHosts.set(roomId, socket.id);
        socket.emit('host-status', { isHost: true });
      } else {
        socket.emit('host-status', { isHost: false });
        const hostId = roomHosts.get(roomId);
        if (hostId) {
          io.to(hostId).emit('request-video-state', { targetGuestId: socket.id });
        }
      }
    });

    socket.on('leaveRoom', (roomId: string) => {
      socket.leave(roomId);
      console.log(`[Socket] ${socket.id} left room ${roomId}`);
      handleLeave(roomId);
    });

    // Video Syncing Events
    socket.on('track-video-state', (data: { roomId: string, action: string, time: number, targetGuestId?: string }) => {
      if (roomHosts.get(data.roomId) !== socket.id) return; // Only host can emit state

      if (data.targetGuestId) {
        io.to(data.targetGuestId).emit('sync-video-state', { action: data.action, time: data.time });
      } else {
        socket.to(data.roomId).emit('sync-video-state', { action: data.action, time: data.time });
      }
    });

    // Live Chat Events
    socket.on('sendMessage', (data: { roomId: string, message: any }) => {
      socket.to(data.roomId).emit('receiveMessage', data.message);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] User disconnected: ${socket.id}`);
      for (const [roomId, hostId] of roomHosts.entries()) {
        if (hostId === socket.id) {
          handleLeave(roomId);
        }
      }
    });
  });
};
