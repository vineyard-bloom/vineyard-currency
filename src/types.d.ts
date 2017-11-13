import { BigNumber } from 'bignumber.js';
import { Currency } from 'vineyard-blockchain';
import { Collection, Modeler } from "vineyard-ground";
export declare type Id = string;
export declare type Identity<T> = Id;
export declare type CurrencyId = string;
export interface HasId {
    id: string;
}
export interface RateSourceEntity {
    id: Id;
    name: string;
}
export interface NewRate {
    to: Identity<Currency>;
    from: Identity<Currency>;
    value: BigNumber;
}
export interface Rate extends NewRate {
    id: Id;
    created: Date;
}
export interface HasSource {
    source: Identity<RateSourceEntity>;
}
export declare type NewInputRate = NewRate & HasSource;
export declare type InputRate = Rate & HasSource;
export interface RateSourceRate {
    target: Identity<Rate>;
    source: Identity<RateSourceEntity>;
}
export interface NewAggregateRate extends NewRate {
    inputs: Identity<RateSourceEntity>[];
}
export interface AggregateRate extends NewRate {
    inputs: Identity<RateSourceEntity>[];
}
export interface RateSource extends RateSourceEntity {
    getRate(): Promise<NewInputRate>;
}
export interface NewGenericConversion<ConversionSource> {
    source: ConversionSource;
    input: BigNumber;
    rate: BigNumber;
    output: BigNumber;
}
export interface GenericConversion<ConversionSource> {
    id: string;
    created: Date;
}
export interface CurrencyModel<ConversionSource = any> {
    Conversion: Collection<GenericConversion<ConversionSource>>;
    InputRate: Collection<InputRate>;
    AggregateRate: Collection<AggregateRate>;
    RateSource: Collection<RateSourceEntity>;
    ground: Modeler;
}
