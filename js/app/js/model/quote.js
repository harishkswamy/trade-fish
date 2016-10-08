'use strict';

module.exports = {
    date: (q) => q ? q[0] : q,
    open: (q) => q ? q[1] : q,
    high: (q) => q ? q[2] : q,
    low: (q) => q ? q[3] : q,
    close: (q) => q ? q[4] : q,
    volume: (q) => q ? q[5] : q,
    adjClose: (q) => q ? q[6] : q,

    parse: function(data) {
        return JSON.parse(data, (key, val) => {
            return key === '0' && typeof val === 'string' ? new Date(val) : val;
        });
    },

    toString: function(quotes) {
        return JSON.stringify(quotes, (k, v) => this.date(v) instanceof Date ? 
            [this.date(v).toLocaleDateString('en-US'), this.open(v), this.high(v), this.low(v),
                this.close(v), this.volume(v), this.adjClose(v)] : v);
    }
};
