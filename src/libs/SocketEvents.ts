import type { Socket } from "socket.io-client";

// Helper to define event with type phantom
// The runtime value is just the string name, but TS sees the payload type attached
type EventWithPayload<P> = string & { __payload: P };
const event = <P>(name: string) => name as EventWithPayload<P>;

export const EVENT_SCHEMA = {
    EMIT: {
        SEND_MESSAGE: event<{ message: string }>("send_message"),
    },
    ON: {
        RECEIVE_MESSAGE: event<{ message: string }>("receive_message"),
    },
} as const;

// Flatten values from EMIT and ON to create the payload map
type EmitMap = typeof EVENT_SCHEMA.EMIT;
type OnMap = typeof EVENT_SCHEMA.ON;
type EmitEvents = EmitMap[keyof EmitMap];
type OnEvents = OnMap[keyof OnMap];
type AllEventTypes = EmitEvents | OnEvents;

export type SocketEventPayloads = {
    [E in AllEventTypes as E]: E extends EventWithPayload<infer P> ? P : never;
};

export default class SocketEvents {
    private socket: Socket | null = null;

    constructor(socket: Socket | null) {
        this.socket = socket;
    }

    static readonly EVENTS = EVENT_SCHEMA;

    public sendMessage(message: string) {
        if (this.socket) {
            this.socket.emit(EVENT_SCHEMA.EMIT.SEND_MESSAGE, { message });
        }
    }

    public onMessage(callback: (data: unknown) => void) {
        if (this.socket) {
            this.socket.on(EVENT_SCHEMA.ON.RECEIVE_MESSAGE, callback);
        }
    }
}
