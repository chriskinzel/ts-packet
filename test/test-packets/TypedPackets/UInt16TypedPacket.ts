import {PacketField, TypedPacket, UInt16} from '../../../dist';
import {PrimitivePacket} from '../PrimitivePacket';

export class UInt16TypedPacket extends PrimitivePacket implements TypedPacket<UInt16> {
    @PacketField(UInt16) public readonly packetType = 1;
}
