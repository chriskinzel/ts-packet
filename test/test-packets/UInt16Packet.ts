import {AbstractPacket, PacketField, UInt16} from '../../dist';

export class UInt16Packet extends AbstractPacket {
    @PacketField(UInt16) public field = 0xABCD;
}
