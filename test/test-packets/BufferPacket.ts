import {AbstractPacket, PacketField} from '../../dist';

export class BufferPacket extends AbstractPacket {
    @PacketField(Buffer, 10) public field = Buffer.from([0x62, 0x75, 0x66, 0x66, 0x65, 0x72, 0x74, 0x65, 0x73, 0x74]);
}
