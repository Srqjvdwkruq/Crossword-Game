/**
 * Manages room connections and game lobby functionality
 */
class RoomManager {
    /**
     * Initialize room manager with WebSocket connection
     */
    constructor() {
        this.ws = null;
        this.isConnecting = false;
        this.connectionAttempts = 0;
        this.maxAttempts = 3;
        this.setupWebSocket();
        this.setupEventListeners();
        this.roomData = {};
        this.currentRoom = null;
    }

    /**
     * Set up WebSocket connection and event handlers
     */
    setupWebSocket() {
        if (
            this.isConnecting || 
            (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING))
        ) {
            console.log('WebSocket connection already exists or connecting');
            return;
        }
    
        this.isConnecting = true;
    
        let reconnectTimeout = null;
    
        try {
            // ปิดการเชื่อมต่อเก่าถ้ามีและไม่ใช่ CLOSED
            if (this.ws && this.ws.readyState !== WebSocket.CLOSED) {
                this.ws.close();
            }
            this.ws = null;
    
            const wsUrl = window.location.hostname === '127.0.0.1' 
                ? 'ws://127.0.0.1:8080'
                : 'ws://localhost:8080';
    
            console.log('Connecting to WebSocket server at:', wsUrl);
            this.ws = new WebSocket(wsUrl);
    
            // เมื่อเชื่อมต่อสำเร็จ
            this.ws.onopen = () => {
                console.log('Connected to server successfully');
                this.isConnecting = false;
                this.connectionAttempts = 0;
                this.updateConnectionStatus(true);
    
                // ล้าง timeout สำหรับ reconnect ถ้ามี
                if (reconnectTimeout) {
                    clearTimeout(reconnectTimeout);
                    reconnectTimeout = null;
                }
            };
    
            // เมื่อการเชื่อมต่อถูกปิด
            this.ws.onclose = (event) => {
                console.log('WebSocket closed:', {
                    code: event.code,
                    reason: event.reason,
                    wasClean: event.wasClean,
                });
                this.isConnecting = false;
                this.updateConnectionStatus(false);
                this.ws = null;
    
                // ถ้าอยู่ในห้อง ให้พยายาม reconnect
                if (this.currentRoom) {
                    console.log('Attempting to reconnect...');
                    reconnectTimeout = setTimeout(() => {
                        this.setupWebSocket();
                    }, 5000); // รอ 5 วินาทีแล้วพยายามเชื่อมต่อใหม่
                }
            };
    
            // เมื่อเกิดข้อผิดพลาด
            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                this.isConnecting = false;
                this.updateConnectionStatus(false);
    
                // พยายาม reconnect
                if (this.currentRoom) {
                    reconnectTimeout = setTimeout(() => {
                        this.setupWebSocket();
                    }, 5000);
                }
            };
    
            // เมื่อได้รับข้อความจากเซิร์ฟเวอร์
            this.ws.onmessage = (event) => {
                console.log('Received message:', event.data);
                const data = JSON.parse(event.data);
                this.handleServerMessage(data);
            };
    
