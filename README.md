# Vineyard Currency

Currency management and conversion library

## API

### `class CurrencyManager`

#### `convert(value: BigNumber, from: CurrencyId, to: CurrencyId, time: Date, source: ConversionSource))`

Converts a value from one currency to another currency and creates a Conversion record.  Returns a Conversion entity.

