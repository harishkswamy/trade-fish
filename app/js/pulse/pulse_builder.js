/*
 * @flow
 */
'use strict';

const _fs = require('fs');

const Portfolio = require('../model/portfolio.js');
const PulsePortfolio = require('../model/pulse_portfolio.js');

const loadPortfolios = () => JSON.parse(_fs.readFileSync(__dirname + '/../../portfolios.json', 'utf8'));
const buildPortfolios = (portfolios) => portfolios.map(pf => new Portfolio(pf).init());
const buildPulsePortfolios = (portfolios) => Promise.all(portfolios.map(pfp => pfp.then(pf => new PulsePortfolio(pf))));

const portfolios = Promise.resolve()
    .then(loadPortfolios)
    .then(buildPortfolios)
    .then(buildPulsePortfolios);

module.exports.get = function() {
    return portfolios;
}
