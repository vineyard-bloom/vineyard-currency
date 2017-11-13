import {BigNumber} from 'bignumber.js'
import {
  AggregateRate,
  CurrencyId, CurrencyModel, GenericConversion, InputRate, NewAggregateRate, NewGenericConversion, NewInputRate, Rate,
  RateSource
} from "./types";

function createRateSql(filter: string = '') {
  return `
    SELECT * FROM aggregate_rates 
    WHERE from = :from AND to = :to ${filter}
    ORDER BY created DESC LIMIT 1
    `
}

const rateAtTimeSql = createRateSql('AND created < :time')
const currentRateSql = createRateSql()

export type Aggregator = (rates: Rate[]) => Promise<NewAggregateRate>

export interface RateFlow {
  from: string
  to: string
  sources: RateSource[]
  aggregator: Aggregator
}

export class CurrencyManager<ConversionSource = any> {
  private model: CurrencyModel<ConversionSource>
  private flows: RateFlow[]

  constructor(flows: RateFlow[]) {
    this.flows = flows
  }

  getFlow(to: string, from: string): RateFlow | undefined {
    return this.flows.filter(f => f.to == to && f.from == from)[0]
  }

  private async gatherRates(sources: RateSource[]): Promise<InputRate[]> {
    const newRates: NewInputRate[] = []
    for (let source of sources) {
      newRates.push(await source.getRate())
    }

    const result: InputRate[] = []
    for (let rate of newRates) {
      result.push(await this.createInputRate(rate))
    }
    return result
  }

  async updateFlow(flow: RateFlow): Promise<AggregateRate> {
    const rates = await this.gatherRates(flow.sources)
    const newRate = await flow.aggregator(rates)
    return this.createAggregateRate(newRate)
  }

  async updateAll() {
    for (let flow of this.flows) {
      await this.updateFlow(flow)
    }
  }

  async getRateAtTime(time: Date, from: CurrencyId, to: CurrencyId): Promise<Rate | undefined> {
    return await this.model.ground.querySingle(rateAtTimeSql, {
      time: time.toISOString(),
      from: from,
      to: to,
    })
  }

  async createInputRate(newRate: NewInputRate): Promise<InputRate> {
    return await this.model.InputRate.create(newRate)
  }

  async createAggregateRate(newRate: NewAggregateRate): Promise<AggregateRate> {
    return await this.model.AggregateRate.create(newRate)
  }

  async getCurrentRate(from: CurrencyId, to: CurrencyId): Promise<Rate | undefined> {
    return await this.model.ground.querySingle(currentRateSql, {
      from: from,
      to: to,
    })
  }

  async createConversion<ConversionSource>(conversion: NewGenericConversion<ConversionSource>) {
    return await this.model.Conversion.create(conversion)
  }

  async convert(value: BigNumber, from: CurrencyId, to: CurrencyId, time: Date, source: ConversionSource): Promise<GenericConversion<ConversionSource>> {
    const rate = await this.getCurrentRate(to, from)
    if (!rate)
      throw new Error("There is no rate data to convert from " + from + " to " + to + ".")

    const newValue = value.times(rate.value)
    return await this.createConversion({
      source: source,
      input: value,
      rate: rate.value,
      output: newValue,
    })
  }
}