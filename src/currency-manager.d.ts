import { BigNumber } from 'bignumber.js';
import { AggregateRate, CurrencyId, GenericConversion, NewAggregateRate, NewGenericConversion, Rate, RateSource } from "./types";
export declare class CurrencyManager<ConversionSource = any> {
    private model;
    private sources;
    constructor(sources: RateSource[]);
    gatherData(to: CurrencyId, from: CurrencyId): Promise<Rate[]>;
    update(to: CurrencyId, from: CurrencyId): Promise<void>;
    getRateAtTime(time: Date, from: CurrencyId, to: CurrencyId): Promise<Rate | undefined>;
    createAggregateRate(newRate: NewAggregateRate): Promise<AggregateRate>;
    getCurrentRate(from: CurrencyId, to: CurrencyId): Promise<Rate | undefined>;
    createConversion<ConversionSource>(conversion: NewGenericConversion<ConversionSource>): Promise<GenericConversion<ConversionSource>>;
    convert(value: BigNumber, from: CurrencyId, to: CurrencyId, time: Date, source: ConversionSource): Promise<GenericConversion<ConversionSource>>;
}
