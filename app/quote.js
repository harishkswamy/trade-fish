'use strict';

module.exports = {
    date: (q) => q ? q[0] : q,

    adjClose: (q) => q ? q[1] : q,
    
    parse: function(data) {
        return JSON.parse(data, (key, val) => {
            return key === '0' && typeof val === 'string' ? new Date(val) : val;
        });
    },

    toString: function(quotes) {
        return JSON.stringify(quotes, (k, v) => this.date(v) instanceof Date ? 
                [this.date(v).toLocaleDateString('en-US'), this.adjClose(v)] : v);
    }
};
