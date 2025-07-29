import { useEffect, useRef, useState } from "react";

const SocketTester = () => {
    const [socket, setSocket] = useState(null);
    const [connectionStatus, setConnectionStatus] = useState("Disconnected");
    const [logs, setLogs] = useState(["Ready to connect..."]);
    const logRef = useRef(null);

    // Fixed server URL to match your backend
    const [serverUrl, setServerUrl] = useState("http://localhost:8000");
    const [token, setToken] = useState("");
    const [roomId, setRoomId] = useState("");
    const [message, setMessage] = useState("");

    const [isSocketIOLoaded, setIsSocketIOLoaded] = useState(false);

    useEffect(() => {
        // Check if socket.io is already loaded
        if (window.io) {
            setIsSocketIOLoaded(true);
            return;
        }

        const script = document.createElement("script");
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.7.2/socket.io.min.js";
        script.async = true;

        script.onload = () => {
            log("📦 Socket.IO library loaded successfully");
            setIsSocketIOLoaded(true);
        };

        script.onerror = () => {
            log("❌ Failed to load Socket.IO library");
        };

        document.body.appendChild(script);

        return () => {
            if (document.body.contains(script)) {
                document.body.removeChild(script);
            }
        };
    }, []);

    useEffect(() => {
        if (logRef.current) {
            logRef.current.scrollTop = logRef.current.scrollHeight;
        }
    }, [logs]);

    const log = (message) => {
        const timestamp = new Date().toLocaleTimeString();
        setLogs((prev) => [...prev, `[${timestamp}] ${message}`]);
    };

    const connectSocket = () => {
        if (!token) return alert("Please enter JWT token first!");

        if (!isSocketIOLoaded || !window.io) {
            alert("Socket.IO library not loaded yet. Please wait...");
            return;
        }

        // Disconnect existing socket if any
        if (socket) {
            socket.disconnect();
        }

        try {
            const io = window.io;

            const newSocket = io(serverUrl, {
                auth: { token },
                transports: ['websocket', 'polling'],
                path: '/socket.io/',
                // Use default namespace since we removed custom namespace
                // namespace: '/api/v1/chat',
                forceNew: true,
                reconnection: true,
                timeout: 10000,
            });

            newSocket.on("connect", () => {
                log("✅ Connected to server");
                log(`🔗 Socket ID: ${newSocket.id}`);
                log(`🌐 Namespace: ${newSocket.nsp}`);
                setConnectionStatus("Connected");
            });

            newSocket.on("disconnect", (reason) => {
                log(`❌ Disconnected from server. Reason: ${reason}`);
                setConnectionStatus("Disconnected");
            });

            newSocket.on("connect_error", (error) => {
                log(`🚫 Connection failed: ${error.message}`);
                log(`🚫 Error type: ${error.type || 'Unknown'}`);
                log(`🚫 Error description: ${error.description || 'No description'}`);
                setConnectionStatus("Connection Failed");
            });

            // Authentication event
            newSocket.on("authenticated", (data) => {
                log(`✅ Authenticated successfully: ${JSON.stringify(data)}`);
            });

            // Chat event listeners
            newSocket.on("joinedRoom", (data) => {
                log(`🏠 Joined room: ${JSON.stringify(data)}`);
            });

            newSocket.on("leftRoom", (data) => {
                log(`🚪 Left room: ${JSON.stringify(data)}`);
            });

            newSocket.on("newMessage", (data) => {
                log(`📨 New message: ${JSON.stringify(data, null, 2)}`);
            });

            newSocket.on("messageSent", (data) => {
                log(`✅ Message sent confirmation: ${JSON.stringify(data)}`);
            });

            newSocket.on("error", (err) => {
                log(`❌ Socket Error: ${JSON.stringify(err)}`);
            });

            newSocket.on("userTyping", (data) => {
                log(`⌨️ User typing: ${JSON.stringify(data)}`);
            });

            newSocket.on("userJoined", (data) => {
                log(`👋 User joined: ${JSON.stringify(data)}`);
            });

            newSocket.on("userLeft", (data) => {
                log(`👋 User left: ${JSON.stringify(data)}`);
            });

            newSocket.on("notification", (data) => {
                log(`🔔 Notification: ${JSON.stringify(data)}`);
            });

            newSocket.on("messagesRead", (data) => {
                log(`👁️ Messages read: ${JSON.stringify(data)}`);
            });

            setSocket(newSocket);
        } catch (error) {
            log(`❌ Failed to create socket connection: ${error.message}`);
            setConnectionStatus("Connection Failed");
        }
    };

    const disconnectSocket = () => {
        if (socket) {
            socket.disconnect();
            setSocket(null);
            log("🔌 Manually disconnected");
            setConnectionStatus("Disconnected");
        }
    };

    const joinRoom = () => {
        if (!socket) return alert("Please connect first!");
        if (!roomId) return alert("Please enter room ID!");

        socket.emit("joinRoom", { roomId });
        log(`🏠 Attempting to join room: ${roomId}`);
    };

    const leaveRoom = () => {
        if (!socket) return alert("Please connect first!");
        if (!roomId) return alert("Please enter room ID!");

        socket.emit("leaveRoom", { roomId });
        log(`🚪 Attempting to leave room: ${roomId}`);
    };

    const sendMessage = () => {
        if (!socket) return alert("Please connect first!");
        if (!roomId || !message) return alert("Please enter room ID and message!");

        socket.emit("sendMessage", { roomId, content: message });
        log(`📤 Sending message to ${roomId}: ${message}`);
        setMessage("");
    };

    const startTyping = () => {
        if (!socket || !roomId) return;

        socket.emit("typing", { roomId, isTyping: true });
        log(`⌨️ Started typing in room: ${roomId}`);
    };

    const stopTyping = () => {
        if (!socket || !roomId) return;

        socket.emit("typing", { roomId, isTyping: false });
        log(`⌨️ Stopped typing in room: ${roomId}`);
    };

    const markAsRead = () => {
        if (!socket || !roomId) return;

        // Example: mark some messages as read
        const mockMessageIds = ["msg1", "msg2", "msg3"];
        socket.emit("markAsRead", { roomId, messageIds: mockMessageIds });
        log(`👁️ Marking messages as read in room: ${roomId}`);
    };

    const clearLogs = () => {
        setLogs(["Logs cleared..."]);
    };

    const testRESTAPI = async () => {
        if (!token) {
            alert("Please enter JWT token first!");
            return;
        }

        try {
            log("🧪 Testing REST API endpoints...");

            // Test get my rooms
            const response = await fetch(`${serverUrl}/api/v1/chat/rooms/me`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const rooms = await response.json();
                log(`✅ GET /chat/rooms/me success: ${JSON.stringify(rooms, null, 2)}`);
            } else {
                const error = await response.text();
                log(`❌ GET /chat/rooms/me failed: ${response.status} - ${error}`);
            }
        } catch (error) {
            log(`❌ REST API test failed: ${error.message}`);
        }
    };

    const createTestRoom = async () => {
        if (!token) {
            alert("Please enter JWT token first!");
            return;
        }

        try {
            log("🏗️ Creating test room...");

            const response = await fetch(`${serverUrl}/api/v1/chat/rooms`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    type: 'support',
                    relationType: 'user-support',
                    participants: [] // Will be populated by backend
                })
            });

            if (response.ok) {
                const room = await response.json();
                log(`✅ Room created: ${JSON.stringify(room, null, 2)}`);
                setRoomId(room._id);
            } else {
                const error = await response.text();
                log(`❌ Create room failed: ${response.status} - ${error}`);
            }
        } catch (error) {
            log(`❌ Create room failed: ${error.message}`);
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-6 bg-white shadow-xl rounded-xl mt-10">
            <h1 className="text-3xl font-bold text-center text-indigo-600 mb-6">
                🚀 WebSocket Chat Tester (NestJS + Socket.IO)
            </h1>

            <div className="mb-6 p-4 bg-blue-100 border-l-4 border-blue-500 rounded">
                💡 <strong>Hướng dẫn test WebSocket:</strong>
                <ol className="mt-2 ml-4 list-decimal text-sm">
                    <li>Server đang chạy trên: <code className="bg-gray-200 px-1 rounded">http://localhost:8000</code></li>
                    <li>Đăng nhập qua POST <code>/api/v1/auth/login</code> để lấy JWT token</li>
                    <li>Paste JWT token vào ô bên dưới</li>
                    <li>Click "Test REST API" để kiểm tra kết nối</li>
                    <li>Click "Create Test Room" để tạo room hoặc nhập roomId có sẵn</li>
                    <li>Click "Connect" để kết nối WebSocket</li>
                    <li>Join room và test chat realtime</li>
                    <li>Mở nhiều tab với token khác nhau để test chat giữa nhiều user</li>
                </ol>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Connection Settings */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-800">🔗 Connection Settings</h2>

                    <div>
                        <label className="block font-semibold text-gray-700 mb-1">Server URL:</label>
                        <input
                            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            value={serverUrl}
                            onChange={(e) => setServerUrl(e.target.value)}
                            placeholder="http://localhost:8000"
                        />
                        <small className="text-gray-600">Backend đang chạy trên port 8000</small>
                    </div>

                    <div>
                        <label className="block font-semibold text-gray-700 mb-1">JWT Token:</label>
                        <textarea
                            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            rows={3}
                            placeholder="Paste your JWT token here..."
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            onClick={testRESTAPI}
                            disabled={!token}
                            className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 text-sm"
                        >
                            🧪 Test REST API
                        </button>
                        <button
                            onClick={createTestRoom}
                            disabled={!token}
                            className="px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-400 text-sm"
                        >
                            🏗️ Create Test Room
                        </button>
                    </div>

                    <div className="flex items-center space-x-3">
                        <button
                            onClick={connectSocket}
                            disabled={!token || !isSocketIOLoaded}
                            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:bg-gray-400"
                        >
                            {isSocketIOLoaded ? "🔗 Connect" : "📦 Loading..."}
                        </button>
                        <button
                            onClick={disconnectSocket}
                            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                        >
                            ❌ Disconnect
                        </button>
                        <span className={`text-sm font-semibold px-3 py-1 rounded ${
                            connectionStatus === 'Connected' ? 'bg-green-100 text-green-800' :
                                connectionStatus === 'Connection Failed' ? 'bg-red-100 text-red-800' :
                                    'bg-gray-100 text-gray-800'
                        }`}>
                            {connectionStatus}
                        </span>
                    </div>
                </div>

                {/* Room & Message Controls */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-800">🏠 Room & Messages</h2>

                    <div>
                        <label className="block font-semibold text-gray-700 mb-1">Room ID:</label>
                        <div className="flex space-x-2">
                            <input
                                className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter room ID (or create one above)"
                                value={roomId}
                                onChange={(e) => setRoomId(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex space-x-2">
                        <button
                            onClick={joinRoom}
                            disabled={!socket || !roomId}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
                        >
                            🏠 Join
                        </button>
                        <button
                            onClick={leaveRoom}
                            disabled={!socket || !roomId}
                            className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:bg-gray-400"
                        >
                            🚪 Leave
                        </button>
                    </div>

                    <div>
                        <label className="block font-semibold text-gray-700 mb-1">Message:</label>
                        <textarea
                            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                            rows={3}
                            placeholder="Type your message..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onFocus={startTyping}
                            onBlur={stopTyping}
                        />
                        <div className="flex space-x-2 mt-2">
                            <button
                                onClick={sendMessage}
                                disabled={!socket || !roomId || !message.trim()}
                                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
                            >
                                📤 Send Message
                            </button>
                            <button
                                onClick={markAsRead}
                                disabled={!socket || !roomId}
                                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-400"
                            >
                                👁️ Mark as Read
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Connection Log */}
            <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                    <label className="block font-semibold text-gray-700">Connection Log:</label>
                    <button
                        onClick={clearLogs}
                        className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
                    >
                        🗑️ Clear
                    </button>
                </div>
                <div
                    ref={logRef}
                    className="bg-black text-green-200 p-4 rounded h-80 overflow-y-auto text-sm font-mono whitespace-pre-wrap border-2 border-gray-300"
                >
                    {logs.join("\n")}
                </div>
            </div>

            {/* Testing Tips */}
            <div className="mt-6 p-4 bg-yellow-100 border-l-4 border-yellow-500 rounded">
                <strong>🔧 Troubleshooting:</strong>
                <ul className="mt-2 ml-4 list-disc text-sm">
                    <li><strong>Nếu connection failed:</strong> Kiểm tra JWT token có hợp lệ không và backend có chạy không</li>
                    <li><strong>Nếu không join được room:</strong> Tạo room trước qua REST API hoặc dùng roomId có sẵn</li>
                    <li><strong>Test realtime:</strong> Mở 2 tab với 2 JWT token khác nhau, cùng join 1 room</li>
                    <li><strong>Debug:</strong> Mở DevTools → Network → WS để xem WebSocket connection</li>
                    <li><strong>Backend logs:</strong> Kiểm tra console của NestJS server để debug</li>
                </ul>
            </div>
        </div>
    );
};

export default SocketTester;