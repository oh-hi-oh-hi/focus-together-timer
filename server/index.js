const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());

// Serve static files from the React client build
app.use(express.static(path.join(__dirname, '../client/dist')));

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

// Store room states
// rooms[roomId] = { hostId, status: 'waiting'|'running', duration: number, endTime: number }
const rooms = {};

const generateRoomId = () => Math.random().toString(36).substring(2, 8).toUpperCase();

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Host creates a room
    socket.on('createRoom', ({ duration }, callback) => {
        const roomId = generateRoomId();
        rooms[roomId] = {
            hostId: socket.id,
            status: 'waiting',  // waiting, running, paused
            duration: duration || 25 * 60, // default 25 minutes
            remaining: duration || 25 * 60,
            endTime: null,
        };
        socket.join(roomId);
        callback({ roomId, roomState: rooms[roomId] });
        console.log(`Room created: ${roomId} by ${socket.id}`);
    });

    // Guest joins a room
    socket.on('joinRoom', ({ roomId }, callback) => {
        const room = rooms[roomId];
        if (!room) {
            return callback({ error: '방을 찾을 수 없습니다.' });
        }

        socket.join(roomId);
        callback({ success: true, roomState: room });

        // Notify host that someone joined (optional)
        io.to(room.hostId).emit('participantJoined', { participantId: socket.id });
    });

    // Host updates the timer setup (before starting)
    socket.on('updateTimer', ({ roomId, duration }) => {
        const room = rooms[roomId];
        if (room && room.hostId === socket.id && room.status === 'waiting') {
            room.duration = duration;
            room.remaining = duration;
            // Broadcast to guests so they see real-time changes
            socket.to(roomId).emit('timerUpdated', { duration });
        }
    });

    // Host starts the timer
    socket.on('startTimer', ({ roomId }) => {
        const room = rooms[roomId];
        if (room && room.hostId === socket.id && room.status === 'waiting') {
            room.status = 'running';
            room.endTime = Date.now() + room.duration * 1000;
            io.to(roomId).emit('timerStarted', { endTime: room.endTime, duration: room.duration });
            console.log(`Room ${roomId} timer started. Ends at ${new Date(room.endTime)}`);
        }
    });

    // Host pauses the timer
    socket.on('pauseTimer', ({ roomId, remaining }) => {
        const room = rooms[roomId];
        if (room && room.hostId === socket.id && room.status === 'running') {
            room.status = 'paused';
            room.remaining = remaining;
            room.endTime = null;
            io.to(roomId).emit('timerPaused', { remaining });
            console.log(`Room ${roomId} timer paused. Remaining: ${remaining}s`);
        }
    });

    // Host resumes the timer
    socket.on('resumeTimer', ({ roomId }) => {
        const room = rooms[roomId];
        if (room && room.hostId === socket.id && room.status === 'paused') {
            room.status = 'running';
            room.endTime = Date.now() + room.remaining * 1000;
            io.to(roomId).emit('timerResumed', { endTime: room.endTime, remaining: room.remaining });
            console.log(`Room ${roomId} timer resumed. Ends at ${new Date(room.endTime)}`);
        }
    });

    // Host resets the timer after finishing
    socket.on('resetTimer', ({ roomId }) => {
        const room = rooms[roomId];
        if (room && room.hostId === socket.id) {
            room.status = 'waiting';
            room.remaining = room.duration;
            room.endTime = null;
            io.to(roomId).emit('timerReset');
            console.log(`Room ${roomId} timer reset.`);
        }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        // Find rooms where this user was host
        for (const [roomId, room] of Object.entries(rooms)) {
            if (room.hostId === socket.id) {
                // Host disconnected
                socket.to(roomId).emit('roomEnded', { message: '호스트가 방을 종료했습니다.' });
                delete rooms[roomId];
            }
        }
    });
});

app.get('/api/timer', (req, res) => {
    const activeRoom = Object.values(rooms).find(r => r.status === 'running');
    if (activeRoom) {
        const now = Date.now();
        const diff = Math.max(0, Math.floor((activeRoom.endTime - now) / 1000));
        const mins = Math.floor(diff / 60).toString().padStart(2, '0');
        const secs = (diff % 60).toString().padStart(2, '0');
        return res.send(`⏳ ${mins}:${secs}`);
    }

    const waitingRoom = Object.values(rooms).find(r => r.status === 'waiting');
    if (waitingRoom) {
        return res.send(`⏳ 대기중`);
    }

    res.send(`💡 집중 시작!`);
});

// All other GET requests not handled before will return our React app
app.use((req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
