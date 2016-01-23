/*
 * @flow
 */
'use strict';

const _fs = require('fs');

const Portfolio = require('./portfolio.js');
const Printer = require('./printer.js');

const loadPortfolios = () => JSON.parse(_fs.readFileSync(__dirname + '/portfolios.json', 'utf8'));
const buildPortfolios = (portfolios) => portfolios.map((pf) => new Portfolio(pf).init());

Promise.resolve()
    .then(loadPortfolios)
    .then(buildPortfolios)
    .then(Printer.printPulse)
    .catch((err) => console.error(err.stack));
