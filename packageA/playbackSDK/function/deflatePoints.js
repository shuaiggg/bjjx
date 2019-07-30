/**
 * @file 压缩 points
 * @author zhujialu, dujianhao
 */

const base64 = require('./base64').list;

function encode(value) {
    value = Math.floor(value * 4095);
    const a = Math.floor(value / 64);
    const b = value % 64;
    return base64[a] + base64[b];
}

function deflatePoints(shape) {
    const points = shape.points;
    // 双向箭头有十个点
    if (Array.isArray(points)
        && points.length > 10
        && shape.name === 'Doodle'
        && !shape.autoClosePath
    ) {
        const newPoints = [];
        points.forEach(item => {
            if (item.x >= 0 && item.x <= 1 && item.y >= 0 && item.y <= 1) {
                const point = encode(item.x) + encode(item.y);
                if (point !== newPoints[newPoints.length - 1]) {
                    newPoints.push(point);
                }
            }
        });
        shape.encodeType = 2;
        return newPoints.join('');
    }
    else if (Array.isArray(points)) {
        shape.encodeType = 0;
        return JSON.stringify(points);
    }
    return points;
}

/**
 * @param {Object} shape
 */
module.exports = deflatePoints;

export default deflatePoints;

