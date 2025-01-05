const WebSocket = require('ws');
const express = require('express');
const http = require('http');

const app = express();
const server = http.createServer(app);

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://127.0.0.1:5500');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

const wss = new WebSocket.Server({ 
    server,

    verifyClient: (info) => {
        const origin = info.origin || info.req.headers.origin;
        return origin === 'http://127.0.0.1:5500';
    }
});

// Store rooms permanently
const rooms = new Map();
const activeConnections = new Set();
const roomsBackup = new Map();

// Debug function to log current room status
function debugRooms() {
    console.log('\nCurrent Rooms:');
    rooms.forEach((room, id) => {
        console.log(`Room ${id}:`, {
            players: room.players.map(p => p.name),
            connections: room.players.map(p => p.ws.readyState),
            backup: roomsBackup.has(id)
        });
    });
    console.log('Active Connections:', activeConnections.size);
    console.log('Backup Rooms:', Array.from(roomsBackup.keys()));
    console.log('\n');
}

// Initialize connection counter
let connectionCounter = 0;

wss.on('connection', (ws) => {
    // Assign connection ID to new connection
    ws.connectionId = `conn_${++connectionCounter}`;
    console.log(`New client connected with ID: ${ws.connectionId}`);
    

    for (const connection of activeConnections) {
        if (connection !== ws && connection.roomId) {

            connection.close();
            activeConnections.delete(connection);
        }
    }
    
    activeConnections.add(ws);

    // Send existing rooms to new client
    ws.send(JSON.stringify({
        type: 'ROOMS_STATUS',
        rooms: Array.from(rooms.keys())
    }));

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            console.log('Received message:', data);
            
            switch(data.type) {
                case 'CREATE_ROOM':
                    handleCreateRoom(ws, data);
                    break;
                case 'JOIN_ROOM':
                    handleJoinRoom(ws, data);
                    break;
                case 'GAME_ACTION':
                    handleGameAction(ws, data);
                    break;
                case 'START_GAME':
                    const room = rooms.get(data.roomId);
                    if (room) {
                        // Notify all players in the room to start the game
                        room.players.forEach(player => {
                            if (player.ws !== ws) {  // Send only to players who didn't press start
                                player.ws.send(JSON.stringify({
                                    type: 'START_GAME'
                                }));
                            }
                        });
                    }
                    break;
            }
            // Replace backupRooms() with backupRoom()
            if (ws.roomId) {
                backupRoom(ws.roomId);
            }
            debugRooms();
        } catch (error) {
            console.error('Error processing message:', error);
        }
    });

    ws.on('close', () => {
        activeConnections.delete(ws);
        handleDisconnect(ws);
        debugRooms();
    });
});

/**
 * Handle room creation request
 * @param {WebSocket} ws - WebSocket connection
 * @param {Object} data - Room creation data
 */
function handleCreateRoom(ws, data) {
    const roomId = data.roomId;
    console.log('Creating room:', roomId);

    // Check both current rooms and backup rooms
    if (rooms.has(roomId) || roomsBackup.has(roomId)) {
        ws.send(JSON.stringify({
            type: 'CREATE_ERROR',
            message: 'Room ID already in use. Please try another ID.'
        }));
        return;
    }

    // Remove old room of the player (if any)
    for (const [existingRoomId, room] of rooms.entries()) {
        if (room.players.some(player => player.name === data.playerName)) {
            rooms.delete(existingRoomId);
            roomsBackup.delete(existingRoomId);
            console.log(`Deleted old room ${existingRoomId} for player ${data.playerName}`);
        }
    }

    const room = {
        players: [{ 
            ws, 
            name: data.playerName, 
            isCreator: true,
            connectionId: ws.connectionId 
        }],
        gameState: {},
        created: Date.now()
    };
    rooms.set(roomId, room);
    ws.roomId = roomId;

    // Backup room after creation
    backupRoom(roomId);

    ws.send(JSON.stringify({
        type: 'ROOM_CREATED',
        roomId,
        success: true,
        players: [data.playerName]
    }));

    console.log(`Room ${roomId} created by ${data.playerName}`);
}

