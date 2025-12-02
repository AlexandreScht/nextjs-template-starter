import type { SocketEventPayloads } from "@/interfaces/SocketTypes";
import type SocketEvents from "@/libs/SocketEvents";
import { type EVENTS } from "@/libs/SocketEvents";
import type { Socket } from "socket.io-client";

export interface SocketContextType {
    socket: Socket | null;
    events: SocketEvents | null;
    isConnected: boolean;
    subscribe: <K extends (typeof EVENTS.ON)[keyof typeof EVENTS.ON]>(
        key: K,
        callback: (data: SocketEventPayloads[K]) => void,
    ) => () => void;
}

export interface SocketProviderProps {
    children: React.ReactNode;
}

export type SocketSubscriptionCallback = (data: unknown) => void;
