import {expect} from 'chai';
import 'mocha';
import * as net from 'net';
import {AddressInfo, Server, Socket} from 'net';

import {BufferPacket} from './test-packets/BufferPacket';
import {Int16ArrayPacket} from './test-packets/Int16ArrayPacket';
import {Int16Packet} from './test-packets/Int16Packet';
import {Int32ArrayPacket} from './test-packets/Int32ArrayPacket';
import {Int32Packet} from './test-packets/Int32Packet';
import {Int8ArrayPacket} from './test-packets/Int8ArrayPacket';
import {Int8Packet} from './test-packets/Int8Packet';
import {MapFieldArrayPacket} from './test-packets/MapFieldArrayPacket';
import {MapFieldPacket} from './test-packets/MapFieldPacket';
import {MixedPacket} from './test-packets/MixedPacket';
import {NestedArrayPacket} from './test-packets/NestedArrayPacket';
import {NestedPacket} from './test-packets/NestedPacket';
import {PrimitivePacket} from './test-packets/PrimitivePacket';
import {UInt16ArrayPacket} from './test-packets/UInt16ArrayPacket';
import {UInt16Packet} from './test-packets/UInt16Packet';
import {UInt32ArrayPacket} from './test-packets/UInt32ArrayPacket';
import {UInt32Packet} from './test-packets/UInt32Packet';
import {UInt8ArrayPacket} from './test-packets/UInt8ArrayPacket';
import {UInt8Packet} from './test-packets/UInt8Packet';
import {UTF8StringPacket} from './test-packets/UTF8StringPacket';

