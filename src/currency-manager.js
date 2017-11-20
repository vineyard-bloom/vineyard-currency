"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
function createRateSql(filter) {
    if (filter === void 0) { filter = ''; }
    console.error("Should not be used in production, filter needs to be fixed");
    return "\n    SELECT * FROM aggregate_rates \n    WHERE aggregate_rates.from = :from AND aggregate_rates.to = :to " + filter + "\n    ORDER BY created DESC LIMIT 1\n    ";
}
var rateAtTimeSql = createRateSql('AND created <= :time');
var currentRateSql = createRateSql();
var CurrencyManager = /** @class */ (function () {
    function CurrencyManager(flows, model) {
        this.flows = flows;
        this.model = model;
    }
    CurrencyManager.prototype.getFlow = function (from, to) {
        return this.flows.filter(function (f) { return f.to == to && f.from == from; })[0];
    };
    CurrencyManager.prototype.gatherRates = function (to, from, sources) {
        return __awaiter(this, void 0, void 0, function () {
            var newRates, _i, sources_1, source, output, error_1, result, _a, newRates_1, rate, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        newRates = [];
                        _i = 0, sources_1 = sources;
                        _d.label = 1;
                    case 1:
                        if (!(_i < sources_1.length)) return [3 /*break*/, 6];
                        source = sources_1[_i];
                        _d.label = 2;
                    case 2:
                        _d.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, source.getRate()];
                    case 3:
                        output = _d.sent();
                        newRates.push({
                            to: to,
                            from: from,
                            source: source.id,
                            value: output.value
                        });
                        return [3 /*break*/, 5];
                    case 4:
                        error_1 = _d.sent();
                        console.error("Error gathering rate from", source.name, to, '->', from, error_1);
                        return [3 /*break*/, 5];
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6:
                        result = [];
                        _a = 0, newRates_1 = newRates;
                        _d.label = 7;
                    case 7:
                        if (!(_a < newRates_1.length)) return [3 /*break*/, 10];
                        rate = newRates_1[_a];
                        _c = (_b = result).push;
                        return [4 /*yield*/, this.createInputRate(rate)];
                    case 8:
                        _c.apply(_b, [_d.sent()]);
                        _d.label = 9;
                    case 9:
                        _a++;
                        return [3 /*break*/, 7];
                    case 10: return [2 /*return*/, result];
                }
            });
        });
    };
    CurrencyManager.prototype.updateFlow = function (flow) {
        return __awaiter(this, void 0, void 0, function () {
            var rates, result, newRate;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.gatherRates(flow.to, flow.from, flow.sources)];
                    case 1:
                        rates = _a.sent();
                        return [4 /*yield*/, flow.aggregator(rates)];
                    case 2:
                        result = _a.sent();
                        if (result.success) {
                            newRate = {
                                value: result.value,
                                from: flow.from,
                                to: flow.to,
                                inputs: rates.map(function (r) { return r.source; })
                            };
                            return [2 /*return*/, this.createAggregateRate(newRate)];
                        }
                        else {
                            console.error('Error processing user-info');
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    CurrencyManager.prototype.updateAll = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, flow;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _i = 0, _a = this.flows;
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        flow = _a[_i];
                        return [4 /*yield*/, this.updateFlow(flow)];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    CurrencyManager.prototype.getRateAtTime = function (time, from, to) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.model.ground.querySingle(rateAtTimeSql, {
                            time: time.toISOString(),
                            from: from,
                            to: to,
                        })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    CurrencyManager.prototype.createInputRate = function (newRate) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.model.InputRate.create(newRate)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    CurrencyManager.prototype.createAggregateRate = function (newRate) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        newRate.inputs = [];
                        return [4 /*yield*/, this.model.AggregateRate.create(newRate)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    CurrencyManager.prototype.getCurrentRate = function (from, to) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.model.ground.querySingle(currentRateSql, {
                            from: from,
                            to: to,
                        })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    CurrencyManager.prototype.createConversion = function (conversion) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.model.Conversion.create(conversion)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    CurrencyManager.prototype.convert = function (inputValue, from, to, time, context) {
        return __awaiter(this, void 0, void 0, function () {
            var rate, newValue;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getRateAtTime(time, from, to)];
                    case 1:
                        rate = _a.sent();
                        if (!rate)
                            throw new Error("There is no rate data to convert from " + from + " to " + to + ".");
                        newValue = inputValue.times(rate.value);
                        return [4 /*yield*/, this.createConversion({
                                context: context,
                                input: inputValue,
                                rate: rate.id,
                                rateValue: rate.value,
                                output: newValue,
                            })];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    return CurrencyManager;
}());
exports.CurrencyManager = CurrencyManager;
//# sourceMappingURL=currency-manager.js.map