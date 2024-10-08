import WebSocket from 'ws';
import { v4 as uuidv4 } from 'uuid';

interface Game {
    roomid: string;
    players: string[];
    message: Record<string, string>[];
}

export class GameManager {
    private games: Game[];
    private users: { ws: WebSocket, userId: string }[]; // Track WebSocket with userId

    constructor() {
        this.games = [];
        this.users = [];
    }

    addUser(ws: WebSocket) {
        const userId = uuidv4();
        this.users.push({ ws, userId });

        console.log(`User added with ID: ${userId}`);
        this.notifyUser(userId, { status: "ID", userId });
        if (this.games) {
            this.broadcastToAll({ status: "Rooms", rooms: this.games })

        }
        this.handleMessages(userId, ws);
    }

    removeUser(ws: WebSocket) {
        this.users = this.users.filter(user => user.ws !== ws);
        console.log(`User disconnected and removed`);
    }

    handleMessages(userId: string, ws: WebSocket) {
        ws.on('message', (message: string) => {
            const parsedMessage = JSON.parse(message);
            const { action, roomid } = parsedMessage;

            switch (action) {
                case 'createRoom':
                    this.createRoom(userId);
                    break;
                case 'sendMessage':
                    this.sendMessage(userId, roomid, parsedMessage.message);
                    break;
                case 'joinRoom':
                    this.joinRoom(userId, roomid);
                    break;
                case 'exitRoom':
                    this.exitRoom(userId, roomid);
                    break;
                default:
                    console.log('Unknown action:', action);
                    break;
            }
        });
    }

    createRoom(userId: string) {
        const roomid = uuidv4();
        const newGame: Game = {
            roomid,
            players: [userId],
            message: []
        };
        this.games.push(newGame);
        this.broadcastToAll({ status: "Rooms", rooms: this.games })
        console.log(`Room created with ID: ${roomid} by User ID: ${userId}`);

        this.notifyUser(userId, { status: 'roomCreated', roomid });
    }

    sendMessage(userId: string, roomid: string, message: string) {
        const user = this.users.find(u => u.userId === userId);
        const game = this.games.find(g => g.roomid === roomid);

        if (game) {
            if (user && user.ws.readyState === WebSocket.OPEN) {
                game.message.push({ userId, message });
                this.broadcastToRoom(roomid, { status: 'messageSent', userId, message });
                console.log(`User ID: ${userId} sent message to room ID: ${roomid}`);
            } else {
                console.log(`WebSocket for User ID ${userId} not found or not open`);
            }
        } else {
            this.notifyUser(userId, { status: 'roomNotFound', roomid });
        }

    }


    joinRoom(userId: string, roomid: string) {
        const game = this.games.find((g: Game) => g.roomid === roomid);

        if (game) {
            if (!game.players.includes(userId)) {
                game.players.push(userId);
                console.log(`User ID: ${userId} joined room ID: ${roomid}`);
                this.broadcastToRoom(roomid, { status: 'roomJoined', message: game.message, roomid, userId });
            } else {
                this.notifyUser(userId, { status: 'alreadyInRoom', roomid });
            }
        } else {
            this.notifyUser(userId, { status: 'roomNotFound', roomid });
        }
    }

    exitRoom(userId: string, roomid: string) {
        const game = this.games.find(g => g.roomid === roomid);

        if (game) {
            game.players = game.players.filter(player => player !== userId);
            console.log(`User ID: ${userId} exited room ID: ${roomid}`);

            this.notifyUser(userId, { status: 'roomExited', userId, roomid });
            this.broadcastToRoom(roomid, { status: 'roomExited', userId, roomid });

            if (game.players.length === 0) {
                this.games = this.games.filter(g => g.roomid !== roomid);
                console.log(`Room ID: ${roomid} removed as it has no players`);
            }
        } else {
            this.notifyUser(userId, { status: 'roomNotFound', roomid });
        }
    }

    notifyUser(userId: string, message: object) {
        const user = this.users.find(u => u.userId === userId);

        if (user && user.ws.readyState === WebSocket.OPEN) {
            user.ws.send(JSON.stringify(message));
        } else {
            console.log(`WebSocket for User ID ${userId} not found or not open`);
        }
    }

    broadcastToRoom(roomid: string, message: object) {
        const game = this.games.find(g => g.roomid === roomid);

        if (game) {
            game.players.forEach(playerId => {
                this.notifyUser(playerId, message);
            });
        }
    }
    broadcastToAll(message: object) {
        if (this.users) {

            this.users.forEach(playerId => this.notifyUser(playerId.userId, message));
        }

    }
}
