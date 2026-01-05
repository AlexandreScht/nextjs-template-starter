import type { Socket } from "socket.io-client";

export class SocketEmitter {
    constructor(private socket: Socket) {}

    public sendMessage(data: { message: string }) {
        this.socket.emit("send_message", data);
    }
}

export class SocketReceiver {
    constructor(private socket: Socket) {}

    private on<T>(event: string, callback: (data: T) => void) {
        this.socket.on(event, callback);
        return () => this.socket.off(event, callback);
    }

    public onReceiveMessage(callback: (data: { message: string }) => void) {
        return this.on("receive_message", callback);
    }
}