/**
 * Handle player join room request
 * @param {WebSocket} ws - WebSocket connection
 * @param {Object} data - Join room data
 */
function handleJoinRoom(ws, data) {
    const roomId = data.roomId;
    const room = rooms.get(roomId);

    // Add log for debugging
    console.log(`Join attempt for room ${roomId}:`, {
        roomExists: !!room,
        currentPlayers: room ? room.players.map(p => p.name) : [],
        playerCount: room ? room.players.length : 0
    });

    if (!room) {
        ws.send(JSON.stringify({
            type: 'JOIN_ERROR',
            message: 'Room not found. Please check the room ID and try again.'
        }));
        return;
    }

    // Cancel cleanup timeout if exists
    if (room.cleanupTimeout) {
        clearTimeout(room.cleanupTimeout);
        room.cleanupTimeout = null;
        console.log(`Cancelled cleanup timeout for room ${roomId}`);
    }

    // Check existing player connections
    room.players = room.players.filter(player => 
        player.ws.readyState === WebSocket.OPEN
    );

    // Update player count after filtering
    console.log(`Room ${roomId} active players:`, room.players.length);

    if (room.players.length >= 2) {
        ws.send(JSON.stringify({
            type: 'JOIN_ERROR',
            message: 'Room full. Please try another room.'
        }));
        return;
    }

    // Add new player
    const newPlayer = { 
        ws, 
        name: data.playerName, 
        isCreator: false,
        connectionId: ws.connectionId 
    };
    room.players.push(newPlayer);
    ws.roomId = roomId;

    // Log update
    console.log(`Room ${roomId} updated:`, {
        playerCount: room.players.length,
        players: room.players.map(p => p.name)
    });

    const playerData = {
        player1: room.players[0].name,
        player2: room.players[1].name,
        roomId: roomId
    };

    // Notify Player 1
    room.players[0].ws.send(JSON.stringify({
        type: 'PLAYER_JOINED',
        success: true,
        isCreator: true,
        playerData: playerData
    }));


    ws.send(JSON.stringify({
        type: 'PLAYER_JOINED',
        success: true,
        isCreator: false,
        playerData: playerData
    }));

    console.log(`Player ${data.playerName} Joined room ${roomId}`);
}

/**
 * Handle game actions between players
 * @param {WebSocket} ws - WebSocket connection
 * @param {Object} data - Game action data
 */
function handleGameAction(ws, data) {
    const room = rooms.get(ws.roomId);
    if (room) {
        // Broadcast game action to other player
        room.players.forEach(player => {
            if (player.ws !== ws) {
                player.ws.send(JSON.stringify({
                    type: 'GAME_ACTION',
                    action: data.action
                }));
            }
        });
    }
}

/**
 * Handle player disconnection
 * @param {WebSocket} ws - WebSocket connection of disconnected player
 */
function handleDisconnect(ws) {
    if (ws.roomId) {
        const room = rooms.get(ws.roomId);
        if (room) {
            const disconnectedPlayer = room.players.find(p => p.ws === ws);
            const isCreator = disconnectedPlayer?.isCreator;

            // Backup room before removing player
            backupRoom(ws.roomId);

            // Filter players who are still connected
            room.players = room.players.filter(player => 
                player.ws !== ws && player.ws.readyState === WebSocket.OPEN
            );

            if (room.players.length === 0) {
                if (isCreator) {
                    console.log(`Creator disconnected from room ${ws.roomId}, keeping backup`);
                    // Do not delete room immediately, set timeout
                    room.cleanupTimeout = setTimeout(() => {
                        if (rooms.has(ws.roomId) && rooms.get(ws.roomId).players.length === 0) {
                            rooms.delete(ws.roomId);
                            roomsBackup.delete(ws.roomId);
                            console.log(`Room ${ws.roomId} and backup cleaned up after timeout`);
                        }
                    }, 120000); // 2 minutes
                }
            } else {
                // Notify remaining players
                room.players.forEach(player => {
                    player.ws.send(JSON.stringify({
                        type: 'PLAYER_DISCONNECTED',
                        playerName: disconnectedPlayer.name,
                        message: 'Player disconnected'
                    }));
                });
            }
        }
    }
    activeConnections.delete(ws);
}

