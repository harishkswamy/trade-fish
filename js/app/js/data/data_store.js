'use strict';

const _fs = require('fs');
const Yahoo = require('./yahoo.js');
const Quote = require('./quote.js');

const appPath = __dirname + '/../../';
const dataPath = appPath + '/data/';

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
};

const beforeMarketOpen = (dt) => {
    return dt.getUTCHours() < 13;
};

const instrs = {};

const read = (symbol) => {
    return new Promise((resolve, reject) => {
        _fs.readFile(dataPath + symbol, { encoding: 'utf8' }, (err, data) => {
            if (err) return reject(err);
            resolve(this.parse(data));
        });
    });
};

const downloadQuotes = (symbol, startDate, endDate) => {
    const qtAttrs = [
        Yahoo.qtAttrs.date, Yahoo.qtAttrs.open, Yahoo.qtAttrs.high, Yahoo.qtAttrs.low,
        Yahoo.qtAttrs.close, Yahoo.qtAttrs.adjClose, Yahoo.qtAttrs.volume
    ];
    return Yahoo.quotes(symbol, startDate, endDate, qtAttrs).then(quotes => {
        console.log('Downloaded', symbol, startDate, endDate);
        if (quotes.length === 0) return this;
        this.quotes = this._quotes ? quotes.concat(this._quotes) : quotes;
        return this.save(symbol, );
    });
};

const save = (symbol, quotes) => {
    return new Promise((resolve, reject) => {
        _fs.writeFile(dataPath + symbol, Quote.toString(quotes), { encoding: 'utf8' }, (err) => {
            if (err) return reject(err);
            resolve(this);
        });
    });
};

const getQuotes = (symbol, refresh) => {
    const lastRefreshed = _fs.statSync(dataPath + symbol).ctime;
    const now = new Date();
    const startDate = new Date(now.getFullYear() - 5, now.getMonth(), now.getDate());
    return refresh || lastRefreshed < lastMarketClose() ? 
        downloadQuotes(nextDate(Quote.date(this.lastQ)), now) : this;
};

const newInstr = (symbol) => {
    return instrs[symbol] = new Promise((resolve, reject) => {
        
        new Instr(symbol);
    });
};

module.exports = {
    getInstr: function(symbol) {
        return instrs[symbol] || newInstr(symbol);
    }
};
