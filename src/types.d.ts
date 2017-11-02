import { BigNumber } from 'bignumber.js';
import { Currency } from 'vineyard-blockchain';
export declare type Id = string;
export declare type Identity<T> = Id;
export interface RateSource {
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
export interface SingleSourceRate extends Rate {
    source: Identity<RateSource>;
}
export interface SingleSourceRate extends Rate {
    source: Identity<RateSource>;
}
export interface RateSourceRate extends Rate {
    id: Id;
    source: Identity<RateSource>;
}
export interface RateSourceClass extends RateSource {
    getRate(to: string, from: string): Promise<Rate>;
}
