export interface Trellis {
  primary_keys?: string[]
  properties: any
}

export interface FullSchema {
  Transaction: Trellis
}

export function getFullCurrencySchema (): FullSchema {
  return require('./schema.json')
}
