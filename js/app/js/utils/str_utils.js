'use strict';

module.exports = {
    pad: function (val, len, left) {
        val = (val + '').trim();
        return left ?
            Array(len - val.length + 1).join(' ') + val :
            val + Array(len - val.length + 1).join(' ');
    },

    rpad: function (val, len) {
        return this.pad(val, len, false);
    },

    lpad: function (val, len) {
        return this.pad(val, len, true);
    }
};
