"use strict";

let _fs = require('fs');
let Yahoo = require('./yahoo.js');

let drawLine = () => console.log('----------------------------------------------');

let stripTime = (dt) => new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
let prevDate = (dt) => new Date(dt.getFullYear(), dt.getMonth(), dt.getDate() - 1);
let nextDate = (dt) => new Date(dt.getFullYear(), dt.getMonth(), dt.getDate() + 1);
let lastMarketClose = () => {
    let mktCloseTime = (dt) => {
        dt = stripTime(dt);
        dt.setUTCHours(23);
        return dt;
    };
    let now = new Date(),
        lastClose = stripTime(now),
        mktOpenDay = (dt) => dt.getDay() > 0 && dt.getDay() < 6;

    while (!mktOpenDay(lastClose) || (lastClose = mktCloseTime(lastClose)) > now)
        lastClose = prevDate(lastClose);

    return lastClose;
}
let beforeMarketOpen = (dt) => {
    return dt.getUTCHours() < 13;
}
let QtDate = (q) => q ? q[0] : q;
let QtAdjClose = (q) => q ? q[1] : q;
class Instr {
    constructor(symbol) {
        this.symbol = symbol.toUpperCase();
    }
    
    get dataFilePath() {
        return __dirname + '/data/' + this.symbol;
    }

    set quotes(quotes) {
        this._quotes = quotes;
        this.lastQ = quotes[0];
    }

    get quotes() {
        return this._quotes;
    }

    get lastRefreshed() {
        return _fs.statSync(this.dataFilePath).ctime;
    }

    init() {
        let readQuotes = () => {
            return new Promise((resolve, reject) => {
                _fs.readFile(this.dataFilePath, { encoding: 'utf8' }, (err, data) => {
                    if (err) return reject(err);
                    this.quotes = JSON.parse(data, (key, val) => {
                        return key === '0' && typeof val === 'string' ? new Date(val) : val;
                    });
                    resolve();
                });
            });
        };
        return readQuotes()
            .then(this.refreshQuotes.bind(this))
            .catch(this.refreshQuotes.bind(this));
    }

    refreshQuotes() {
        let writeData = () => {
            return new Promise((resolve, reject) => {
                let quoteStr = JSON.stringify(this._quotes, (k, v) => {
                    return QtDate(v) instanceof Date ? 
                        [QtDate(v).toLocaleDateString('en-US'), QtAdjClose(v)] : v;
                });
                _fs.writeFile(this.dataFilePath, quoteStr, { encoding: 'utf8' }, (err) => {
                    if (err) return reject(err);
                    resolve(this);
                });
            });
        };
        let downloadQuotes = (startDate, endDate) => {
            // endDate = beforeMarketOpen(endDate) ? prevDate(endDate) : endDate;
            return Yahoo.quotes(this.symbol, startDate, endDate, [Yahoo.qtAttrs.date, Yahoo.qtAttrs.adjClose]).then(quotes => {
                if (quotes.length > 0) {
                    this.quotes = this._quotes ? quotes.concat(this._quotes) : quotes;
                    return writeData();
                }
                return this;
            });
        };

        let now = new Date();

        if (this._quotes) {
            return this.lastRefreshed < lastMarketClose() ? 
                downloadQuotes(nextDate(QtDate(this.lastQ)), now) : this;
        }
        let startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());

        return downloadQuotes(startDate, now);
    }

    pctChange(fromDt) {
        let key = fromDt.toDateString();

        if (this._pctChange && this._pctChange[key]) return this._pctChange[key];

        let fromQ = this.quotes.find(q => QtDate(q) <= fromDt) || this.quotes[this.quotes.length - 1];
        this._pctChange = this._pctChange || {};

        return this._pctChange[key] = ((QtAdjClose(this.lastQ) / QtAdjClose(fromQ)) - 1) * 100;
    }

    movingAvg(period) {
        let key = period + '';

        if (this._movAvg && this._movAvg[key]) return this._movAvg[key];

        let cntr = period;
        this._movAvg = this._movAvg || {};

        return this._movAvg[key] = this.quotes.reduce((sum, q) => cntr-- > 0 ? sum + QtAdjClose(q) : sum, 0) / period;
    }
}
class PulseInstr extends Instr {
    constructor(symbol) {
        super(symbol);
    }

