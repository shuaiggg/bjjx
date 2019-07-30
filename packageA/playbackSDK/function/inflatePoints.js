/**
 * @file 解压 base64
 * @author zhujialu
 */

const base64 = require('./base64').map;

function decode(value) {
    const x1 = base64[value.charAt(0)];
    const x2 = base64[value.charAt(1)];
    const y1 = base64[value.charAt(2)];
    const y2 = base64[value.charAt(3)];

    return {
        x: (x1 * 64 + x2) / 4095,
        y: (y1 * 64 + y2) / 4095
    };
}

/**
 * @param {Object} shape
 */
const inflatePoints = function (shape) {
    const points = shape.points;
    if (typeof points === 'string') {
        if (shape.encodeType === 2) {
            const newPoints = [];
            for (let i = 0, len = points.length; i < len; i += 4) {
                newPoints.push(decode(points.substr(i, 4)));
            }
            return newPoints;
        }
        else {
            return JSON.parse(points);
        }
    }
    return points;
};

module.exports = inflatePoints;

export default inflatePoints;
