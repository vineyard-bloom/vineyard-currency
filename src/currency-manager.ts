import {BigNumber} from 'bignumber.js'
import {CurrencyModel, Rate, RateSource} from "./types";

export class CurrencyManager<ConversionSource = any> {
  private model: CurrencyModel<ConversionSource>
  private sources: RateSource[]

  constructor(sources: RateSource[]) {
    this.sources = sources
  }

  async gatherData(to: string, from: string): Promise<Rate[]> {
    const result:Rate[] = []
    for (let source of this.sources){
      result.push(await source.getRate(to, from))
    }
    return result
  }

  async update(to: string, from: string) {
    const data = this.gatherData(to, from)
  }
}