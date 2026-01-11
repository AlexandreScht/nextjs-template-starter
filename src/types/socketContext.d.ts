import { type SocketEmitter, type SocketReceiver } from "@/libs/SocketEvents";
import type { Socket } from "socket.io-client";

export interface SocketContextType {
    socket: Socket | null;
    emitter: SocketEmitter | null;
    receiver: SocketReceiver | null;
    isConnected: boolean;
    subscribe: (setup: (receiver: SocketReceiver) => () => void) => () => void;
}

export interface SocketProviderProps {
    children: React.ReactNode;
}
