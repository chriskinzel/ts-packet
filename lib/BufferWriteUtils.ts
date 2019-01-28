import {AbstractPacket} from './AbstractPacket';
import {
    Int16, Int32,
    Int8,
    isTypeDescendantOfAbstractPacket,
    PacketField,
    PacketFieldArray,
    PacketFieldArrayType, PacketFieldComplex, PacketFieldComplexType, PacketFieldPrimitive,
    PacketFieldStructureMetadata, UInt16, UInt32, UInt8, UTF8String
} from './Types';

export function typedFieldToBuffer(field: PacketField, fieldStructure: PacketFieldStructureMetadata): Buffer {
    if (fieldStructure.type instanceof Array) {
        return typedArrayToBuffer(field as any, fieldStructure as any);
    } else if (fieldStructure.type.name === undefined) {
        return typedObjectLiteralToBuffer(field as any, fieldStructure as any);
    } else if (isTypeDescendantOfAbstractPacket(fieldStructure.type)) {
        return subpacketToBuffer(field as any);
    } else {
        return typedPrimitiveToBuffer(field as any, fieldStructure as any);
    }
}

export function typedArrayToBuffer(field: PacketFieldArray,
                                   fieldStructure: PacketFieldStructureMetadata<PacketFieldArrayType>): Buffer {
    return Buffer.concat((field as any).map(typedItem =>
        typedFieldToBuffer(typedItem, {type: fieldStructure.type[0]}))
    );
}

export function typedObjectLiteralToBuffer(field: PacketFieldComplex,
                                           fieldStructure: PacketFieldStructureMetadata<PacketFieldComplexType>
): Buffer {
    return Buffer.concat(Object.entries(fieldStructure.type)
        .map(([subfield, subfieldStructure]: [string, PacketFieldStructureMetadata]) =>
            typedFieldToBuffer(field[subfield], {type: subfieldStructure} as any)
        ));
}

export function subpacketToBuffer(field: AbstractPacket): Buffer {
    return field.data;
}

export function typedPrimitiveToBuffer(field: PacketFieldPrimitive,
                                       fieldStructure: PacketFieldStructureMetadata<PacketFieldPrimitive>): Buffer {
    let buffer;

    switch (fieldStructure.type) {
        case UInt8:
        case Int8:
        case UInt16:
        case Int16:
        case UInt32:
        case Int32:
            buffer = Buffer.allocUnsafe((fieldStructure.type as any).size);
            break;

        case UTF8String:
        case Buffer:
            buffer = Buffer.allocUnsafe(fieldStructure.length);
            break;

        default:
            throw {
                name:        'Packet Field Type Error',
                message:     'Unrecognized fixed width type.'
            };
    }

    switch (fieldStructure.type) {
        case UInt8:
            buffer.writeUInt8(field, 0);
            break;

        case Int8:
            buffer.writeInt8(field, 0);
            break;

        case UInt16:
            buffer.writeUInt16BE(field, 0);
            break;

        case Int16:
            buffer.writeInt16BE(field, 0);
            break;

        case UInt32:
            buffer.writeUInt32BE(field, 0);
            break;

        case Int32:
            buffer.writeInt32BE(field, 0);
            break;

        case UTF8String:
            buffer.write(field);
            break;

        case Buffer:
            (field as Buffer).copy(buffer);
            break;
    }

    return buffer;
}
