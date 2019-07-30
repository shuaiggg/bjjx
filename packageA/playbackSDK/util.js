var FALSE = false;
var NULL = null;
var UNDEFINED = undefined;

var RAW_FUNCTION = 'function';

/**
 * 遍历数组
 *
 * @param {Array} array
 * @param {Function} callback 返回 false 可停止遍历
 * @param {?boolean} reversed 是否逆序遍历
 */
function each(array$$1, callback, reversed) {
    const length = array$$1.length;

    if (length) {
        if (reversed) {
            for (var i = length - 1; i >= 0; i--) {
                if (callback(array$$1[i], i) === FALSE) {
                    break;
                }
            }
        }
        else {
            for (var _i = 0; _i < length; _i++) {
                if (callback(array$$1[_i], _i) === FALSE) {
                    break;
                }
            }
        }
    }
}

/**
 * 合并两个数组
 *
 * @param {Array} array1
 * @param {Array} array2
 * @return {Array}
 */
function merge(array1, array2) {
    return array1.concat(array2);
}


function numeric(value) {
    return !isNaN(parseFloat(value)) && isFinite(value);
}

function is(value, type) {
    return type === 'numeric' ? numeric(value) : Object.prototype.toString.call(value).toLowerCase()
        === '[object '
        + type
        + ']';
}

function isDef(target) {
    return target !== UNDEFINED;
}

function func(value) {
    return is(value, RAW_FUNCTION);
}

function array(value) {
    return is(value, 'array');
}

function object(value) {
    // 低版本 IE 会把 null 和 undefined 当作 object
    return value && is(value, 'object');
}

function string(value) {
    return is(value, 'string');
}

function number(value) {
    return is(value, 'number');
}

function boolean(value) {
    return is(value, 'boolean');
}

function numeric(value) {
    return !isNaN(parseFloat(value)) && isFinite(value);
}

function primitive(value) {
    return string(value) || number(value) || boolean(value) || value == NULL;
}

function classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new Error('Cannot call a class as a function');
    }
}

/**
 * 添加
 *
 * @param {Array} original
 * @param {*} value
 * @param {string} action
 */
function addItem(original, value, action) {
    if (array(value)) {
        each(value, function (item) {
            original[action](item);
        });
    }
    else {
        original[action](value);
    }
}

/**
 * 往后加
 *
 * @param {Array} original
 * @param {*} item
 */
function push(original, item) {
    addItem(original, item, 'push');
}

/**
 * 扩展对象
 *
 * @return {Object}
 */
function extend(original, object1, object2, object3) {
    // 尽量不用 arguments
    // 提供三个扩展对象足够了吧...
    each([object1, object2, object3], function (object$$1) {
        if (object(object$$1)) {
            each$1(object$$1, function (value, key) {
                original[key] = value;
            });
        }
    });
    return original;
}

/**
 * 遍历对象
 *
 * @param {Object} object
 * @param {Function} callback 返回 false 可停止遍历
 */
function each$1(object$$1, callback) {
    each(keys(object$$1), function (key) {
        return callback(object$$1[key], key);
    });
}

/**
 * 获取对象的 key 的数组
 *
 * @param {Object} object
 * @return {Array}
 */
function keys(object$$1) {
    return Object.keys(object$$1);
}

/**
 * 获取子串的起始位置
 *
 * @param {string} str
 * @param {string} part
 * @return {number}
 */
function indexOf$1(str, part) {
    return str.indexOf(part);
}

/**
 * 拷贝对象
 *
 * @param {*} object
 * @param {?boolean} deep 是否需要深拷贝
 * @return {*}
 */
function copy(object$$1, deep) {
    var result = object$$1;
    if (array(object$$1)) {
        result = [];
        each(object$$1, function (item, index) {
            result[index] = deep ? copy(item, deep) : item;
        });
    }
    else if (object(object$$1)) {
        result = {};
        each$1(object$$1, function (value, key) {
            result[key] = deep ? copy(value, deep) : value;
        });
    }
    return result;
}

function formatMobileNumber(mobile) {
    return mobile.replace(/^(\d{3})\d{4}(\d{4})$/, '$1****$2');
};

function toNumber(str) {
    var defaultValue = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

    if (numeric(str)) {
        return +str;
    }
    return defaultValue;
};

/**
 * 把数组转成对象
 *
 * @param {Array} array 数组
 * @param {?string} key 数组项包含的字段名称，如果数组项是基本类型，可不传
 * @param {?*} value
 * @return {Object}
 */
function toObject(array$$1, key, value) {
    var result = {},
        hasValue = arguments.length === 3;
    each(array$$1, function (item, index) {
        result[key ? item[key] : item] = hasValue ? value : item;
    });
    return result;
}

/**
 * 数组项在数组中的位置
 *
 * @param {Array} array 数组
 * @param {*} item 数组项
 * @param {?boolean} strict 是否全等判断，默认是全等
 * @return {number} 如果未找到，返回 -1
 */
function indexOf(array$$1, item, strict) {
    if (strict !== false) {
        return array$$1.indexOf(item);
    }
    else {
        for (var i = 0, len = array$$1.length; i < len; i++) {
            if (array$$1[i] == item) {
                return i;
            }
        }
        return -1;
    }
}

/**
 * 数组是否包含 item
 *
 * @param {Array} array 数组
 * @param {*} item 可能包含的数组项
 * @param {?boolean} strict 是否全等判断，默认是全等
 * @return {boolean}
 */
function arrayHas(array$$1, item, strict) {
    return indexOf(array$$1, item, strict) >= 0;
}

var str = {

    /**
     * str 是否以 part 开始
     *
     * @param {string} str
     * @param {string} part
     * @return {boolean}
     */
    startsWith: function (str, part) {
        return indexOf$1(str, part) === 0;
    },

    /**
     * str 是否以 part 结束
     *
     * @param {string} str
     * @param {string} part
     * @return {boolean}
     */
    endsWith: function (str, part) {
        var offset = str.length - part.length;
        return offset >= 0 && str.lastIndexOf(part) === offset;
    }
};
var arr = {
    each: each,
    has: arrayHas,
    merge: merge
};
var is$ = {
    isDef: isDef,
    func: func,
    array: array,
    object: object,
    string: string,
    number: number,
    boolean: boolean,
    primitive: primitive,
};


/**
 * 转成时间戳
 *
 * 大部分场景，后端给的都是时间戳，如果不是，大部分情况都是 Mysql 存储的 YYYY-MM-DD hh:mm:ss 格式
 *
 * @param {*} value
 * @return {*}
 */
function toTimestamp(value, defaultValue) {

    var result = toNumber(value);
    var pattern = /(\d{4})-(\d{1,2})-(\d{1,2}) (\d{1,2}):(\d{1,2}):(\d{1,2})/;

    if (typeof result !== 'number' && typeof value === 'string') {
        var match = value.match(pattern);
        if (match) {
            var date = new Date(match[1], match[2] - 1, match[3]);
            date.setHours(match[4]);
            date.setMinutes(match[5]);
            date.setSeconds(match[6]);
            result = date.getTime();
        }
    }

    return typeof result === 'number'
        ? result
        : defaultValue;

}

const utils = {
    array: arr,
    numeric: numeric,
    is: is$,
    classCallCheck: classCallCheck,
    extend: extend,
    copy: copy,
    each$1: each$1,
    push: push,
    formatMobileNumber: formatMobileNumber,
    toNumber: toNumber,
    toObject: toObject,
    string: str,
    toTimestamp: toTimestamp
};

module.exports = utils;

export default utils;

