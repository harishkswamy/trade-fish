'use strict';

const Instr = require('./instr.js');
const Quote = require('./quote.js');

module.exports = class Portfolio {
    constructor(portfolioCfg) {
        this.name = portfolioCfg.name;
        this.instrs = portfolioCfg.symbols.map(symbol => new Instr(symbol));
    }
    
    init() {
        return Promise.all(this.instrs.map(instr => instr.init())).then(() => this);
    }    
};
