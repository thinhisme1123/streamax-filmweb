import { Server, Socket } from 'socket.io';

const roomHosts = new Map<string, string>();

export const setupSocket = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log(`[Socket] User connected: ${socket.id}`);

    // ── Helper: reassign host when the current host leaves ────────────────────
    const handleLeave = (roomId: string) => {
      if (roomHosts.get(roomId) === socket.id) {
        const room = io.sockets.adapter.rooms.get(roomId);
        if (room && room.size > 0) {
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

    // ── Room Management ───────────────────────────────────────────────────────
    socket.on('joinRoom', (roomId: string) => {
      socket.join(roomId);
      console.log(`[Socket] ${socket.id} joined room ${roomId}`);

      if (!roomHosts.has(roomId)) {
        // First joiner becomes host
        roomHosts.set(roomId, socket.id);
        socket.emit('host-status', { isHost: true });
      } else {
        // Late joiner is a guest — tell them immediately
        socket.emit('host-status', { isHost: false });
      }
    });

    socket.on('leaveRoom', (roomId: string) => {
      socket.leave(roomId);
      console.log(`[Socket] ${socket.id} left room ${roomId}`);
      handleLeave(roomId);
    });

    // ── Initial Guest Sync Protocol ───────────────────────────────────────────
    // Guest emits this after receiving host-status: false.
    // Backend relays it to the host, carrying the guest's socket id so the host
    // can reply directly to that guest only.
    socket.on('guest-request-sync', (data: { roomId: string }) => {
      const hostId = roomHosts.get(data.roomId);
      if (hostId && hostId !== socket.id) {
        // Ask host to send their current state to this specific guest
        io.to(hostId).emit('guest-needs-sync', { guestId: socket.id });
      }
    });

    // Host responds with their current state; backend relays to the requesting guest only.
    socket.on('host-force-sync', (data: { roomId: string; guestId: string; time: number; isPlaying: boolean }) => {
      // Security: only the host may send this
      if (roomHosts.get(data.roomId) !== socket.id) return;

      io.to(data.guestId).emit('host-force-sync', {
        time: data.time,
        isPlaying: data.isPlaying,
      });
    });

    // ── Ongoing Host → Guest Sync Commands ───────────────────────────────────
    // Only the host is allowed to broadcast these commands.
    socket.on('sync-play', (data: { roomId: string; time: number }) => {
      if (roomHosts.get(data.roomId) !== socket.id) return;
      socket.to(data.roomId).emit('sync-play', { time: data.time });
    });

    socket.on('sync-pause', (data: { roomId: string; time: number }) => {
      if (roomHosts.get(data.roomId) !== socket.id) return;
      socket.to(data.roomId).emit('sync-pause', { time: data.time });
    });

    socket.on('sync-seek', (data: { roomId: string; time: number }) => {
      if (roomHosts.get(data.roomId) !== socket.id) return;
      socket.to(data.roomId).emit('sync-seek', { time: data.time });
    });

    // ── Live Chat ─────────────────────────────────────────────────────────────
    socket.on('sendMessage', (data: { roomId: string; message: unknown }) => {
      socket.to(data.roomId).emit('receiveMessage', data.message);
    });

    // ── Disconnect ────────────────────────────────────────────────────────────
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
