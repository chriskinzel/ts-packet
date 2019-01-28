import {AbstractPacket, Int32, PacketField} from '../../dist';

export class Int32Packet extends AbstractPacket {
    @PacketField(Int32) public field = -0xABCDEF01 >> 1;
}
