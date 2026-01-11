/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import env from "@/config";
import { socketConfig } from "@/config/socket";
import {
  type SocketContextType,
  type SocketProviderProps,
} from "@/types/socketContext";
import { SocketEmitter, SocketReceiver } from "@/libs/SocketEvents";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { io, type Socket } from "socket.io-client";

const SocketContext = createContext<SocketContextType>({
  socket: null,
  emitter: null,
  receiver: null,
  isConnected: false,
  subscribe: (() => () => {}) as any,
});

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [emitter, setEmitter] = useState<SocketEmitter | null>(null);
  const [receiver, setReceiver] = useState<SocketReceiver | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const subscriptionsRef = useRef<
    Array<{
      setup: (receiver: SocketReceiver) => () => void;
      cleanup: (() => void) | null;
    }>
  >([]);

  useEffect(() => {
    const socketInstance = io(env.SOCKET_URI, socketConfig);

    socketInstance.on("connect", () => {
      console.log("Socket connected:", socketInstance.id);
      setIsConnected(true);
      const newEmitter = new SocketEmitter(socketInstance);
      const newReceiver = new SocketReceiver(socketInstance);
      setEmitter(newEmitter);
      setReceiver(newReceiver);

      subscriptionsRef.current.forEach((sub) => {
        if (sub.cleanup) sub.cleanup();
        sub.cleanup = sub.setup(newReceiver);
      });
    });

    socketInstance.on("disconnect", () => {
      console.log("Socket disconnected");
      setIsConnected(false);
      setEmitter(null);
      setReceiver(null);
    });

    socketInstance.on("connect_error", (err: Error) => {
      console.error("Socket connection error:", err.message);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  useEffect(() => {
    return () => {
      subscriptionsRef.current.forEach((sub) => {
        if (sub.cleanup) sub.cleanup();
      });
    };
  }, []);

  const subscribe = (setup: (receiver: SocketReceiver) => () => void) => {
    const subscription = {
      setup,
      cleanup: receiver ? setup(receiver) : null,
    };
    subscriptionsRef.current.push(subscription);

    return () => {
      if (subscription.cleanup) subscription.cleanup();
      subscriptionsRef.current = subscriptionsRef.current.filter(
        (sub) => sub !== subscription,
      );
    };
  };

  return (
    <SocketContext.Provider
      value={{ socket, emitter, receiver, isConnected, subscribe }}
    >
      {children}
    </SocketContext.Provider>
  );
};
