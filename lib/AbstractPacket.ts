import WritableStream = NodeJS.WritableStream;
import ReadStream = NodeJS.ReadStream;

import {concat, Observable} from 'rxjs';
import {map, shareReplay, toArray} from 'rxjs/operators';
import {readTypedFieldFromBuffer} from './BufferReadUtils';
import {typedFieldToBuffer} from './BufferWriteUtils';
import {runImmediately} from './custom-rxjs';
import {readTypedFieldFromReadable} from './ReadableReadUtils';
import {BUFFER_OFFSET_SYMBOL, PACKET_STRUCTURE_SYMBOL, PacketFieldStructureMetadata} from './Types';

export abstract class AbstractPacket {

    public writeTo(writable: WritableStream): Observable<void> {
        return Observable.create(observer => {
            const write = () => {
                writable.write(this.data, error => {
                    if (error === undefined || error === null) {
                        observer.next();
                        observer.complete();
                    } else {
                        observer.error(error);
                    }
                });
            };

            if (writable.writable) {
                write();
            } else {
                writable.once('drain', write);
            }
        }).pipe(shareReplay(), runImmediately());
    }

    public readFrom(readable: ReadStream): Observable<this> {
        return concat(...
            Object.entries(this.structureMetadata)
                .map(([field, fieldStructure]: [string, PacketFieldStructureMetadata]) =>
                    readTypedFieldFromReadable(readable, fieldStructure).pipe(
                        map(value => [field, value])
                    )
                ))
            .pipe(
                toArray(),
                map(entries => Object.assign(this, ...entries.map( ([k, v]) => ({[k]: v}) )))
            );
    }

    public set data(data: Buffer) {
        data[BUFFER_OFFSET_SYMBOL] = 0;

        Object.entries(this.structureMetadata)
            .forEach(([field, fieldStructure]: [string, PacketFieldStructureMetadata]) => {
                this[field] = readTypedFieldFromBuffer(data, fieldStructure);
            });
    }

    public get data(): Buffer {
        return Buffer.concat(Object.entries(this.structureMetadata)
            .map(([field, fieldStructure]: [string, PacketFieldStructureMetadata]) =>
                typedFieldToBuffer(this[field], fieldStructure)
            ));
    }

    private get structureMetadata() {
        return Object.getPrototypeOf(this)[PACKET_STRUCTURE_SYMBOL];
    }
}
