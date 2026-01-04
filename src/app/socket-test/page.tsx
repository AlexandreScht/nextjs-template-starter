"use client";

import { EVENT_SCHEMA } from "@/libs/SocketEvents";
import { useSocket } from "@/providers/SocketProvider";
import { useEffect, useState } from "react";

export default function SocketTestPage() {
  const { socket, events, isConnected, subscribe } = useSocket();
  const [messages, setMessages] = useState<string[]>([]);
  const [inputMessage, setInputMessage] = useState("");

  useEffect(() => {
    if (!socket) return;

    const unsubscribe = subscribe(EVENT_SCHEMA.ON.RECEIVE_MESSAGE, (data) => {
      console.log("Received message:", data);
      setMessages((prev) => [...prev, data.message]);
    });

    return () => {
      unsubscribe();
    };
  }, [socket, subscribe]);

  const handleSendMessage = () => {
    if (events && inputMessage) {
      events.sendMessage(inputMessage);
      setInputMessage("");
    }
  };

  return (
    <div className="p-8 font-sans">
      <h1 className="text-2xl font-bold mb-4">Socket Test Page</h1>
      <div className="mb-4">
        <span className="font-semibold">Status: </span>
        <span
          className={`px-2 py-1 rounded ${
            isConnected
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {isConnected ? "Connected" : "Disconnected"}
        </span>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Send Message</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            className="border p-2 rounded flex-grow text-black"
            placeholder="Type a message..."
          />
          <button
            onClick={handleSendMessage}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            disabled={!isConnected}
          >
            Send
          </button>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Received Messages</h2>
        <div className="border p-4 rounded h-64 overflow-y-auto bg-gray-50 text-black">
          {messages.length === 0 ? (
            <p className="text-gray-500">No messages received yet.</p>
          ) : (
            <ul className="list-disc pl-5">
              {messages.map((msg, index) => (
                <li key={index}>{msg}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
