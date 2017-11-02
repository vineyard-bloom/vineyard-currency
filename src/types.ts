import {BigNumber} from 'bignumber.js'
import {Currency} from 'vineyard-blockchain'

export type Id = string

export type Identity<T> = Id

export interface RateSource {
  id: Id
  name: string
}

export interface NewRate {
  to: Identity<Currency>
  from: Identity<Currency>
  value: BigNumber
}

export interface Rate extends NewRate {
  id: Id
  created: Date
}

export interface SingleSourceRate extends Rate {
  source: Identity<RateSource>
}

export interface SingleSourceRate extends Rate {
  source: Identity<RateSource>
}

export interface RateSourceRate extends Rate {
  id: Id
  source: Identity<RateSource>
}

// export interface RateAggregate extends Rate {
// }

// export interface RateAggregateSource {
//   aggregate: Identity<RateAggregate>
//   source: Identity<RateSource>
// }

export interface RateSourceClass extends RateSource {
  getRate(to: string, from: string): Promise<Rate>
}
