import {PacketField, TypedPacket, UInt8} from '../../../dist';
import {PrimitivePacket} from '../PrimitivePacket';

export class UInt8TypedPacket extends PrimitivePacket implements TypedPacket<UInt8> {
    @PacketField(UInt8) public readonly packetType = 0;
}
