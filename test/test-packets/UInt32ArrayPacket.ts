import {AbstractPacket, PacketField, UInt32} from '../../dist';

export class UInt32ArrayPacket extends AbstractPacket {
    @PacketField([UInt32], 2) public field = [0xABCDEF99, 0x12345678];
}
