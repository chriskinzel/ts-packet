import {AbstractPacket} from './AbstractPacket';
import {
    BUFFER_OFFSET_SYMBOL, Int16, Int32, Int8,
    isTypeDescendantOfAbstractPacket,
    PacketFieldArrayType,
    PacketFieldComplexType, PacketFieldPrimitive,
    PacketFieldStructureMetadata, UInt16, UInt32, UInt8, UTF8String
} from './Types';

export function readTypedFieldFromBuffer(buffer: Buffer, fieldStructure: PacketFieldStructureMetadata) {
    if (fieldStructure.type instanceof Array) {
        return readTypedArrayFromBuffer(buffer, fieldStructure as any);
    } else if (fieldStructure.type.name === undefined) {
        return readTypedObjectLiteralFromBuffer(buffer, fieldStructure as any);
    } else if (isTypeDescendantOfAbstractPacket(fieldStructure.type)) {
        return readSubpacketFromBuffer(buffer, fieldStructure as any);
    } else {
        return readTypedPrimitiveFromBuffer(buffer, fieldStructure as any);
    }
}

export function readTypedArrayFromBuffer(buffer: Buffer,
                                         fieldStructure: PacketFieldStructureMetadata<PacketFieldArrayType>) {
    return new Array(fieldStructure.length)
        .fill(undefined)
        .map(
            _ => readTypedFieldFromBuffer(buffer, {type: fieldStructure.type[0]})
        );
}

export function readTypedObjectLiteralFromBuffer(buffer: Buffer,
                                                 fieldStructure: PacketFieldStructureMetadata<PacketFieldComplexType>) {
    return Object.assign({}, ...Object.entries(fieldStructure.type).map(
        ([subfield, subfieldStructure]: [string, PacketFieldStructureMetadata]) =>
            ({[subfield]: readTypedFieldFromBuffer(buffer, {type: subfieldStructure} as any)})
    ));
}

export function readSubpacketFromBuffer(buffer: Buffer, fieldStructure: PacketFieldStructureMetadata<AbstractPacket>) {
    const subpacket = new fieldStructure.type();
    const subpacketBuffer = buffer.slice(buffer[BUFFER_OFFSET_SYMBOL]);

    subpacket.data = subpacketBuffer;

    buffer[BUFFER_OFFSET_SYMBOL] += subpacketBuffer[BUFFER_OFFSET_SYMBOL];

    return subpacket;
}

export function readTypedPrimitiveFromBuffer(buffer: Buffer,
                                             fieldStructure: PacketFieldStructureMetadata<PacketFieldPrimitive>) {
    const offset = buffer[BUFFER_OFFSET_SYMBOL];

    switch (fieldStructure.type) {
        case UInt8:
        case Int8:
        case UInt16:
        case Int16:
        case UInt32:
        case Int32:
            buffer[BUFFER_OFFSET_SYMBOL] += (fieldStructure.type as any).size;
            break;

        case UTF8String:
        case Buffer:
            buffer[BUFFER_OFFSET_SYMBOL] += fieldStructure.length;
            break;

        default:
            throw {
                name:        'Packet Field Type Error',
                message:     'Unrecognized fixed width type.'
            };
    }

    switch (fieldStructure.type) {
        case UInt8:
            return buffer.readUInt8(offset);

        case Int8:
            return buffer.readInt8(offset);

        case UInt16:
            return buffer.readUInt16BE(offset);

        case Int16:
            return buffer.readInt16BE(offset);

        case UInt32:
            return buffer.readUInt32BE(offset);

        case Int32:
            return buffer.readInt32BE(offset);

        case UTF8String:
            return buffer.toString('utf8', offset, offset + fieldStructure.length);

        case Buffer:
            return buffer.slice(offset, offset + fieldStructure.length);
    }
}
