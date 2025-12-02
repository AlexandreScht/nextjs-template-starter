/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { socketConfig } from "@/config/socket.config";
import {
  type SocketContextType,
  type SocketProviderProps,
} from "@/interfaces/SocketContext";
import type { SocketEventPayloads } from "@/interfaces/SocketTypes";
import { type EVENTS } from "@/libs/SocketEvents";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { io, type Socket } from "socket.io-client";

import SocketEvents from "@/libs/SocketEvents";

const SocketContext = createContext<SocketContextType>({
  socket: null,
  events: null,
  isConnected: false,
  subscribe: (() => () => {}) as any,
});

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [events, setEvents] = useState<SocketEvents | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const subscriptionsRef = useRef<
    Array<{ key: string; callback: (data: unknown) => void }>
  >([]);

  useEffect(() => {
    const socketInstance = io(
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000",
      socketConfig,
    );

    socketInstance.on("connect", () => {
      console.log("Socket connected:", socketInstance.id);
      setIsConnected(true);
      setEvents(new SocketEvents(socketInstance));

      subscriptionsRef.current.forEach(({ key, callback }) => {
        socketInstance.off(key, callback);
        socketInstance.on(key, callback);
      });
    });

    socketInstance.on("disconnect", () => {
      console.log("Socket disconnected");
      setIsConnected(false);
      setEvents(null);
    });

    socketInstance.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  useEffect(() => {
    if (socket) {
      subscriptionsRef.current.forEach(({ key, callback }) => {
        socket.off(key, callback);
        socket.on(key, callback);
      });
    }
  }, [socket]);

  const subscribe = <K extends (typeof EVENTS.ON)[keyof typeof EVENTS.ON]>(
    key: K,
    callback: (data: SocketEventPayloads[K]) => void,
  ) => {
    // Cast callback to generic handler for storage/socket.io
    const genericCallback = callback as (data: unknown) => void;
    subscriptionsRef.current.push({ key, callback: genericCallback });

    if (socket) {
      socket.on(key, genericCallback as any);
    }

    return () => {
      subscriptionsRef.current = subscriptionsRef.current.filter(
        (sub) => sub.callback !== genericCallback || sub.key !== key,
      );
      if (socket) {
        socket.off(key, genericCallback as any);
      }
    };
  };

  return (
    <SocketContext.Provider value={{ socket, events, isConnected, subscribe }}>
      {children}
    </SocketContext.Provider>
  );
};