            // ส่ง PING เพื่อรักษา connection
            setInterval(() => {
                if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                    this.ws.send(JSON.stringify({ type: 'PING' }));
                }
            }, 30000); // ทุก 30 วินาที
    
        } catch (error) {
            console.error('Failed to setup WebSocket:', error);
            this.isConnecting = false;
            this.updateConnectionStatus(false);
    
            // พยายาม reconnect
            if (this.currentRoom) {
                reconnectTimeout = setTimeout(() => {
                    this.setupWebSocket();
                }, 5000);
            }
        }
    }
    

    /**
     * Update connection status display in UI
     * @param {boolean} isConnected - Connection status
     */
    updateConnectionStatus(isConnected) {
        const statusDisplay = document.createElement('div');
        statusDisplay.id = 'connection-status';
        statusDisplay.style.position = 'fixed';
        statusDisplay.style.top = '10px';
        statusDisplay.style.right = '10px';
        statusDisplay.style.padding = '5px 10px';
        statusDisplay.style.borderRadius = '5px';
        statusDisplay.style.color = 'white';

        if (isConnected) {
            statusDisplay.style.backgroundColor = '#9CBB98';
            statusDisplay.textContent = '🟢 Connected';
        } else {
            statusDisplay.style.backgroundColor = '#f86060';
            statusDisplay.textContent = '🔴 Disconnected';
        }

        const existing = document.getElementById('connection-status');
        if (existing) {
            existing.replaceWith(statusDisplay);
        } else {
            document.body.appendChild(statusDisplay);
        }
    }

    /**
     * Attempt to reconnect to current room
     */
    async reconnectToRoom() {
        if (!this.currentRoom) return;

        try {
            const roomData = JSON.parse(localStorage.getItem('roomData') || '{}');
            if (!roomData.roomId) return;

            const response = await this.ws.send(JSON.stringify({
                type: 'RECONNECT',
                roomId: roomData.roomId,
                playerName: roomData.player1Name || roomData.player2Name,
                connectionId: this.ws.connectionId
            }));

            console.log('Reconnection attempt response:', response);
        } catch (error) {
            console.error('Reconnection failed:', error);
        }
    }

    /**
     * Handle disconnection events and reconnection attempts
     */
    handleDisconnect() {
        if (this.currentRoom) {
            // แสดง UI แจ้งเตือนการขาดการเชื่อมต่อ
            this.showDisconnectedAlert();

            // พยายามเชื่อมต่อใหม่
            const reconnectInterval = setInterval(() => {
                if (this.connectionAttempts >= this.maxAttempts) {
                    clearInterval(reconnectInterval);
                    this.showReconnectFailedAlert();
                    return;
                }

                if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
                    this.setupWebSocket();
                    this.connectionAttempts++;
                } else {
                    clearInterval(reconnectInterval);
                    this.reconnectToRoom();
                    this.hideDisconnectedAlert();
                }
            }, 2000);
        }
    }

    /**
     * Show disconnection alert in UI
     */
    showDisconnectedAlert() {
        const alert = document.createElement('div');
        alert.id = 'disconnected-alert';
        alert.innerHTML = `
            <div class="alert-content">
                <h3>Disconnected</h3>
                <p>Trying to reconnect... (${this.connectionAttempts}/${this.maxAttempts})</p>
            </div>
        `;
        document.body.appendChild(alert);
    }

    /**
     * Hide disconnection alert from UI
     */
    hideDisconnectedAlert() {
        const alert = document.getElementById('disconnected-alert');
        if (alert) alert.remove();
    }

    /**
     * Show reconnection failure alert
     */
    showReconnectFailedAlert() {
        alert('Connection failed. Please refresh the page to try again.');
        window.location.href = './room.html';
    }

    /**
     * Handle messages received from server
     * @param {Object} data - Message data from server
     */
    handleServerMessage(data) {
        console.log('Received server message:', data);

        switch (data.type) {
            case 'ROOM_CREATED':
                if (data.success) {
                    window.location.href = './lobby.html';
                }
                break;
            case 'PLAYER_JOINED':
                if (data.success) {
                    const currentData = JSON.parse(localStorage.getItem('roomData') || '{}');
                    const roomData = {
                        ...currentData,
                        roomId: data.playerData.roomId,
                        player1Name: data.playerData.player1,
                        player2Name: data.playerData.player2,
                        creator: data.playerData.player1,
                        status: 'ready'
                    };

                    localStorage.setItem('roomData', JSON.stringify(roomData));
                    
                    // รอให้ redirect เสร็จก่อนอัพเดท UI
                    if (!window.location.pathname.includes('lobby.html')) {
                        window.location.href = './lobby.html';
                    } else {
                        this.updateLobbyUI(roomData);
                    }
                }
                break;
            case 'JOIN_ERROR':
                // ปรับปรุงการแสดง error message
                alert(data.message || 'Cannot join room. Please try again.');
                // เคลียร์ input field หลังจากแสดง error
                const roomIdInput = document.querySelector('#joinRoomContainer input[placeholder="Room ID (4 digits)"]');
                if (roomIdInput) {
                    roomIdInput.value = '';
                    roomIdInput.focus();
                }
                break;
            case 'PLAYER_LEFT':
                this.handlePlayerLeft();
                break;
            case 'START_GAME':
                window.location.href = './multisb_cw.html';
                break;
        }
    }

    /**
     * Update lobby UI with room data
     * @param {Object} roomData - Current room information
     */
    updateLobbyUI(roomData) {
        // ตรวจสอบว่าอยู่ในหน้า lobby หรือไม่
        const isLobbyPage = window.location.pathname.includes('lobby.html');
        if (!isLobbyPage) return;

        const player1Name = document.getElementById('player1Name');
        const player2Name = document.getElementById('player2Name');
        const startGameBtn = document.getElementById('startGameBtn');

        // ตรวจสอบว่า elements มีอยู่จริงก่อนอัพเดท
        if (player1Name && player2Name) {
            player1Name.textContent = roomData.player1Name || 'Waiting...';
            player2Name.textContent = roomData.player2Name || 'Waiting...';

            if (startGameBtn && roomData.player2Name) {
                startGameBtn.disabled = false;
            }
        }
    }

    /**
     * Generate random 4-digit room ID
     * @returns {string} Room ID
     */
    generateRoomId() {
        return Math.floor(1000 + Math.random() * 9000).toString();
    }

    /**
     * Set up event listeners for room creation and joining
     */
    setupEventListeners() {
        const createForm = document.querySelector('#createRoomContainer form');
        const joinForm = document.querySelector('#joinRoomContainer form');

        if (createForm) {
            const roomIdInput = createForm.querySelector('input[placeholder="Room ID (4 digits)"]');
            if (roomIdInput) {
                roomIdInput.value = this.generateRoomId();
                roomIdInput.readOnly = true;
            }

            createForm.addEventListener('submit', (e) => this.handleCreateRoom(e));
        }

        if (joinForm) {
            joinForm.addEventListener('submit', (e) => this.handleJoinRoom(e));
        }
    }

    /**
     * Handle room creation form submission
     * @param {Event} e - Form submission event
     */
    handleCreateRoom(e) {
        e.preventDefault();
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            alert('Not connected to server. Please wait or refresh the page.');
            return;
        }

        const playerName = document.getElementById('creatorName').value;
        const roomId = e.target.querySelector('input[placeholder="Room ID (4 digits)"]').value;

        if (!playerName) {
            alert('Please enter your name');
            return;
        }

        const roomData = {
            type: 'CREATE_ROOM',
            roomId: roomId,
            playerName: playerName,
            isCreator: true
        };

        console.log('Creating room with ID:', roomId);
        this.currentRoom = roomData;
        this.ws.send(JSON.stringify(roomData));

        this.roomData = {
            roomId: roomId,
            creator: playerName,
            player1Name: playerName,
            player2Name: ''
        };
        localStorage.setItem('roomData', JSON.stringify(this.roomData));
    }

    /**
     * Handle join room form submission
     * @param {Event} e - Form submission event
     */
    handleJoinRoom(e) {
        e.preventDefault();
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            alert('Please wait for connection to server.');
            return;
        }

        const playerName = document.getElementById('joinerName').value;
        const roomIdInput = e.target.querySelector('input[placeholder="Room ID (4 digits)"]');

        if (!playerName || !roomIdInput) {
            alert('Please enter your name and Room ID');
            return;
        }

        const roomId = roomIdInput.value;

        if (!/^\d{4}$/.test(roomId)) {
            alert('Room ID Must be 4 digits');
            return;
        }

        const joinData = {
            type: 'JOIN_ROOM',
            roomId: roomId,
            playerName: playerName,
            isCreator: false
        };

        console.log('Sending join request:', joinData);
        this.currentRoom = joinData;
        this.ws.send(JSON.stringify(joinData));
    }

    /**
     * Handle player leaving the room
     */
    handlePlayerLeft() {
        alert('A player has left the room');
        const roomData = JSON.parse(localStorage.getItem('roomData') || '{}');
        roomData.player2Name = '';
        localStorage.setItem('roomData', JSON.stringify(roomData));
        this.updateLobbyUI(roomData);
    }
}

// สร้าง singleton instance
if (!window.roomManager) {
    window.roomManager = new RoomManager();
}

export default window.roomManager;