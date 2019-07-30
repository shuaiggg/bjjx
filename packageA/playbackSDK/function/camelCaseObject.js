import camelCase from './camelCase';

function camelCaseObject(obj) {

    let result = Array.isArray(obj) ? [] : {};

    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            let value = obj[key];
            const type = Object.prototype.toString.call(value);
            if (type === '[object Array]' || type === '[object Object]') {
                value = camelCaseObject(value);
            }

            result[camelCase(key)] = value;
        }
    }

    return result;

}

module.exports = camelCaseObject;

export default camelCaseObject;