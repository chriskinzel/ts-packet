import {PacketField, TypedPacket, UInt32} from '../../../dist';
import {PrimitivePacket} from '../PrimitivePacket';

export class UInt32TypedPacket extends PrimitivePacket implements TypedPacket<UInt32> {
    @PacketField(UInt32) public readonly packetType = 2;
}
