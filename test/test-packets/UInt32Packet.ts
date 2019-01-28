import {AbstractPacket, PacketField, UInt32} from '../../dist';

export class UInt32Packet extends AbstractPacket {
    @PacketField(UInt32) public field = 0xABCDEF01;
}
