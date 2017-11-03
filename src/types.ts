import {BigNumber} from 'bignumber.js'
import {Currency} from 'vineyard-blockchain'
import {Collection, Modeler} from "vineyard-ground"

export type Id = string

export type Identity<T> = Id

export type CurrencyId = string

export interface HasId {
  id: string
}

export interface RateSourceEntity {
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

export interface HasSource {
  source: Identity<RateSourceEntity>
}

export type NewSingleSourceRate = NewRate & HasSource

export type SingleSourceRate = Rate & HasSource

export interface RateSourceRate {
  target: Identity<Rate>
  source: Identity<RateSourceEntity>
}

export interface NewAggregateRate extends NewRate {
  inputs: Identity<RateSourceEntity>[]
}

export interface AggregateRate extends NewRate {
  inputs: Identity<RateSourceEntity>[]
}

export interface RateSource extends RateSourceEntity {
  getRate(to: string, from: string): Promise<Rate>
}

export interface NewGenericConversion<ConversionSource> {
  source: ConversionSource
  input: BigNumber
  rate: BigNumber
  output: BigNumber
}

export interface GenericConversion<ConversionSource> {
  id: string
  created: Date
}

export interface CurrencyModel<ConversionSource = any> {
  Conversion: Collection<GenericConversion<ConversionSource>>
  InputRate: Collection<SingleSourceRate>
  AggregateRate: Collection<AggregateRate>
  RateSource: Collection<RateSourceEntity>

  ground: Modeler
}
