import { BigNumber } from 'bignumber.js';
import { AggregateRate, CurrencyId, CurrencyModel, GenericConversion, InputRate, NewAggregateRate, NewGenericConversion, NewInputRate, Rate, RateSource } from './types';
export interface AggregatorResult {
    value: BigNumber;
    volume: BigNumber;
    success: boolean;
}
export declare type Aggregator = (rates: Rate[]) => Promise<AggregatorResult>;
export interface RateFlow {
    from: CurrencyId;
    to: CurrencyId;
    sources: RateSource[];
    aggregator: Aggregator;
}
export declare class CurrencyManager<ConversionSource = any> {
    private model;
    private flows;
    constructor(flows: RateFlow[], model: CurrencyModel);
    getFlow(from: CurrencyId, to: CurrencyId): RateFlow | undefined;
    updateFlow(flow: RateFlow): Promise<AggregateRate | undefined>;
    updateAll(): Promise<void>;
    getRateAtTime(time: Date, from: CurrencyId, to: CurrencyId): Promise<Rate | undefined>;
    createInputRate(newRate: NewInputRate): Promise<InputRate>;
    createAggregateRate(newRate: NewAggregateRate): Promise<AggregateRate>;
    getCurrentRate(from: CurrencyId, to: CurrencyId): Promise<Rate | undefined>;
    createConversion<ConversionSource>(conversion: NewGenericConversion): Promise<GenericConversion>;
    convert(inputValue: BigNumber, from: CurrencyId, to: CurrencyId, time: Date, context: string): Promise<GenericConversion>;
    private gatherRates(to, from, sources);
}
