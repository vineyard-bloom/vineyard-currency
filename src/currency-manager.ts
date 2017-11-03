import {BigNumber} from 'bignumber.js'
import {CurrencyId, CurrencyModel, GenericConversion, NewGenericConversion, Rate, RateSource} from "./types";

function createRateSql(filter: string = '') {
  return `
    SELECT * FROM currency_rates 
    WHERE from = :from AND to = :to ${filter}
    ORDER BY created DESC LIMIT 1
    `
}

const rateAtTimeSql = createRateSql('AND created < :time')
const currentRateSql = createRateSql()

export class CurrencyManager<ConversionSource = any> {
  private model: CurrencyModel<ConversionSource>
  private sources: RateSource[]

  constructor(sources: RateSource[]) {
    this.sources = sources
  }

  async gatherData(to: CurrencyId, from: CurrencyId): Promise<Rate[]> {
    const result: Rate[] = []
    for (let source of this.sources) {
      result.push(await source.getRate(to, from))
    }
    return result
  }

  async update(to: CurrencyId, from: CurrencyId) {
    const data = await this.gatherData(to, from)
  }

  async getRateAtTime(time: Date, from: CurrencyId, to: CurrencyId): Promise<Rate | undefined> {
    return await this.model.ground.querySingle(rateAtTimeSql, {
      time: time.toISOString(),
      from: from,
      to: to,
    })
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