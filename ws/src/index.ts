import { WebSocketServer } from 'ws';
import { GameManager } from './GameManager';

export const wss = new WebSocketServer({ port: 8081 });

const gameManager = new GameManager();

wss.on('connection', function connection(ws) {

    console.log('Connection made');
    gameManager.addUser(ws);

    ws.on('close', () => {
        gameManager.removeUser(ws);
    });

});