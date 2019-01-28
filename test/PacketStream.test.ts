import {assert, expect} from 'chai';
import 'mocha';
import * as net from 'net';
import {AddressInfo, Server, Socket} from 'net';
import {Observable} from 'rxjs';
import {take, toArray} from 'rxjs/operators';
import {PacketEvent, PacketStream, UInt8} from '../dist';
import {UInt16TypedPacket} from './test-packets/TypedPackets/UInt16TypedPacket';
import {UInt32TypedPacket} from './test-packets/TypedPackets/UInt32TypedPacket';
import {UInt8TypedPacket} from './test-packets/TypedPackets/UInt8TypedPacket';
import {UInt8TypedPacket2} from './test-packets/TypedPackets/UInt8TypedPacket2';

function observableToErrorPromise(observable: Observable<any>): Promise<boolean> {
    return new Promise(resolve => {
        observable.subscribe(undefined, () => {
            resolve(false);
        }, () => {
            resolve(true);
        });
    });
}

describe('Packet streaming', () => {

    let inSocket: Socket;
    let outSocket: Socket;
    let server: Server;

    beforeEach(() => {
        let serverReady = false;
        let clientReady = false;

        return new Promise(resolve => {
            server = net.createServer(clientSocket => {
                clientSocket.setNoDelay(true);
                inSocket = clientSocket;

                serverReady = true;
                if (serverReady && clientReady) {
                    resolve();
                }
            });

            server.listen(0, 'localhost', () => {
                const port = (server.address() as AddressInfo).port;

                const clientSocket = new Socket();
                clientSocket.connect(port, 'localhost', () => {
                    outSocket = clientSocket;

                    clientReady = true;
                    if (serverReady && clientReady) {
                        resolve();
                    }
                });
            });
        });
    });

    afterEach(() => {
        inSocket.end();
        outSocket.end();

        server.close();
    });

    it('should stream single packet with UInt8 type field', async () => {
        const incomingPacket = new UInt8TypedPacket();
        incomingPacket.uint32Field = 0xC0FFEE;
        incomingPacket.writeTo(inSocket);

        const packetStream = new PacketStream(UInt8TypedPacket);
        const packetEvent  = await packetStream.attachToStream(outSocket).pipe(take(1)).toPromise();

        expect(packetEvent.packet).to.eql(incomingPacket);
        expect(packetEvent.packetClass).to.equal(UInt8TypedPacket);
    });

    it('should stream single packet with UInt16 type field', async () => {
        const incomingPacket = new UInt16TypedPacket();
        incomingPacket.uint32Field = 0xC0FFEE;
        incomingPacket.writeTo(inSocket);

        const packetStream = new PacketStream(UInt16TypedPacket);
        const packetEvent  = await packetStream.attachToStream(outSocket).pipe(take(1)).toPromise();

        expect(packetEvent.packet).to.eql(incomingPacket);
        expect(packetEvent.packetClass).to.equal(UInt16TypedPacket);
    });

    it('should stream single packet with UInt32 type field', async () => {
        const incomingPacket = new UInt32TypedPacket();
        incomingPacket.uint32Field = 0xC0FFEE;
        incomingPacket.writeTo(inSocket);

        const packetStream = new PacketStream(UInt32TypedPacket);
        const packetEvent  = await packetStream.attachToStream(outSocket).pipe(take(1)).toPromise();

        expect(packetEvent.packet).to.eql(incomingPacket);
        expect(packetEvent.packetClass).to.equal(UInt32TypedPacket);
    });

    it('should stream multiple packets', async () => {
        const numPackets = 10;

        const incomingPackets = new Array<UInt8TypedPacket>(numPackets)
            .fill(undefined)
            .map((_, index) => {
                const packet = new UInt8TypedPacket();
                packet.uint8Field += index + 1;
                packet.writeTo(inSocket);

                return packet;
            });

        const packetStream = new PacketStream(UInt8TypedPacket);
        const packetEvents: PacketEvent<UInt8>[] = await packetStream.attachToStream(outSocket)
            .pipe(
                take(numPackets),
                toArray()
            )
            .toPromise();

        expect(packetEvents.map(event => event.packet)).to.eql(incomingPackets);
    });

    it('should allow packet switching using if method of PacketEvent', async () => {
        const incomingPacket1 = new UInt8TypedPacket();
        const incomingPacket2 = new UInt8TypedPacket2();

        incomingPacket1.uint8Field  = 123;
        incomingPacket2.field.test1 = 111;

        incomingPacket1.writeTo(inSocket);
        incomingPacket2.writeTo(inSocket);

        const packetStream = new PacketStream<UInt8>(UInt8TypedPacket, UInt8TypedPacket2);
        await new Promise(resolve => {
            packetStream.attachToStream(outSocket).pipe(take(2)).subscribe(event => {
                event.if(UInt8TypedPacket, packet => {
                    expect(packet).to.eql(incomingPacket1);
                });

                event.if(UInt8TypedPacket2, packet => {
                    expect(packet).to.eql(incomingPacket2);
                });
            }, undefined, () => resolve());
        });
    });

    it('should be able to recover from unknown packets by resetting stream', async () => {
        const incomingPacket1 = new UInt8TypedPacket2();
        incomingPacket1.writeTo(inSocket);

        const incomingPacket2 = new UInt8TypedPacket();
        incomingPacket2.uint32Field = 0xC0FFEE;
        incomingPacket2.writeTo(inSocket);

        const packetStream = new PacketStream<UInt8>(UInt8TypedPacket);

        await new Promise(resolve => {
            packetStream.attachToStream(outSocket).pipe(take(2)).subscribe(event => {
                event.if(UInt8TypedPacket, packet => {
                    expect(packet).to.eql(incomingPacket2);
                });

                event.if(UInt8TypedPacket2, packet => {
                    assert.fail();
                });

                event.ifUnknown((type, recoveryOptions) => {
                    recoveryOptions.reset();
                    expect(type).to.equal(incomingPacket1.packetType);

                    incomingPacket2.writeTo(inSocket);
                });
            }, undefined, () => resolve());
        });
    });

    it('should allow adding packet types', async () => {
        const incomingPacket1 = new UInt8TypedPacket();
        incomingPacket1.uint32Field = 0xC0FFEE;
        incomingPacket1.writeTo(inSocket);

        const packetStream = new PacketStream<UInt8>(UInt8TypedPacket);
        packetStream.addPacketType(UInt8TypedPacket2);

        const incomingPacket2 = new UInt8TypedPacket2();
        incomingPacket2.field.test1 = 111;
        incomingPacket2.writeTo(inSocket);

        const packetEvents = await packetStream.attachToStream(outSocket).pipe(take(2), toArray()).toPromise();

        expect(packetEvents.map(event => event.packet)).to.eql([incomingPacket1, incomingPacket2]);
    });

    it('should allow removing packet types', async () => {
        const incomingPacket1 = new UInt8TypedPacket();
        incomingPacket1.uint32Field = 0xC0FFEE;
        incomingPacket1.writeTo(inSocket);

        const packetStream = new PacketStream<UInt8>(UInt8TypedPacket, UInt8TypedPacket2);
        packetStream.removePacketType(UInt8TypedPacket2);

        const incomingPacket2 = new UInt8TypedPacket2();
        incomingPacket2.field.test1 = 111;
        incomingPacket2.writeTo(inSocket);

        await new Promise(resolve => {
            packetStream.attachToStream(outSocket).pipe(take(2)).subscribe(event => {
                event.if(UInt8TypedPacket, packet => {
                    expect(packet).to.eql(incomingPacket1);
                });

                event.if(UInt8TypedPacket2, packet => {
                    assert.fail();
                });

                event.ifUnknown((type, recoveryOptions) => {
                    recoveryOptions.ignore();
                    expect(type).to.equal(incomingPacket2.packetType);
                });
            }, undefined, () => resolve());
        });
    });

    it('shouldn\'t allow multiple streamers on the same socket', async () => {
        const packetStream1 = new PacketStream(UInt8TypedPacket);
        packetStream1.attachToStream(outSocket).subscribe();

        const packetStream2 = new PacketStream(UInt8TypedPacket);
        const statusPromise = observableToErrorPromise(packetStream2.attachToStream(outSocket).pipe(take(1)));

        const incomingPacket = new UInt8TypedPacket();
        incomingPacket.writeTo(inSocket);

        const didSucceed = await statusPromise;

        expect(didSucceed).to.equal(false);
    });

    it('should allow new streamer on socket as long as previous streamer un-subscribes', async () => {
        const packetStream1 = new PacketStream(UInt8TypedPacket);
        const firstStreamerPromise = packetStream1.attachToStream(outSocket).pipe(take(1)).toPromise();

        const incomingPacket = new UInt8TypedPacket();
        await incomingPacket.writeTo(inSocket).toPromise();

        await firstStreamerPromise;

        const packetStream2 = new PacketStream(UInt8TypedPacket);
        const statusPromise = observableToErrorPromise(packetStream2.attachToStream(outSocket).pipe(take(1)));

        incomingPacket.writeTo(inSocket);
        incomingPacket.writeTo(inSocket);

        const didSucceed = await statusPromise;

        expect(didSucceed).to.equal(true);
    });

    it('should allow multiple subscribers on the same stream', async () => {
        const packetStream = new PacketStream(UInt8TypedPacket);
        const streamObservable = packetStream.attachToStream(outSocket).pipe(take(1));

        streamObservable.subscribe();

        const incomingPacket = new UInt8TypedPacket();
        incomingPacket.writeTo(inSocket);

        const didSucceed = await observableToErrorPromise(streamObservable);

        expect(didSucceed).to.equal(true);
    });

});
