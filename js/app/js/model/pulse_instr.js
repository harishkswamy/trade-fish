'use strict';

const Quote = require('./quote.js');

module.exports = class PulseInstr {
    constructor(instr) {
        this.instr = instr;
        const lastMonths = (dur) => {
            return new Date(new Date().setMonth(new Date().getMonth() - dur));
        }
        const dt = new Date();
        this.pctChgYtd = this.instr.pctChange(new Date(dt.getFullYear() - 1 , 11, 31));
        this.pctChgMtd = this.instr.pctChange(new Date(new Date().setDate(0)));
        this.pctChg1Mo = this.instr.pctChange(lastMonths(1));
        this.pctChg3Mo = this.instr.pctChange(lastMonths(3));
        this.pctChg6Mo = this.instr.pctChange(lastMonths(6));
        this.pctChg12Mo = this.instr.pctChange(lastMonths(12));
        this.avgPctChg = (4 * this.pctChg1Mo + 3 * this.pctChg3Mo + 2 * this.pctChg6Mo + this.pctChg12Mo) / 10;
        this.ma50 = this.instr.movingAvg(50);
        this.ma100 = this.instr.movingAvg(100);
        this.ma200 = this.instr.movingAvg(200);
        this.avgMa = (this.ma50 + this.ma100 + this.ma200) / 3;
        this.rsi2 = this.instr.rsi(2);
    }

    get symbol() {
        return this.instr.symbol;
    }
    
    get lastQ() {
        return this.instr.lastQ;
    }
    
    state(rank) {
        var lastPrice = Quote.adjClose(this.lastQ);
        return {
            symbol: this.symbol,
            rank: rank,
            lastDate: Quote.date(this.lastQ),
            lastPrice: lastPrice || 0,
            rsi2: this.rsi2 || 0,
            pctChgYtd: this.pctChgYtd || 0,
            pctChgMtd: this.pctChgMtd || 0,
            pctChg1Mo: this.pctChg1Mo || 0,
            pctChg3Mo: this.pctChg3Mo || 0,
            pctChg6Mo: this.pctChg6Mo || 0,
            pctChg12Mo: this.pctChg12Mo || 0,
            avgPctChg: this.avgPctChg || 0,
            ma50: this.ma50 || 0,
            ma100: this.ma100 || 0,
            ma200: this.ma200 || 0,
            avgMa: this.avgMa || 0,
            avgMaH: (Math.abs(lastPrice - this.avgMa) / this.avgMa) <= 0.01 ? 'numeric highlight' : 'numeric',
            rsiH: this.rsi2 < 11 ? 'numeric highlight' : 'numeric'
        };
    }
}
