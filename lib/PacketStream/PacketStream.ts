import ReadStream = NodeJS.ReadStream;
import {Observable, Subscriber} from 'rxjs';
import {share} from 'rxjs/operators';
import {AbstractPacket} from '../AbstractPacket';
import {Class, UInt16, UInt32, UInt8} from '../Types';
import {PacketEvent, PacketStreamErrorRecoveryOptions} from './PacketEvent';

export type PacketTypeTypes = UInt8 | UInt16 | UInt32;

export interface TypedPacket<T extends PacketTypeTypes> extends AbstractPacket {
    packetType: T;
}

export class PacketStream<T extends PacketTypeTypes> {
    private readonly packetTypeMap: Map<T, Class<TypedPacket<T>>>;
    private fieldType: Class<PacketTypeTypes>;

    constructor(...packetTypes: Class<TypedPacket<T>>[]) {
        const keyValueArray = packetTypes.map(packetClass =>
            [new packetClass().packetType, packetClass] as [T, Class<TypedPacket<T>>]
        );

        this.packetTypeMap = new Map(keyValueArray);

        if (packetTypes.length > 0) {
            const structureMetadata  = (new packetTypes[0]() as unknown as AbstractPacketFriend).structureMetadata;
            const packetTypeMetadata = structureMetadata.packetType;

            this.fieldType = packetTypeMetadata.type;
        }
    }

    public attachToStream(readable: ReadStream): Observable<PacketEvent<T>> {
        return Observable.create(observer => {
            if (this.fieldType === undefined) {
                throw {
                    name:    'Packet Stream Missing Types Error',
                    message: 'Attempted to attach to ReadStream without any specified packet types',
                    toString: () => 'Attempted to attach to ReadStream without any specified packet types'
                };
            }

            this.lockReadbleToSubscriber(readable, observer);

            const numberOfRequiredBytes = (this.fieldType as any).size;

            const listener = () => {
                if (readable.readableLength >= numberOfRequiredBytes) {
                    const data = readable.read(numberOfRequiredBytes) as Buffer;
                    const type = this.readTypedFieldFromBuffer(data);

                    const incomingPacketType = this.packetTypeMap.get(type as PacketTypeTypes as T);

                    if (incomingPacketType !== undefined) {
                        readable.removeListener('readable', listener);
                        readable.unshift(data);

                        const packet = new incomingPacketType();

                        packet.readFrom(readable).subscribe(() => {
                            const event = new (PacketEvent as unknown as PacketEventFriend<T>)();
                            event.packetType  = type as PacketTypeTypes as T;
                            event.packetClass = incomingPacketType;
                            event.packet      = packet;

                            observer.next(event);

                            process.nextTick(() => {
                                listener();
                            });

                            readable.on('readable', listener);
                        });
                    } else {
                        let errorHandled = false;

                        const event = new (PacketEvent as unknown as PacketEventFriend<T>)({
                            continue: () => {
                                process.nextTick(() => {
                                    listener();
                                });

                                errorHandled = true;
                            },
                            reset: () => {
                                readable.read();
                                errorHandled = true;
                            },
                            ignore: () => {
                                readable.removeListener('readable', listener);
                                readable.once('readable', () => {
                                    readable.on('readable', listener);
                                });

                                readable.unshift(data);

                                errorHandled = true;
                            }
                        });

                        event.packetType  = type as PacketTypeTypes as T;
                        event.packetClass = undefined;
                        event.packet      = undefined;

                        observer.next(event);

                        if (!errorHandled) {
                            throw {
                                name:    'Uncaught Packet Stream Unexpected Packet Error',
                                message: 'Encountered unknown packet type in ReadStream.',
                                toString: () => 'Encountered unknown packet type in ReadStream.'
                            };
                        }
                    }
                }
            };

            readable.on('readable', listener);
            listener();
        }).pipe(share());
    }

    public addPacketType(packetType: Class<TypedPacket<T>>) {
        const instance = new packetType();
        if (this.fieldType === undefined) {
            const structureMetadata  = (instance as unknown as AbstractPacketFriend).structureMetadata;
            const packetTypeMetadata = structureMetadata.packetType;

            this.fieldType = packetTypeMetadata.type;
        }

        this.packetTypeMap.set(instance.packetType, packetType);
    }

    public removePacketType(packetType: Class<TypedPacket<T>>) {
        this.packetTypeMap.delete(new packetType().packetType);
    }

    private lockReadbleToSubscriber(readable: ReadStream, subscriber: Subscriber<any>) {
        if (readable[READABLE_LOCK_SYMBOL] !== undefined) {
            throw {
                name:    'Packet Stream Concurrency Error',
                message: 'Attempted to attach more than one PacketStream to the same ReadStream.',
                toString: () => 'Attempted to attach more than one PacketStream to the same ReadStream.'
            };
        }

        readable[READABLE_LOCK_SYMBOL] = true;

        const unsubscribe = subscriber.unsubscribe.bind(subscriber);
        subscriber.unsubscribe = () => {
            readable[READABLE_LOCK_SYMBOL] = undefined;
            unsubscribe();
        };
    }

    private readTypedFieldFromBuffer(buffer: Buffer): number {
        switch (this.fieldType) {
            case UInt8:
                return buffer.readUInt8(0);

            case UInt16:
                return buffer.readUInt16BE(0);

            case UInt32:
                return buffer.readUInt32BE(0);
        }
    }
}

interface AbstractPacketFriend {
    structureMetadata;
}

interface PacketEventFriend<T extends PacketTypeTypes> {
    packetType: T;
    packet: TypedPacket<T>;
    packetClass: Class<TypedPacket<T>>;

    /* tslint:disable-next-line:no-misused-new */
    new (recoveryOptions?: PacketStreamErrorRecoveryOptions): PacketEventFriend<T>;
}

const READABLE_LOCK_SYMBOL = Symbol('PacketStreamLock');
