import {AbstractPacket, Int16, PacketField} from '../../dist';

export class Int16ArrayPacket extends AbstractPacket {
    @PacketField([Int16], 2) public field = [-0xABCD >> 1, 0xEFEF >> 1];
}
