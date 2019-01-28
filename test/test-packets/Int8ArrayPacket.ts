import {AbstractPacket, Int8, PacketField} from '../../dist';

export class Int8ArrayPacket extends AbstractPacket {
    @PacketField([Int8], 2) public field = [-0xA, -0xB];
}
