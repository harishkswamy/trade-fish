/*
 * @flow
 */
'use strict';

let _http = require('http');
let Http = {
    get: function (opts) {
        return new Promise((resolve, reject) => {
            try {
                var data = '';
                let req = _http.request(opts, (response) => {
                    response.on('data', (chunk) => data += chunk);
                    response.on('error', (err) => reject(err));
                    response.on('end', () => response.statusCode === 200 ? resolve(data) : reject(data));
                });
                req.on('error', err => reject(err));
                req.end();
            } catch (err) {
                reject(err);
            }
        });
    }
};
let quoteOpts = (symbol, type, startDate, endDate) => {
    let d1 = startDate.getDate(),
        m1 = startDate.getMonth(),
        y1 = startDate.getFullYear(),
        d2 = endDate.getDate(),
        m2 = endDate.getMonth(),
        y2 = endDate.getFullYear();
    return {
        host: 'real-chart.finance.yahoo.com',
        path: `/table.csv?s=${symbol}&a=${m1}&b=${d1}&c=${y1}&d=${m2}&e=${d2}&f=${y2}&g=${type}&ignore=.csv`
    };
};
let dataOpts = (symbol, type) => {
    return {
        host: 'download.finance.yahoo.com',
        path: `/d/quotes.csv?s=${symbol}&f=${type}`
    };
};
module.exports = {
    qtAttrs: {
        date: 0, open: 1, high: 2, low: 3, close: 4, volume: 5, adjClose: 6
    },
    quotes: function (symbol, startDate, endDate, attrs) {
        return Http.get(quoteOpts(symbol, 'd', startDate, endDate)).then(data => {
            let quotes = data.trim().split('\n');
            quotes.shift(); // pop header off

            return quotes.map(q => {
                let qAttrs = q.split(',');

                return qAttrs
                    .map((qa, idx) => idx === this.qtAttrs.date ? new Date(qa + 'T05:00:00') : Number(qa))
                    .filter((qa, idx) => !attrs || attrs.indexOf(idx) > -1);
            });
        }).catch(e => []);
    },
    dataAttrs: {
        name: 'n', avgVol: 'a2'
    },
    data: function(symbol, attrs) {
        return Http.get(dataOpts(symbol, 'na2')).then(data => {
            let dArr = data.trim().split(','),
                avgClose = Number(dArr.pop()),
                name = dArr.join(',').replace(/"/g, '');
            return {
                name: name, 
                avgClose: avgClose
            };
        }).catch(() => {});
    }
};
