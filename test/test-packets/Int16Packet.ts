import {AbstractPacket, Int16, PacketField} from '../../dist';

export class Int16Packet extends AbstractPacket {
    @PacketField(Int16) public field = -0xABCD >> 1;
}
