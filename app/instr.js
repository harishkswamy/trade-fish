'use strict';

const _fs = require('fs');
const Yahoo = require('./yahoo.js');
const Quote = require('./quote.js');

const stripTime = (dt) => new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
const prevDate = (dt) => new Date(dt.getFullYear(), dt.getMonth(), dt.getDate() - 1);
const nextDate = (dt) => new Date(dt.getFullYear(), dt.getMonth(), dt.getDate() + 1);

const lastMarketClose = () => {
    const mktCloseTime = (dt) => {
        dt = stripTime(dt);
        dt.setUTCHours(23);
        return dt;
    };
    const now = new Date(),
        mktOpenDay = (dt) => dt.getDay() > 0 && dt.getDay() < 6;

    let lastClose = stripTime(now);

    while (!mktOpenDay(lastClose) || (lastClose = mktCloseTime(lastClose)) > now)
        lastClose = prevDate(lastClose);

    return lastClose;
}

const beforeMarketOpen = (dt) => {
    return dt.getUTCHours() < 13;
}

module.exports = class Instr {
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
        const readQuotes = () => {
            return new Promise((resolve, reject) => {
                _fs.readFile(this.dataFilePath, { encoding: 'utf8' }, (err, data) => {
                    if (err) return reject(err);
                    this.quotes = Quote.parse(data);
                    resolve();
                });
            });
        };
        return readQuotes()
            .then(this.refreshQuotes.bind(this))
            .catch(this.refreshQuotes.bind(this));
    }

    refreshQuotes() {
        const saveData = () => {
            return new Promise((resolve, reject) => {
                _fs.writeFile(this.dataFilePath, Quote.toString(this._quotes), { encoding: 'utf8' }, (err) => {
                    if (err) return reject(err);
                    resolve(this);
                });
            });
        };
        const downloadQuotes = (startDate, endDate) => {
            // endDate = beforeMarketOpen(endDate) ? prevDate(endDate) : endDate;
            return Yahoo.quotes(this.symbol, startDate, endDate, [Yahoo.qtAttrs.date, Yahoo.qtAttrs.adjClose]).then(quotes => {
                if (quotes.length === 0) return this;
                this.quotes = this._quotes ? quotes.concat(this._quotes) : quotes;
                return saveData();
            });
        };

        const now = new Date();

        if (this._quotes) {
            return this.lastRefreshed < lastMarketClose() ? 
                downloadQuotes(nextDate(Quote.date(this.lastQ)), now) : this;
        }
        const startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());

        return downloadQuotes(startDate, now);
    }

    pctChange(fromDt, toDt) {
        toDt = toDt || new Date();
        const key = fromDt.toDateString() + toDt.toDateString();

        if (this._pctChange && this._pctChange[key]) return this._pctChange[key];

        const fromQ = this.quotes.find(q => Quote.date(q) <= fromDt) || this.quotes[this.quotes.length - 1];
        this._pctChange = this._pctChange || {};

        return this._pctChange[key] = ((Quote.adjClose(this.lastQ) / Quote.adjClose(fromQ)) - 1) * 100;
    }

    movingAvg(period) {
        const key = period + '';

        if (this._movAvg && this._movAvg[key]) return this._movAvg[key];

        let cntr = period;
        this._movAvg = this._movAvg || {};

        return this._movAvg[key] = this.quotes.reduce((sum, q) => cntr-- > 0 ? sum + Quote.adjClose(q) : sum, 0) / period;
    }
};
