import {AbstractPacket, Int8, PacketField} from '../../dist';

export class Int8Packet extends AbstractPacket {
    @PacketField(Int8) public field = -0xA;
}
