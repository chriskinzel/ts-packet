import {AbstractPacket, Int16, Int32, Int8, PacketField, UInt16, UInt32, UInt8} from '../../dist';

export class MapFieldArrayPacket extends AbstractPacket {
    @PacketField([{
        test1: UInt8,
        test2: UInt16,
        test3: UInt32,

        test4: Int8,
        test5: Int16,
        test6: Int32
    }], 2) public field = [
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
}
