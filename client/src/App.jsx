import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";

const App = () => {
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [socket, setSocket] = useState(null);
  const [isJoined, setIsJoined] = useState(false);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    const newSocket = io("http://localhost:3001");
    setSocket(newSocket);

    newSocket.on("message", (msg) => {
      setChatHistory((prev) => [...prev, msg]);
    });

    newSocket.on("chatHistory", (history) => {
      setChatHistory(history);
    });

    newSocket.on("userJoined", (user) => {
      setChatHistory((prev) => [
        ...prev,
        {
          username: "System",
          text: `${user} joined the chat`,
          timestamp: new Date().toISOString(),
        },
      ]);
    });

    newSocket.on("userLeft", (user) => {
      setChatHistory((prev) => [
        ...prev,
        {
          username: "System",
          text: `${user} left the chat`,
          timestamp: new Date().toISOString(),
        },
      ]);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleJoin = (e) => {
    e.preventDefault();
    if (username && socket) {
      socket.emit("join", username);
      setIsJoined(true);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message && socket) {
      socket.emit("sendMessage", message);
      setMessage("");
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="flex-grow p-4 overflow-auto" ref={chatContainerRef}>
        {chatHistory.map((msg, index) => (
          <div key={index} className="mb-2">
            <span className="font-bold">{msg.username}: </span>
            <span>{msg.text}</span>
          </div>
        ))}
      </div>
      {!isJoined ? (
        <form onSubmit={handleJoin} className="p-4 bg-white">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            className="w-full p-2 border rounded"
          />
          <button
            type="submit"
            className="mt-2 w-full p-2 bg-blue-500 text-white rounded"
          >
            Join
          </button>
        </form>
      ) : (
        <form onSubmit={handleSendMessage} className="p-4 bg-white">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message"
            className="w-full p-2 border rounded"
          />
          <button
            type="submit"
            className="mt-2 w-full p-2 bg-blue-500 text-white rounded"
          >
            Send
          </button>
        </form>
      )}
    </div>
  );
};

export default App;
