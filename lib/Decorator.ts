import {encode} from 'utf8';
import {
    PACKET_STRUCTURE_SYMBOL,
    PacketFieldDecorator,
    PacketFieldType,
    PacketFieldVariableWidthType
} from './Types';

export function PacketField<T extends PacketFieldType>(fieldType: T,
                                                       ...args: (T extends PacketFieldVariableWidthType
                                                           ? [number | (() => number)]
                                                           : [undefined?])): PacketFieldDecorator<T> {
    const decorator = (target, key) => {
        if (Object.getOwnPropertyDescriptor(target, PACKET_STRUCTURE_SYMBOL) == null) {
            target[PACKET_STRUCTURE_SYMBOL] = {};
        }

        const size = args[0];

        if (size === undefined) {
            target[PACKET_STRUCTURE_SYMBOL][key] = { type: fieldType };
        } else if (typeof size === 'number') {
            target[PACKET_STRUCTURE_SYMBOL][key] = { type: fieldType, length: size };
        } else {
            target[PACKET_STRUCTURE_SYMBOL][key] = {
                type: fieldType,
                get length() { return (size as () => number)(); }
            };
        }

        const parentTarget    = Object.getPrototypeOf(target);
        const parentStructure = parentTarget[PACKET_STRUCTURE_SYMBOL];

        if (parentStructure) {
            Object.assign(target[PACKET_STRUCTURE_SYMBOL], parentStructure, target[PACKET_STRUCTURE_SYMBOL]);
        }
    };

    return decorator as PacketFieldDecorator<T>;
}

export function utf8StringLength(str: string): number {
    return encode(str).length;
}