    init() {
        return super.init().then(() => {
            let sinceBeforeMos = (dur) => {
                return new Date(new Date().setMonth(new Date().getMonth() - dur));
            }
            this.pctChgMtd = this.pctChange(new Date(new Date().setDate(0)));
            this.pctChg3Mo = this.pctChange(sinceBeforeMos(3));
            this.pctChg6Mo = this.pctChange(sinceBeforeMos(6));
            this.pctChg12Mo = this.pctChange(sinceBeforeMos(12));
            this.ma50 = this.movingAvg(50);
            this.ma100 = this.movingAvg(100);
            this.ma200 = this.movingAvg(200);
            this.avgPctChg = (4 * this.pctChgMtd + 3 * this.pctChg3Mo + 2 * this.pctChg6Mo + this.pctChg12Mo) / 10;
            this.avgMA = (this.ma50 + this.ma100 + this.ma200) / 3;

            return this;
        });
    }
}
class InstrBasket {
    constructor(basketCfg) {
        this.name = basketCfg.name;
        this.instrs = basketCfg.symbols.map(symbol => new PulseInstr(symbol));
    }
    
    init() {
        return Promise.all(this.instrs.map(instr => instr.init()));
    }
    
    printPulse() {
        let padStr = (val, len, left) => {
            val = (val + '').trim();
            return left ?
                Array(len - val.length + 1).join(' ') + val :
                val + Array(len - val.length + 1).join(' ');
        };
        let rpadStr = (val, len) => {
            return padStr(val, len, false);
        };
        let lpadStr = (val, len) => {
            return padStr(val, len, true);
        };
        let writeHead = () => {
            console.log(
                rpadStr('Symbol', 6),
                rpadStr('Rank', 4),
                rpadStr('Last Date', 10),
                lpadStr('Last', 7),
                lpadStr('Avg MA', 7),
                lpadStr('Avg%Chg', 7),
                lpadStr('%ChgMtd', 7),
                lpadStr('%Chg3Mo', 7),
                lpadStr('%Chg6Mo', 7),
                lpadStr('%Chg12Mo', 8)
                );
        };
        let rank = 1;
        let writePulse = instr => {
            let last = QtAdjClose(instr.lastQ),
                avgMA = instr.avgMA;
            console.log(
                rpadStr(instr.symbol, 6),
                rpadStr(last >= avgMA ? rank++ : '', 4),
                rpadStr(QtDate(instr.lastQ).toLocaleDateString('en-US'), 10),
                lpadStr(last.toFixed(2), 7),
                lpadStr(avgMA.toFixed(2), 7),
                lpadStr(instr.avgPctChg.toFixed(2), 7),
                lpadStr(instr.pctChgMtd.toFixed(2), 7),
                lpadStr(instr.pctChg3Mo.toFixed(2), 7),
                lpadStr(instr.pctChg6Mo.toFixed(2), 7),
                lpadStr(instr.pctChg12Mo.toFixed(2), 8)
            );
        };
        return this.init().then(() => {
            this.instrs.sort((i1, i2) => i2.avgPctChg - i1.avgPctChg);
            drawLine();
            console.log(this.name);
            console.log(Array(this.name.length + 1).join('~'));
            writeHead();
            this.instrs.forEach(writePulse);
        });
    }
}
let TradeFish = {
    printPulse() {
        return JSON.parse(_fs.readFileSync(__dirname + '/portfolios.json', 'utf8'))
            .map((b) => new InstrBasket(b))
            .reduce((p, b) => p.then(() => b.printPulse()), Promise.resolve());
    }
};

TradeFish.printPulse()
    .then(drawLine)
    .catch((err) => console.error(err.stack));
