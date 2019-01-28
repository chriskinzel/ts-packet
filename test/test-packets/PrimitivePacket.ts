import {
    AbstractPacket,
    Int16,
    Int32,
    Int8,
    PacketField,
    UInt16,
    UInt32,
    UInt8,
    UTF8String,
    utf8StringLength
} from '../../dist';

import {testString} from './UTF8StringPacket';

export class PrimitivePacket extends AbstractPacket {
    @PacketField(Int8)   public int8Field   = -0xA;
    @PacketField(UInt8)  public uint8Field  = 0xA;
    @PacketField(Int16)  public int16Field  = -0xABCD >> 1;
    @PacketField(UInt16) public uint16Field = 0xABCD;
    @PacketField(Int32)  public int32Field  = -0xABCDEF01 >> 1;
    @PacketField(UInt32) public uint32Field = 0xABCDEF01;
    @PacketField(UTF8String, utf8StringLength(testString)) public utf8StringField = testString;
    @PacketField(Buffer, 10) public bufferField = Buffer.from([
        0x62,
        0x75,
        0x66,
        0x66,
        0x65,
        0x72,
        0x74,
        0x65,
        0x73,
        0x74
    ]);
}
