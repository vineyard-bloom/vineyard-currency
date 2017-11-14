import { BigNumber } from 'bignumber.js';
import { AggregateRate, CurrencyId, GenericConversion, InputRate, NewAggregateRate, NewGenericConversion, NewInputRate, Rate, RateSource } from "./types";
export interface AggregatorResult {
    value: BigNumber;
    success: boolean;
}
export declare type Aggregator = (rates: Rate[]) => Promise<AggregatorResult>;
export interface RateFlow {
    from: string;
    to: string;
    sources: RateSource[];
    aggregator: Aggregator;
}
export declare class CurrencyManager<ConversionSource = any> {
    private model;
    private flows;
    constructor(flows: RateFlow[]);
    getFlow(to: string, from: string): RateFlow | undefined;
    private gatherRates(to, from, sources);
    updateFlow(flow: RateFlow): Promise<AggregateRate>;
    updateAll(): Promise<void>;
    getRateAtTime(time: Date, from: CurrencyId, to: CurrencyId): Promise<Rate | undefined>;
    createInputRate(newRate: NewInputRate): Promise<InputRate>;
    createAggregateRate(newRate: NewAggregateRate): Promise<AggregateRate>;
    getCurrentRate(from: CurrencyId, to: CurrencyId): Promise<Rate | undefined>;
    createConversion<ConversionSource>(conversion: NewGenericConversion<ConversionSource>): Promise<GenericConversion<ConversionSource>>;
    convert(value: BigNumber, from: CurrencyId, to: CurrencyId, time: Date, source: ConversionSource): Promise<GenericConversion<ConversionSource>>;
}
