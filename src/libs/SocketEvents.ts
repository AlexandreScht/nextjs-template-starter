import type { Socket } from "socket.io-client";

export const EVENTS = {
    EMIT: {
        SEND_MESSAGE: "send_message",
    },
    ON: {
        RECEIVE_MESSAGE: "receive_message",
    },
} as const;

export default class SocketEvents {
    private socket: Socket | null = null;

    constructor(socket: Socket | null) {
        this.socket = socket;
    }

    static readonly EVENTS = EVENTS;

    public sendMessage(message: string) {
        if (this.socket) {
            this.socket.emit(EVENTS.EMIT.SEND_MESSAGE, { message });
        }
    }

    public onMessage(callback: (data: unknown) => void) {
        if (this.socket) {
            this.socket.on(EVENTS.ON.RECEIVE_MESSAGE, callback);
        }
    }
}
