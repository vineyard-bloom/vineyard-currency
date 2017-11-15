import {BigNumber} from 'bignumber.js'
import {Currency} from 'vineyard-blockchain'
import {Collection, Modeler} from "vineyard-ground"

export type Id = string

export type Identity<T> = Id

export type CurrencyId = number

export interface HasId {
  id: string
}

export interface RateSourceEntity {
  id: Id
  name: string
}

export interface NewRate {
  to: CurrencyId
  from: CurrencyId
  value: BigNumber
}

export interface Rate extends NewRate {
  id: Id
  created: Date
}

export interface AdditionalInputFields {
  source: Identity<RateSourceEntity>
}

export type NewInputRate = NewRate & AdditionalInputFields

export type InputRate = Rate & AdditionalInputFields

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

export interface RateSourceOutput {
  value: BigNumber
}

export interface RateSource extends RateSourceEntity {
  readonly id: string

  getRate(): Promise<RateSourceOutput>
}

export interface NewGenericConversion {
  context: string // The uuid of the entity whose fields are being converted.
  input: BigNumber
  rate: BigNumber
  output: BigNumber
}

export interface GenericConversion {
  id: string
  created: Date
}

export interface CurrencyModel {
  Conversion: Collection<GenericConversion>
  InputRate: Collection<InputRate>
  AggregateRate: Collection<AggregateRate>
  RateSource: Collection<RateSourceEntity>

  ground: Modeler
}
