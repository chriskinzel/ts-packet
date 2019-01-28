import {Class} from '../Types';
import {PacketTypeTypes, TypedPacket} from './PacketStream';

export interface PacketStreamErrorRecoveryOptions {
    // Skips type value in the stream and moves to following byte(s)
    continue: () => void;

    // Clears entire ReadStream and awaits new data
    reset: () => void;

    // Puts type value back on stream for other readers to consume
    // and waits for new data to be available
    ignore: () => void;
}

export class PacketEvent<T extends PacketTypeTypes> {
    public readonly packetType: T;
    public readonly packet: TypedPacket<T>;
    public readonly packetClass: Class<TypedPacket<T>>;

    private readonly recoveryOptions: PacketStreamErrorRecoveryOptions;

    private constructor(recoveryOptions?: PacketStreamErrorRecoveryOptions) {
        this.recoveryOptions = recoveryOptions;
    }

    public if<P extends TypedPacket<T>>(targetClass: Class<P>, handler: (packet: P) => void): void {
        if (this.packetClass === targetClass) {
            handler(this.packet as P);
        }
    }

    public ifUnknown(handler: (unexpectedType: T, recoveryOptions: PacketStreamErrorRecoveryOptions) => void): void {
        if (this.packet === undefined && this.packetClass === undefined) {
            handler(this.packetType, this.recoveryOptions);
        }
    }
}
