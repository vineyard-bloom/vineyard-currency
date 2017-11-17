import {BigNumber} from 'bignumber.js'
import {
  AggregateRate,
  CurrencyId, CurrencyModel, GenericConversion, InputRate, NewAggregateRate, NewGenericConversion, NewInputRate, Rate,
  RateSource
} from "./types";

function createRateSql(filter: string = '') {
  console.error("Should not be used in production, filter needs to be fixed")
  return `
    SELECT * FROM aggregate_rates 
    WHERE aggregate_rates.from = :from AND aggregate_rates.to = :to ${filter}
    ORDER BY created DESC LIMIT 1
    `
}

const rateAtTimeSql = createRateSql('AND created <= :time')
const currentRateSql = createRateSql()

export interface AggregatorResult {
  value: BigNumber
  success: boolean
}

export type Aggregator = (rates: Rate[]) => Promise<AggregatorResult>

export interface RateFlow {
  from: CurrencyId
  to: CurrencyId
  sources: RateSource[]
  aggregator: Aggregator
}

export class CurrencyManager<ConversionSource = any> {
  private model: CurrencyModel
  private flows: RateFlow[]

  constructor(flows: RateFlow[], model: CurrencyModel) {
    this.flows = flows
    this.model = model
  }

  getFlow(to: CurrencyId, from: CurrencyId): RateFlow | undefined {
    return this.flows.filter(f => f.to == to && f.from == from)[0]
  }

  private async gatherRates(to: CurrencyId, from: CurrencyId, sources: RateSource[]): Promise<InputRate[]> {
    const newRates: NewInputRate[] = []
    for (let source of sources) {
      try {
        const output = await source.getRate()
        newRates.push({
          to: to,
          from: from,
          source: source.id,
          value: output.value
        })
      }
      catch (error) {
        console.error("Error gathering rate from", source.name, to, '->', from, error)
      }
    }

    const result: InputRate[] = []
    for (let rate of newRates) {
      result.push(await this.createInputRate(rate))
    }
    return result
  }

  async updateFlow(flow: RateFlow): Promise<AggregateRate | undefined> {
    const rates = await this.gatherRates(flow.to, flow.from, flow.sources)
    const result = await flow.aggregator(rates)
    if (result.success) {
      const newRate = {
        value: result.value,
        from: flow.from,
        to: flow.to,
        inputs: rates.map(r => r.source)
      }
      return this.createAggregateRate(newRate)
    }
    else {
      console.error('Error processing user-info')
    }
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
    newRate.inputs = []
    return await this.model.AggregateRate.create(newRate)
  }

  async getCurrentRate(from: CurrencyId, to: CurrencyId): Promise<Rate | undefined> {
    return await this.model.ground.querySingle(currentRateSql, {
      from: from,
      to: to,
    })
  }

  async createConversion<ConversionSource>(conversion: NewGenericConversion) {
    return await this.model.Conversion.create(conversion)
  }

  async convert(inputValue: BigNumber, from: CurrencyId, to: CurrencyId, time: Date, context: string): Promise<GenericConversion> {
    const rate = await this.getRateAtTime(time, from, to)
    if (!rate)
      throw new Error("There is no rate data to convert from " + from + " to " + to + ".")

    const newValue = inputValue.times(rate.value)
    return await this.createConversion({
      context: context,
      input: inputValue,
      rate: rate.id,
      rateValue: rate.value,
      output: newValue,
    })
  }
}