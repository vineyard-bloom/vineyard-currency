import { getFullCurrencySchema } from '../../src/schema'

require('source-map-support').install()
import { assert, expect } from 'chai'
import { DevModeler, SequelizeClient, DatabaseClient } from 'vineyard-ground'
import { getFullBlockchainSchema } from 'vineyard-blockchain'
import { BigNumber } from 'bignumber.js'
import { CurrencyModel, Rate, CurrencyManager, RateFlow } from '../../src'

const config = require('../config/config.json')

const databaseClient = new SequelizeClient(config.database)

const additionalSchema = {}

enum CurrencyType {
  btc = 1,
  eth = 2,
  usd = 3,
  vinecoin = 4
}

enum RateSourceType {
  fake1 = 10,
  fake2 = 11
}

async function createGeneralModel (client: DatabaseClient) {
  const modeler = new DevModeler(Object.assign({}, getFullCurrencySchema(), getFullBlockchainSchema(), additionalSchema), client)
  const model: any = modeler.collections
  model.ground = modeler

  await modeler.regenerate()

  return model
}

const fake1 = {
  id: RateSourceType.fake1,
  name: 'Fake 1',
  getRate: () => Promise.resolve({
    value: new BigNumber(0.5),
    volume: new BigNumber(500)
  })
}

const fake2 = {
  id: RateSourceType.fake2,
  name: 'Fake 2',
  getRate: () => Promise.resolve({
    value: new BigNumber(0.75),
    volume: new BigNumber(500)
  })
}

function mainAggregator (rates: Rate[]) {

  return Promise.resolve({
    value: new BigNumber(0.5),
    volume: new BigNumber(1000),
    success: true
  })
}

function createFlows (): RateFlow[] {
  return [
    {
      from: CurrencyType.btc,
      to: CurrencyType.usd,
      sources: [
        fake1,
        fake2
      ],
      aggregator: mainAggregator
    },
    {
      from: CurrencyType.eth,
      to: CurrencyType.usd,
      sources: [
        fake1,
        fake2
      ],
      aggregator: mainAggregator
    }
  ]
}

describe('currency-test', function () {
  let server: any
  this.timeout(9000)

  it('full', async function () {
    const model = await createGeneralModel(databaseClient) as CurrencyModel
    const flows: RateFlow[] = createFlows()
    const currencyManager = new CurrencyManager(flows, model)

    await currencyManager.updateAll()
    let aggregateRates = await model.AggregateRate.all()
    assert.equal(aggregateRates.length, 2)

    await currencyManager.updateAll()
    aggregateRates = await model.AggregateRate.all()
    assert.equal(aggregateRates.length, 4)

    let conversion = await currencyManager.convert(new BigNumber(3), CurrencyType.btc, CurrencyType.usd, new Date(),
      '11100000-0000-0000-0000-000000000000')

    const c = await model.Conversion.all()
    assert.equal(c.length, 1)
    assert.equal(c[0].output.toNumber(), 1.5)
  })
})
