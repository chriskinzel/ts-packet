import {PacketField, TypedPacket, UInt8} from '../../../dist';
import {MapFieldPacket} from '../MapFieldPacket';

export class UInt8TypedPacket2 extends MapFieldPacket implements TypedPacket<UInt8> {
    @PacketField(UInt8) public readonly packetType = 3;
}
