import type { EVENTS } from "@/libs/SocketEvents";

export type SocketEventPayloads = {
    [EVENTS.EMIT.SEND_MESSAGE]: { message: string };
    [EVENTS.ON.RECEIVE_MESSAGE]: { message: string };
};
