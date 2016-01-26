'use strict';

const PulseBuilder = require('./pulse_builder.js');
const Quote = require('../model/quote.js');
const StrUtils = require('../utils/str_utils.js');

const printLine = () => console.log('----------------------------------------------');

const printHead = () => {
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
const printPulse = (instr) => {
    console.log(
        StrUtils.rpad(instr.symbol, 6),
        StrUtils.rpad(instr.lastPrice >= instr.avgMa ? instr.rank : '', 4),
        StrUtils.rpad(instr.lastDate.toLocaleDateString('en-US'), 10),
        StrUtils.lpad(instr.lastPrice.toFixed(2), 7),
        StrUtils.lpad(instr.avgMa.toFixed(2), 7),
        StrUtils.lpad(instr.avgPctChg.toFixed(2), 7),
        StrUtils.lpad(instr.pctChgMtd.toFixed(2), 7),
        StrUtils.lpad(instr.pctChg3Mo.toFixed(2), 7),
        StrUtils.lpad(instr.pctChg6Mo.toFixed(2), 7),
        StrUtils.lpad(instr.pctChg12Mo.toFixed(2), 8)
    );
}
const printPortfoioPulse = (portfolio) => {
    printLine();

    console.log(portfolio.name);
    console.log(Array(portfolio.name.length + 1).join('~'));

    printHead();
    portfolio.instrs.forEach(instr => printPulse(instr));
}
const print = portfolios => portfolios.map(p => printPortfoioPulse(p.state()));

PulseBuilder.build()
    .then(print)
    .catch((err) => console.error(err.stack));
