import { Rate, RateSource } from "./types";
export declare class CurrencyManager<ConversionSource = any> {
    private model;
    private sources;
    constructor(sources: RateSource[]);
    gatherData(to: string, from: string): Promise<Rate[]>;
    update(to: string, from: string): Promise<void>;
}
