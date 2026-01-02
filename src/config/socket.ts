import type { ManagerOptions, SocketOptions } from "socket.io-client";
const isProduction = process.env.NODE_ENV === "production";

export const socketConfig = {
    withCredentials: true,
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    secure: isProduction,
    reconnectionDelay: 1000,
} as Partial<ManagerOptions & SocketOptions>;
