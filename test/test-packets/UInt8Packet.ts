import {AbstractPacket, PacketField, UInt8} from '../../dist';

export class UInt8Packet extends AbstractPacket {
    @PacketField(UInt8) public field = 0xA;
}
