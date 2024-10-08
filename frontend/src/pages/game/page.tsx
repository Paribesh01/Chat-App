import { useSocket } from '../../hooks/useSocket';
import ChatBox from '../../ChatBox';

export default function Game() {
    const { messages, createRoom, exitRoom, joinRoom, sendMessage, roomid, userId, rooms } = useSocket();

    const handleSendMessage = (message: string) => {
        if (roomid && message.trim()) {
            sendMessage(message);
        }
    };

    return (
        <>
            <div className="container mx-auto p-4 max-w-2xl">




                {roomid ? (
                    <div className="bg-white shadow-md rounded-lg mt-8 p-6">
                        <h2 className="text-2xl font-bold mb-4">Current Room: {roomid}</h2>
                        <button
                            onClick={exitRoom}
                            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                        >
                            Leave Room
                        </button>



                        <ChatBox userid={userId} handleSendMessage={handleSendMessage} messages={messages} />

                    </div>
                ) : (
                    <>
                        <div className="bg-white shadow-md rounded-lg mb-8 p-6">
                            <h2 className="text-2xl font-bold mb-2">Create a Room</h2>

                            <button
                                type="submit"
                                onClick={createRoom}
                                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                                Create Room
                            </button>
                        </div>
                        <div className="bg-white shadow-md rounded-lg p-6">
                            <h2 className="text-2xl font-bold mb-2">Available Rooms</h2>
                            <p className="text-gray-600 mb-4">Join an existing room or create a new one</p>
                            {rooms.length === 0 ? (
                                <p className="text-center text-gray-500">No rooms available. Create one to get started!</p>
                            ) : (
                                <ul className="space-y-2">
                                    {rooms.map((room, index) => (
                                        <li key={index} className="flex items-center justify-between p-2 bg-gray-100 rounded-md">
                                            <span>{room.roomid}</span>
                                            <button
                                                onClick={() => joinRoom(room.roomid)}
                                                className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                                            >
                                                Join
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </>
                )}
            </div>


        </>
    );
}
