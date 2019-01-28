import {AbstractPacket, PacketField, UInt8} from '../../dist';

export class UInt8ArrayPacket extends AbstractPacket {
    @PacketField([UInt8], 2) public field = [0xA, 0xB];
}
