/*
 * @flow
 */
'use strict';

// let _fs = require('fs');
// let Yahoo = require('./yahoo.js');
// let d1 = new Date(2015, 11, 28);
// let d2 = new Date(2015, 11, 29);
// Promise.all(JSON.parse(_fs.readFileSync(__dirname + '/portfolios.1.json', 'utf8')).map((b) => {
//     return b.symbols.reduce((p, s) => {
//         return p.then((basket) => {
//             return Yahoo.data(s).then((q) => {
//                 // _fs.writeFileSync(`${__dirname}/data/${s}.dat`, JSON.stringify(q));
//                 if (q.avgClose > 25000) basket.symbols.push(s);
//                 return basket;
//             });
//         });
//     }, Promise.resolve({name: b.name, symbols: []}));
// })).then((baskets) => console.log(JSON.stringify(baskets)));

// function x(n) {
//     return n * 23;
// }

// x('sd');

let sym = 'EWA,EWC,EWD,EWG,EWH,EWI,EWJ,EWK,EWL,EWM,EWN,EWO,EWP,EWQ,EWS,EWU,EWW,EWT,EWY,EWZ,EZA,IWD,IWN';
let str = sym.split(',').reduce((str, s) => {
    return str + `"${s}",`;
}, '');
console.log(str);
