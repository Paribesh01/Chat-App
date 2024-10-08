import { useEffect, useState } from 'react';

export const useSocket = (url = 'ws://localhost:8081') => {


    interface Message {
        userId: string,
        message: string
    }
    interface Game {
        roomid: string;
        players: string[];
        message: Record<string, string>[];
    }
    interface ServerMessage {
        status: 'roomCreated' | 'roomJoined' | 'messageSent' | 'roomExited' | 'Rooms' | "ID";
        roomid?: string;
        userId?: string;
        message?: Message[];
        rooms: Game[]


    }


    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [roomid, setRoomId] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [rooms, setRooms] = useState<Game[]>([])

    useEffect(() => {
        const ws = new WebSocket(url);
        setSocket(ws);

        ws.onopen = () => {
            console.log('WebSocket connection established');
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            handleServerMessage(data);
        };

        ws.onclose = () => {
            console.log('WebSocket connection closed');
        };

        return () => {
            ws.close();
        };
    }, [url]);

    // Handle incoming messages from the server
    const handleServerMessage = (data: ServerMessage) => {
        console.log(data)
        switch (data.status) {
            case 'roomCreated':
                setRoomId(data.roomid ?? null);
                console.log('Room created with ID:', data.roomid);
                break;

            case 'ID':
                setUserId(data.userId ?? null);
                console.log('User ID:', data.userId);
                break;
            case 'Rooms':

                setRooms(data.rooms)
                break;
            case 'roomJoined':
                setRoomId(data.roomid ?? null);

                setMessages(data.message ?? [])

                console.log('Joined room with ID:', data.roomid);
                break;
            case 'messageSent':
                if (data.message) {
                    const newMessage: Message = {
                        userId: data.userId ?? 'Unknown',
                        message: data.message as any
                    };

                    setMessages(prev => [...prev, newMessage]);
                }
                break;
            case 'roomExited':
                if (data.userId === userId) {
                    setRoomId(null);
                    setUserId(null);
                    setMessages([])
                    console.log('Exited room with ID:', data.roomid);
                } else {
                    console.log(`user with ${userId} exited`)
                }
                break;

            default:
                console.log('Unknown server message:', data);
                break;
        }
    };

    // Function to create a room
    const createRoom = () => {
        if (socket) {
            socket.send(JSON.stringify({ action: 'createRoom' }));
        }
    };

    // Function to join a room
    const joinRoom = (roomid: string) => {
        if (socket) {
            socket.send(JSON.stringify({ action: 'joinRoom', roomid }));
        }
    };

    // Function to send a message
    const sendMessage = (message: string) => {
        if (socket) {
            socket.send(JSON.stringify({ action: 'sendMessage', roomid, message }));
        }
    };
    const exitRoom = () => {
        if (socket) {
            socket.send(JSON.stringify({ action: 'exitRoom', roomid, userId }));
        }
    };

    return {
        messages,
        createRoom,
        joinRoom,
        sendMessage,
        exitRoom,
        userId,
        roomid,
        rooms
    };
};
