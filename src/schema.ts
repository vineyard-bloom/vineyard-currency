export interface Trellis {
  primary_keys?: string[]
  properties: any
}

export interface FullSchema {
  Transaction: Trellis
}

export function getFullSchema(): FullSchema {
  return require('./schema.json')
}