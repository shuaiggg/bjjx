
const rmsPrefix = /^-ms-/,
    rdashAlpha = /-([a-z])/g;

function fcamelCase(all, letter) {
    return letter.toUpperCase();
}

function camelCase(str) {


    if (typeof str !== 'string') {
        str = '' + str;
    }

    if (str.indexOf('_') >= 0) {

        str = str.replace(/_/g, '-');

        return str.replace(rmsPrefix, "ms-").replace(rdashAlpha, fcamelCase);
    }
    return str;

}
module.exports = camelCase;

export default camelCase;