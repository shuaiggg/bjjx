function isObject(value) {
    return Object.prototype.toString.call(value) === '[object Object]';
}

const storeObject = {

    store: {},

    set: function (str, val) {
        if (isObject(str)) {
            for (let key in str) {
                if (str.hasOwnProperty(key)) {
                    storeObject.setByStr(key, str[key]);
                }
            }

        } else {
            storeObject.setByStr(str, val);
        }

    },

    setByStr: function (str, val) {

        const splitStr = str.split('.');
        let value = storeObject.store;
        for (let i = 0, item; item = splitStr[i++];) {
            if (i === splitStr.length) {
                value[item] = val;
                break;
            } else {
                value[item] = value[item] || {};
                value = value[item];
            }
        }
    },

    get: function (str, defVal) {

        const splitStr = str.split('.');
        let begin = storeObject.store;
        for (let i = 0, item; item = splitStr[i++];) {
            begin = begin[item];
            if (typeof begin === 'undefined') {
                if (typeof defVal !== 'undefined') {
                    return defVal;
                } else{
                    return undefined;
                }
            }
        }
        return begin;
    },
    increase: function (keypath, step, max) {
        let value = (+this.get(keypath) || 0) + (+step || 1);
        if (value > max) {
            value = max;
        }
        this.set(keypath, value);
        return value;
    },

    /**
     * 递减 keypath 对应的数据
     *
     * 注意，最好是整型的减法，如果涉及浮点型，不保证计算正确
     *
     * @param {string} keypath 值必须能转型成数字，如果不能，则默认从 0 开始递减
     * @param {?number} step 步进值，默认是 1
     * @param {?number} min 可以递减到的最小值，默认不限制
     * @return {number} 返回递减后的值
     */


    decrease: function (keypath, step, min) {
        let value = (+this.get(keypath) || 0) - (+step || 1);
        if (value < min) {
            value = min;
        }
        this.set(keypath, value);
        return value;
    },

    clear: function() {
        this.store = {};
    }
};

module.exports = storeObject;

export default storeObject;

