"use strict";

let _fs = require('fs');
let Yahoo = require('./yahoo.js');

function widdle() {
    Promise.all(JSON.parse(_fs.readFileSync(__dirname + '/portfolios.1.json', 'utf8')).map((b) => {
        return b.symbols.reduce((p, s) => {
            return p.then((basket) => {
                return Yahoo.data(s).then((q) => {
                    if (q.avgClose > 25000) basket.symbols.push(s);
                    return basket;
                });
            });
        }, Promise.resolve({name: b.name, symbols: []}));
    })).then((baskets) => console.log(baskets));
}
