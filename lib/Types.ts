import {AbstractPacket} from './AbstractPacket';

/* tslint:disable:max-classes-per-file */
export class UInt8 extends Number  { public static size = 1; }
export class Int8 extends Number   { public static size = 1; }
export class UInt16 extends Number { public static size = 2; }
export class Int16 extends Number  { public static size = 2; }
export class UInt32 extends Number { public static size = 4; }
export class Int32 extends Number  { public static size = 4; }

export class UTF8String extends String {}

export interface PacketFieldStructureMetadata<T = PacketField> {
    type: Class<T>;
    length?: number;
}

export function isTypeDescendantOfAbstractPacket(type: PacketFieldType | Class<PacketField>): boolean {
    for (let currentPrototype = Object.getPrototypeOf(type);
         currentPrototype !== null;
         currentPrototype = Object.getPrototypeOf(currentPrototype)) {
        if (currentPrototype === AbstractPacket) {
            return true;
        }
    }

    return false;
}

/* tslint:disable:interface-over-type-literal */
export type PacketFieldFixedWidth = UInt8 | Int8 | UInt16 | Int16 | UInt32 | Int32;
export type PacketFieldPrimitive = PacketFieldFixedWidth | UTF8String | Buffer;
export type PacketFieldArray = DistributeArray<PacketFieldFixedWidth> | PacketFieldComplex[] | AbstractPacket[];
export type PacketFieldComplex = { [key: string]: PacketFieldFixedWidth };
export type PacketField = PacketFieldPrimitive | PacketFieldArray | PacketFieldComplex | AbstractPacket;

export type PacketFieldFixedWidthType = Class<PacketFieldFixedWidth>;
export type PacketFieldPrimitiveType = PacketFieldFixedWidthType | Class<UTF8String> | Class<Buffer>;
export type PacketFieldArrayType = [PacketFieldFixedWidthType] | [PacketFieldComplexType] | [Class<AbstractPacket>];
export type PacketFieldComplexType = { [key: string]: PacketFieldFixedWidthType };
export type PacketFieldVariableWidthType = PacketFieldArrayType | Class<Buffer> | Class<UTF8String>;
export type PacketFieldType = PacketFieldPrimitiveType |
    PacketFieldArrayType |
    PacketFieldComplexType |
    Class<AbstractPacket>;

export type PacketFieldPrimitiveTypeToPrimitive<T extends PacketFieldPrimitiveType> = InstanceType<T>;
export type PacketFieldArrayTypeToArray<T extends PacketFieldArrayType> =
    T[0] extends PacketFieldComplexType
        ? PacketFieldComplexTypeToComplex<T[0]>[]
        : (
            T[0] extends (PacketFieldFixedWidthType | Class<AbstractPacket>)
                ? InstanceType<T[0]>[]
                : never);

export type PacketFieldComplexTypeToComplex<T extends PacketFieldComplexType> = {
    [K in keyof T]:
    T[K] extends PacketFieldPrimitiveType
        ? PacketFieldPrimitiveTypeToPrimitive<T[K]>
        : never
};

export type Class<T> = new (...args: any[]) => T;
export type DistributeArray<T> = T extends any ? T[] : never;

export type PropertyDecorator<T> = <K extends string, C extends { [ A in K ]: T }>(target: C, key: K) => void;
export type PacketFieldDecorator<T extends PacketFieldType> =
    T extends PacketFieldPrimitiveType
        ? PropertyDecorator<PacketFieldPrimitiveTypeToPrimitive<T>>
        : (
            T extends PacketFieldArrayType
                ? PropertyDecorator<PacketFieldArrayTypeToArray<T>>
                : (
                    T extends PacketFieldComplexType
                        ? PropertyDecorator<PacketFieldComplexTypeToComplex<T>>
                        : (
                            T extends Class<AbstractPacket>
                                ? PropertyDecorator<AbstractPacket>
                                : never)));

export const PACKET_STRUCTURE_SYMBOL = Symbol('PacketStructure');
export const BUFFER_OFFSET_SYMBOL = Symbol('BufferOffset');
