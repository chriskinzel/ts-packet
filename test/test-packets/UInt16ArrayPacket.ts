import {AbstractPacket, PacketField, UInt16} from '../../dist';

export class UInt16ArrayPacket extends AbstractPacket {
    @PacketField([UInt16], 2) public field = [0xABCD, 0xCDEF];
}
