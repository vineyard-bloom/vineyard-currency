import { BigNumber } from 'bignumber.js';
import { Collection, Modeler } from "vineyard-ground";
export declare type Id = string;
export declare type Identity<T> = Id;
export declare type CurrencyId = number;
export declare type RateSourceId = number;
export interface HasId {
    id: string;
}
export interface RateSourceEntity {
    id: RateSourceId;
    name: string;
}
export interface NewRate {
    to: CurrencyId;
    from: CurrencyId;
    value: BigNumber;
}
export interface Rate extends NewRate {
    id: Id;
    created: Date;
}
export interface AdditionalInputFields {
    source: RateSourceId;
}
export declare type NewInputRate = NewRate & AdditionalInputFields;
export declare type InputRate = Rate & AdditionalInputFields;
export interface RateSourceRate {
    target: Identity<Rate>;
    source: RateSourceId;
}
export interface NewAggregateRate extends NewRate {
    inputs: RateSourceId[];
}
export interface AggregateRate extends NewRate {
    inputs: RateSourceId[];
}
export interface RateSourceOutput {
    value: BigNumber;
}
export interface RateSource extends RateSourceEntity {
    readonly id: RateSourceId;
    getRate(): Promise<RateSourceOutput>;
}
export interface NewGenericConversion {
    context: string;
    input: BigNumber;
    rate?: string;
    rateValue: BigNumber;
    output: BigNumber;
}
export interface GenericConversion extends NewGenericConversion {
    id: string;
    created: Date;
}
export interface CurrencyModel {
    Conversion: Collection<GenericConversion>;
    InputRate: Collection<InputRate>;
    AggregateRate: Collection<AggregateRate>;
    RateSource: Collection<RateSourceEntity>;
    ground: Modeler;
}
