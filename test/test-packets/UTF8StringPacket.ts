import {AbstractPacket, PacketField, UTF8String, utf8StringLength} from '../../dist';

export const testString = 'test😃';

export class UTF8StringPacket extends AbstractPacket {
    @PacketField(UTF8String, utf8StringLength(testString)) public field = testString;
}
