'use strict';

const PulseInstr = require('./pulse_instr.js');

module.exports = class PulsePortfolio {
    constructor(portfolio) {
        this.portfolio = portfolio;
        this.instrs = portfolio.instrs.map((instr) => new PulseInstr(instr));
        this.instrs.sort((i1, i2) => i2.avgPctChg - i1.avgPctChg);
    }
    
    get name() {
        return this.portfolio.name;
    }
    
    state() {
        return {name: this.portfolio.name, instrs: this.instrs.map((instr, idx) => instr.state(idx + 1))};
    }
}
