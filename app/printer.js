'use strict';

const Quote = require('./quote.js');
const StrUtils = require('./str_utils.js');

const printLine = () => console.log('----------------------------------------------');

class PulseInstr {
    constructor(instr) {
        this.instr = instr;
        const lastMonths = (dur) => {
            return new Date(new Date().setMonth(new Date().getMonth() - dur));
        }
        this.pctChgMtd = this.instr.pctChange(new Date(new Date().setDate(0)));
        this.pctChg3Mo = this.instr.pctChange(lastMonths(3));
        this.pctChg6Mo = this.instr.pctChange(lastMonths(6));
        this.pctChg12Mo = this.instr.pctChange(lastMonths(12));
        this.avgPctChg = (4 * this.pctChgMtd + 3 * this.pctChg3Mo + 2 * this.pctChg6Mo + this.pctChg12Mo) / 10;
        this.ma50 = this.instr.movingAvg(50);
        this.ma100 = this.instr.movingAvg(100);
        this.ma200 = this.instr.movingAvg(200);
        this.avgMA = (this.ma50 + this.ma100 + this.ma200) / 3;
    }
    
    static printHead() {
        console.log(
            StrUtils.rpad('Symbol', 6),
            StrUtils.rpad('Rank', 4),
            StrUtils.rpad('Last Date', 10),
            StrUtils.lpad('Last', 7),
            StrUtils.lpad('Avg MA', 7),
            StrUtils.lpad('Avg%Chg', 7),
            StrUtils.lpad('%ChgMtd', 7),
            StrUtils.lpad('%Chg3Mo', 7),
            StrUtils.lpad('%Chg6Mo', 7),
            StrUtils.lpad('%Chg12Mo', 8)
        );
    }

    printPulse(rank) {
        const lastP = Quote.adjClose(this.instr.lastQ);

        console.log(
            StrUtils.rpad(this.instr.symbol, 6),
            StrUtils.rpad(lastP >= this.avgMA ? rank : '', 4),
            StrUtils.rpad(Quote.date(this.instr.lastQ).toLocaleDateString('en-US'), 10),
            StrUtils.lpad(lastP.toFixed(2), 7),
            StrUtils.lpad(this.avgMA.toFixed(2), 7),
            StrUtils.lpad(this.avgPctChg.toFixed(2), 7),
            StrUtils.lpad(this.pctChgMtd.toFixed(2), 7),
            StrUtils.lpad(this.pctChg3Mo.toFixed(2), 7),
            StrUtils.lpad(this.pctChg6Mo.toFixed(2), 7),
            StrUtils.lpad(this.pctChg12Mo.toFixed(2), 8)
        );
    }
}

module.exports = {
    printPulse: function(portfolios) {
        const printPortfoioPulse = (portfolio) => {
            const pulseInstrs = portfolio.instrs.map((instr) => new PulseInstr(instr));
            pulseInstrs.sort((i1, i2) => i2.avgPctChg - i1.avgPctChg);

            printLine();

            console.log(portfolio.name);
            console.log(Array(portfolio.name.length + 1).join('~'));

            PulseInstr.printHead();
            pulseInstrs.forEach((pInstr, idx) => pInstr.printPulse(idx + 1));
        }
        
        return portfolios.reduce((p, pfp) => p.then(() => pfp.then((pf) => printPortfoioPulse(pf))), Promise.resolve())
    }
};