describe('Packet serialization', () => {

    describe('Using socket', () => {
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

        describe('Primitive type fields', () => {
            it('should serialize and deserialize UInt8 fields', async () => {
                const inputPacket  = new UInt8Packet();
                const outputPacket = new UInt8Packet();

                outputPacket.field = undefined;

                inputPacket.writeTo(inSocket);
                await outputPacket.readFrom(outSocket).toPromise();

                expect(outputPacket.field).to.equal(inputPacket.field);
            });

            it('should serialize and deserialize UInt16 fields', async () => {
                const inputPacket  = new UInt16Packet();
                const outputPacket = new UInt16Packet();

                outputPacket.field = undefined;

                inputPacket.writeTo(inSocket);
                await outputPacket.readFrom(outSocket).toPromise();

                expect(outputPacket.field).to.equal(inputPacket.field);
            });

            it('should serialize and deserialize UInt32 fields', async () => {
                const inputPacket  = new UInt32Packet();
                const outputPacket = new UInt32Packet();

                outputPacket.field = undefined;

                inputPacket.writeTo(inSocket);
                await outputPacket.readFrom(outSocket).toPromise();

                expect(outputPacket.field).to.equal(inputPacket.field);
            });

            it('should serialize and deserialize Int8 fields', async () => {
                const inputPacket  = new Int8Packet();
                const outputPacket = new Int8Packet();

                outputPacket.field = undefined;

                inputPacket.writeTo(inSocket);
                await outputPacket.readFrom(outSocket).toPromise();

                expect(outputPacket.field).to.equal(inputPacket.field);
            });

            it('should serialize and deserialize Int16 fields', async () => {
                const inputPacket  = new Int16Packet();
                const outputPacket = new Int16Packet();

                outputPacket.field = undefined;

                inputPacket.writeTo(inSocket);
                await outputPacket.readFrom(outSocket).toPromise();

                expect(outputPacket.field).to.equal(inputPacket.field);
            });

            it('should serialize and deserialize Int32 fields', async () => {
                const inputPacket  = new Int32Packet();
                const outputPacket = new Int32Packet();

                outputPacket.field = undefined;

                inputPacket.writeTo(inSocket);
                await outputPacket.readFrom(outSocket).toPromise();

                expect(outputPacket.field).to.equal(inputPacket.field);
            });

            it('should serialize and deserialize Buffer fields', async () => {
                const inputPacket  = new BufferPacket();
                const outputPacket = new BufferPacket();

                outputPacket.field = undefined;

                inputPacket.writeTo(inSocket);
                await outputPacket.readFrom(outSocket).toPromise();

                expect(outputPacket.field.compare(inputPacket.field)).to.equal(0);
            });

            it('should serialize and deserialize UTF8String fields', async () => {
                const inputPacket  = new UTF8StringPacket();
                const outputPacket = new UTF8StringPacket();

                outputPacket.field = undefined;

                inputPacket.writeTo(inSocket);
                await outputPacket.readFrom(outSocket).toPromise();

                expect(outputPacket.field).to.equal(inputPacket.field);
            });

            it('should serialize and deserialize multiple primitive fields', async () => {
                const inputPacket  = new PrimitivePacket();
                const outputPacket = new PrimitivePacket();

                Object.keys(outputPacket).forEach(key => {
                    outputPacket[key] = undefined;
                });

                inputPacket.writeTo(inSocket);
                await outputPacket.readFrom(outSocket).toPromise();

                Object.keys(outputPacket).forEach(key => {
                    if (outputPacket[key] instanceof Buffer) {
                        expect(outputPacket[key].compare(inputPacket[key])).to.equal(0);
                    } else {
                        expect(outputPacket[key]).to.equal(inputPacket[key]);
                    }
                });
            });
        });

        describe('Complex type fields', () => {
            it('should serialize and deserialize UInt8 array fields', async () => {
                const inputPacket  = new UInt8ArrayPacket();
                const outputPacket = new UInt8ArrayPacket();

                outputPacket.field = undefined;

                inputPacket.writeTo(inSocket);
                await outputPacket.readFrom(outSocket).toPromise();

                expect(outputPacket.field).to.eql(inputPacket.field);
            });

            it('should serialize and deserialize UInt16 array fields', async () => {
                const inputPacket  = new UInt16ArrayPacket();
                const outputPacket = new UInt16ArrayPacket();

                outputPacket.field = undefined;

                inputPacket.writeTo(inSocket);
                await outputPacket.readFrom(outSocket).toPromise();

                expect(outputPacket.field).to.eql(inputPacket.field);
            });

            it('should serialize and deserialize UInt32 array fields', async () => {
                const inputPacket  = new UInt32ArrayPacket();
                const outputPacket = new UInt32ArrayPacket();

                outputPacket.field = undefined;

                inputPacket.writeTo(inSocket);
                await outputPacket.readFrom(outSocket).toPromise();

                expect(outputPacket.field).to.eql(inputPacket.field);
            });

            it('should serialize and deserialize Int8 array fields', async () => {
                const inputPacket  = new Int8ArrayPacket();
                const outputPacket = new Int8ArrayPacket();

                outputPacket.field = undefined;

                inputPacket.writeTo(inSocket);
                await outputPacket.readFrom(outSocket).toPromise();

                expect(outputPacket.field).to.eql(inputPacket.field);
            });

            it('should serialize and deserialize Int16 array fields', async () => {
                const inputPacket  = new Int16ArrayPacket();
                const outputPacket = new Int16ArrayPacket();

                outputPacket.field = undefined;

                inputPacket.writeTo(inSocket);
                await outputPacket.readFrom(outSocket).toPromise();

                expect(outputPacket.field).to.eql(inputPacket.field);
            });

            it('should serialize and deserialize Int32 array fields', async () => {
                const inputPacket  = new Int32ArrayPacket();
                const outputPacket = new Int32ArrayPacket();

                outputPacket.field = undefined;

                inputPacket.writeTo(inSocket);
                await outputPacket.readFrom(outSocket).toPromise();

                expect(outputPacket.field).to.eql(inputPacket.field);
            });

            it('should serialize and deserialize object/map fields', async () => {
                const inputPacket  = new MapFieldPacket();
                const outputPacket = new MapFieldPacket();

                outputPacket.field = undefined;

                inputPacket.writeTo(inSocket);
                await outputPacket.readFrom(outSocket).toPromise();

                expect(outputPacket.field).to.eql(inputPacket.field);
            });

            it('should serialize and deserialize object/map array fields', async () => {
                const inputPacket  = new MapFieldArrayPacket();
                const outputPacket = new MapFieldArrayPacket();

                outputPacket.field = undefined;

                inputPacket.writeTo(inSocket);
                await outputPacket.readFrom(outSocket).toPromise();

                expect(outputPacket.field).to.eql(inputPacket.field);
            });

            it('should serialize and deserialize nested fields', async () => {
                const inputPacket  = new NestedPacket();
                const outputPacket = new NestedPacket();

                outputPacket.field = undefined;

                inputPacket.writeTo(inSocket);
                await outputPacket.readFrom(outSocket).toPromise();

                expect(outputPacket.field).to.eql(inputPacket.field);
            });

            it('should serialize and deserialize nested array fields', async () => {
                const inputPacket  = new NestedArrayPacket();
                const outputPacket = new NestedArrayPacket();

                outputPacket.field = undefined;

                inputPacket.writeTo(inSocket);
                await outputPacket.readFrom(outSocket).toPromise();

                expect(outputPacket.field).to.eql(inputPacket.field);
            });

            it('should serialize and deserialize multiple complex fields', async () => {
                const inputPacket  = new MixedPacket();
                const outputPacket = new MixedPacket();

                Object.keys(outputPacket).forEach(key => {
                    outputPacket[key] = undefined;
                });

                inputPacket.writeTo(inSocket);
                await outputPacket.readFrom(outSocket).toPromise();

                Object.keys(outputPacket).forEach(key => {
                    expect(outputPacket[key]).to.eql(inputPacket[key]);
                });
            });
        });
    });

    describe('Using buffer', () => {
        describe('Primitive type fields', () => {
            it('should serialize and deserialize UInt8 fields', () => {
                const inputPacket  = new UInt8Packet();
                const outputPacket = new UInt8Packet();

                outputPacket.field = undefined;
                outputPacket.data = inputPacket.data;

                expect(outputPacket.field).to.equal(inputPacket.field);
            });

            it('should serialize and deserialize UInt16 fields', () => {
                const inputPacket  = new UInt16Packet();
                const outputPacket = new UInt16Packet();

                outputPacket.field = undefined;
                outputPacket.data = inputPacket.data;

                expect(outputPacket.field).to.equal(inputPacket.field);
            });

            it('should serialize and deserialize UInt32 fields', () => {
                const inputPacket  = new UInt32Packet();
                const outputPacket = new UInt32Packet();

                outputPacket.field = undefined;
                outputPacket.data = inputPacket.data;

                expect(outputPacket.field).to.equal(inputPacket.field);
            });

            it('should serialize and deserialize Int8 fields', () => {
                const inputPacket  = new Int8Packet();
                const outputPacket = new Int8Packet();

                outputPacket.field = undefined;
                outputPacket.data = inputPacket.data;

                expect(outputPacket.field).to.equal(inputPacket.field);
            });

            it('should serialize and deserialize Int16 fields', () => {
                const inputPacket  = new Int16Packet();
                const outputPacket = new Int16Packet();

                outputPacket.field = undefined;
                outputPacket.data = inputPacket.data;

                expect(outputPacket.field).to.equal(inputPacket.field);
            });

            it('should serialize and deserialize Int32 fields', () => {
                const inputPacket  = new Int32Packet();
                const outputPacket = new Int32Packet();

                outputPacket.field = undefined;
                outputPacket.data = inputPacket.data;

                expect(outputPacket.field).to.equal(inputPacket.field);
            });

            it('should serialize and deserialize Buffer fields', () => {
                const inputPacket  = new BufferPacket();
                const outputPacket = new BufferPacket();

                outputPacket.field = undefined;
                outputPacket.data = inputPacket.data;

                expect(outputPacket.field.compare(inputPacket.field)).to.equal(0);
            });

            it('should serialize and deserialize UTF8String fields', () => {
                const inputPacket  = new UTF8StringPacket();
                const outputPacket = new UTF8StringPacket();

                outputPacket.field = undefined;
                outputPacket.data = inputPacket.data;

                expect(outputPacket.field).to.equal(inputPacket.field);
            });

            it('should serialize and deserialize multiple primitive fields', () => {
                const inputPacket  = new PrimitivePacket();
                const outputPacket = new PrimitivePacket();

                Object.keys(outputPacket).forEach(key => {
                    outputPacket[key] = undefined;
                });
                outputPacket.data = inputPacket.data;

                Object.keys(outputPacket).forEach(key => {
                    if (outputPacket[key] instanceof Buffer) {
                        expect(outputPacket[key].compare(inputPacket[key])).to.equal(0);
                    } else {
                        expect(outputPacket[key]).to.equal(inputPacket[key]);
                    }
                });
            });
        });

        describe('Complex type fields', () => {
            it('should serialize and deserialize UInt8 array fields', () => {
                const inputPacket  = new UInt8ArrayPacket();
                const outputPacket = new UInt8ArrayPacket();

                outputPacket.field = undefined;
                outputPacket.data = inputPacket.data;

                expect(outputPacket.field).to.eql(inputPacket.field);
            });

            it('should serialize and deserialize UInt16 array fields', () => {
                const inputPacket  = new UInt16ArrayPacket();
                const outputPacket = new UInt16ArrayPacket();

                outputPacket.field = undefined;
                outputPacket.data = inputPacket.data;

                expect(outputPacket.field).to.eql(inputPacket.field);
            });

            it('should serialize and deserialize UInt32 array fields', () => {
                const inputPacket  = new UInt32ArrayPacket();
                const outputPacket = new UInt32ArrayPacket();

                outputPacket.field = undefined;
                outputPacket.data = inputPacket.data;

                expect(outputPacket.field).to.eql(inputPacket.field);
            });

            it('should serialize and deserialize Int8 array fields', () => {
                const inputPacket  = new Int8ArrayPacket();
                const outputPacket = new Int8ArrayPacket();

                outputPacket.field = undefined;
                outputPacket.data = inputPacket.data;

                expect(outputPacket.field).to.eql(inputPacket.field);
            });

            it('should serialize and deserialize Int16 array fields', () => {
                const inputPacket  = new Int16ArrayPacket();
                const outputPacket = new Int16ArrayPacket();

                outputPacket.field = undefined;
                outputPacket.data = inputPacket.data;

                expect(outputPacket.field).to.eql(inputPacket.field);
            });

            it('should serialize and deserialize Int32 array fields', () => {
                const inputPacket  = new Int32ArrayPacket();
                const outputPacket = new Int32ArrayPacket();

                outputPacket.field = undefined;
                outputPacket.data = inputPacket.data;

                expect(outputPacket.field).to.eql(inputPacket.field);
            });

            it('should serialize and deserialize object/map fields', () => {
                const inputPacket  = new MapFieldPacket();
                const outputPacket = new MapFieldPacket();

                outputPacket.field = undefined;
                outputPacket.data = inputPacket.data;

                expect(outputPacket.field).to.eql(inputPacket.field);
            });

            it('should serialize and deserialize object/map array fields', () => {
                const inputPacket  = new MapFieldArrayPacket();
                const outputPacket = new MapFieldArrayPacket();

                outputPacket.field = undefined;
                outputPacket.data = inputPacket.data;

                expect(outputPacket.field).to.eql(inputPacket.field);
            });

            it('should serialize and deserialize nested fields', () => {
                const inputPacket  = new NestedPacket();
                const outputPacket = new NestedPacket();

                outputPacket.field = undefined;
                outputPacket.data = inputPacket.data;

                expect(outputPacket.field).to.eql(inputPacket.field);
            });

            it('should serialize and deserialize nested array fields', () => {
                const inputPacket  = new NestedArrayPacket();
                const outputPacket = new NestedArrayPacket();

                outputPacket.field = undefined;
                outputPacket.data = inputPacket.data;

                expect(outputPacket.field).to.eql(inputPacket.field);
            });

            it('should serialize and deserialize multiple complex fields', () => {
                const inputPacket  = new MixedPacket();
                const outputPacket = new MixedPacket();

                Object.keys(outputPacket).forEach(key => {
                    outputPacket[key] = undefined;
                });
                outputPacket.data = inputPacket.data;

                Object.keys(outputPacket).forEach(key => {
                    expect(outputPacket[key]).to.eql(inputPacket[key]);
                });
            });
        });
    });
});