/**
 * Log current room status for monitoring
 */
function logRoomStatus() {
    console.log('\nCurrent Rooms Status:');
    rooms.forEach((room, roomId) => {
        console.log(`Room ${roomId}:`, {
            playerCount: room.players.length,
            players: room.players.map(p => p.name)
        });
    });
    console.log('\n');
}

// Call logRoomStatus every time there is a change
setInterval(logRoomStatus, 5000);

// Clean up inactive rooms
setInterval(() => {
    const now = Date.now();
    for (const [roomId, room] of rooms.entries()) {
        // Delete rooms with no players or created more than 1 hour ago
        if (room.players.length === 0 || now - room.created > 3600000) {
            rooms.delete(roomId);
            roomsBackup.delete(roomId); // Delete backup too
            console.log(`Cleaned up room ${roomId}`);
        }
    }
    debugRooms();
}, 60000); // Check every 1 minute

/**
 * Backup room data to persistent storage
 * @param {string} roomId - ID of room to backup
 */
function backupRoom(roomId) {
    const room = rooms.get(roomId);
    if (room && room.players.length > 0) {
        roomsBackup.set(roomId, {
            players: room.players.map(p => ({
                name: p.name,
                isCreator: p.isCreator,
                connectionId: p.connectionId
            })),
            gameState: room.gameState || {},
            created: room.created,
            lastBackup: Date.now(),
            lastActive: Date.now()
        });
        console.log(`Room ${roomId} backed up with ${room.players.length} players`);
    }
}

/**
 * Restore room from backup
 * @param {string} roomId - ID of room to restore
 * @param {WebSocket} ws - WebSocket connection
 * @param {string} playerName - Name of player to restore
 */
function restoreRoom(roomId, ws, playerName) {
    const backup = roomsBackup.get(roomId);
    if (!backup) return false;

    const player = backup.players.find(p => p.name === playerName);
    if (!player) return false;

    // Create new room from backup if not exists
    if (!rooms.has(roomId)) {
        rooms.set(roomId, {
            players: [],
            gameState: backup.gameState,
            created: backup.created
        });
    }

    const room = rooms.get(roomId);
    
    // Update player information
    const existingPlayer = room.players.find(p => p.name === playerName);
    if (existingPlayer) {
        existingPlayer.ws = ws;
        existingPlayer.connectionId = ws.connectionId;
    } else {
        room.players.push({
            ws,
            name: playerName,
            isCreator: player.isCreator,
            connectionId: ws.connectionId
        });
    }

    backup.lastActive = Date.now();
    return true;
}

/**
 * Clean up inactive rooms and backups
 */
function cleanupRooms() {
    const now = Date.now();
    const INACTIVE_TIMEOUT = 3600000; // 1 hour

    // Clean up rooms
    rooms.forEach((room, roomId) => {
        const hasActiveConnections = room.players.some(player => 
            player.ws.readyState === WebSocket.OPEN
        );
        
        if (!hasActiveConnections && now - room.created > INACTIVE_TIMEOUT) {
            console.log(`Cleaning up inactive room ${roomId}`);
            rooms.delete(roomId);
        }
    });

    // Clean up backups
    roomsBackup.forEach((backup, roomId) => {
        if (now - backup.lastActive > INACTIVE_TIMEOUT) {
            console.log(`Cleaning up inactive backup for room ${roomId}`);
            roomsBackup.delete(roomId);
        }
    });
}

// Adjust interval for cleanup
setInterval(cleanupRooms, 60000);

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`WebSocket Server running on ws://127.0.0.1:${PORT}`);
    console.log(`HTTP Server running on http://127.0.0.1:${PORT}`);
});