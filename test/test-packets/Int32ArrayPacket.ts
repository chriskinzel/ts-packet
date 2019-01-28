import {AbstractPacket, Int32, PacketField} from '../../dist';

export class Int32ArrayPacket extends AbstractPacket {
    @PacketField([Int32], 2) public field = [-0xABCDEF99 >> 1, 0xFFFFFF >> 1];
}
