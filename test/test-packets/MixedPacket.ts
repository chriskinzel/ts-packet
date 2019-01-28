import {AbstractPacket, Int16, Int32, Int8, PacketField, UInt16, UInt32, UInt8} from '../../dist';
import {NestedPacket} from './NestedPacket';

export class MixedPacket extends AbstractPacket {
    @PacketField([Int8], 2)  public field1 = [-0xA, -0xB];
    @PacketField([Int16], 2) public field2 = [-0xABCD >> 1, 0xEFEF >> 1];
    @PacketField([Int32], 2) public field3 = [-0xABCDEF99 >> 1, 0xFFFFFF >> 1];

    @PacketField([UInt8], 2)  public field4 = [0xA, 0xB];
    @PacketField([UInt16], 2) public field5 = [0xABCD, 0xCDEF];
    @PacketField([UInt32], 2) public field6 = [0xABCDEF99, 0x12345678];

    @PacketField({
        test1: UInt8,
        test2: UInt16,
        test3: UInt32,

        test4: Int8,
        test5: Int16,
        test6: Int32
    }) public field7 = {
        test1: 0xA,
        test2: 0xABCD,
        test3: 0xABCDEF99,

        test4: -0xA,
        test5: -0xFF,
        test6: -0xABCD
    };

    @PacketField([{
        test1: UInt8,
        test2: UInt16,
        test3: UInt32,

        test4: Int8,
        test5: Int16,
        test6: Int32
    }], 2) public field8 = [
        {
            test1: 0xA,
            test2: 0xABCD,
            test3: 0xABCDEF99,

            test4: -0xA,
            test5: -0xFF,
            test6: -0xABCD
        },
        {
            test1: 0xB,
            test2: 0xBCDE,
            test3: 0xBCDEF99A,

            test4: -0xB,
            test5: -0xEE,
            test6: -0xBCDE
        }
    ];

    @PacketField(NestedPacket)      public field9  = new NestedPacket();
    @PacketField([NestedPacket], 2) public field10 = [new NestedPacket(), new NestedPacket()];
}
