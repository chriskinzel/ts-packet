import {concat, Observable} from 'rxjs';
import {map, toArray} from 'rxjs/operators';
import {AbstractPacket} from './AbstractPacket';
import {readTypedPrimitiveFromBuffer} from './BufferReadUtils';
import {
    BUFFER_OFFSET_SYMBOL,
    isTypeDescendantOfAbstractPacket,
    PacketFieldArrayType,
    PacketFieldComplexType, PacketFieldPrimitive,
    PacketFieldStructureMetadata
} from './Types';
import ReadStream = NodeJS.ReadStream;

export function readTypedFieldFromReadable(readable: ReadStream, fieldStructure: PacketFieldStructureMetadata) {
    if (fieldStructure.type instanceof Array) {
        return readTypedArrayFromReadable(readable, fieldStructure as any);
    } else if (fieldStructure.type.name === undefined) {
        return readTypedObjectLiteralFromReadable(readable, fieldStructure as any);
    } else if (isTypeDescendantOfAbstractPacket(fieldStructure.type)) {
        return readSubpacketFromReadable(readable, fieldStructure as any);
    } else {
        return readTypedPrimitiveFromReadable(readable, fieldStructure as any);
    }
}

export function readTypedArrayFromReadable(readable: ReadStream,
                                           fieldStructure: PacketFieldStructureMetadata<PacketFieldArrayType>) {
    return concat(...new Array(fieldStructure.length)
        .fill(undefined)
        .map(
            _ => readTypedFieldFromReadable(readable, {type: fieldStructure.type[0]})
        )).pipe(toArray());
}

export function readTypedObjectLiteralFromReadable(readable: ReadStream,
                                                   fieldStructure: PacketFieldStructureMetadata<PacketFieldComplexType>
) {
    return concat(...Object.entries(fieldStructure.type)
        .map(
            ([subfield, subfieldStructure]: [string, PacketFieldStructureMetadata]) =>
                readTypedFieldFromReadable(readable, {type: subfieldStructure} as any).pipe(
                    map(value => [subfield, value])
                )
        ))
        .pipe(
            toArray(),
            map(entries => Object.assign({}, ...entries.map( ([k, v]) => ({[k]: v}) )))
        );
}

export function readSubpacketFromReadable(readable: ReadStream,
                                          fieldStructure: PacketFieldStructureMetadata<AbstractPacket>) {
    const subpacket = new fieldStructure.type();
    return subpacket.readFrom(readable);
}

export function readTypedPrimitiveFromReadable(readable: ReadStream,
                                               fieldStructure: PacketFieldStructureMetadata<PacketFieldPrimitive>) {
    return Observable.create(observer => {
        const numberOfRequiredBytes = (fieldStructure.length !== undefined)
            ? fieldStructure.length
            : (fieldStructure.type as any).size;

        let attachedListener = false;

        const listener = () => {
            if (readable.readableLength >= numberOfRequiredBytes) {
                const data = readable.read(numberOfRequiredBytes) as Buffer;
                data[BUFFER_OFFSET_SYMBOL] = 0;

                if (attachedListener) {
                    readable.removeListener('readable', listener);
                }

                observer.next(readTypedPrimitiveFromBuffer(data, fieldStructure));
                observer.complete();
            } else if (!attachedListener) {
                attachedListener = true;
                readable.on('readable', listener);
            }
        };

        listener();
    });
}
