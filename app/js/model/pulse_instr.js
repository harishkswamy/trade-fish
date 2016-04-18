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
    }

    get symbol() {
        return this.instr.symbol;
    }
    
    get lastQ() {
        return this.instr.lastQ;
    }
    
    state(rank) {
        return {
            symbol: this.symbol,
            rank: rank,
            lastDate: Quote.date(this.lastQ),
            lastPrice: Quote.adjClose(this.lastQ),
            pctChgYtd: this.pctChgYtd,
            pctChgMtd: this.pctChgMtd,
            pctChg1Mo: this.pctChg1Mo,
            pctChg3Mo: this.pctChg3Mo,
            pctChg6Mo: this.pctChg6Mo,
            pctChg12Mo: this.pctChg12Mo,
            avgPctChg: this.avgPctChg,
            ma50: this.ma50,
            ma100: this.ma100,
            ma200: this.ma200,
            avgMa: this.avgMa
        };
    }
}
