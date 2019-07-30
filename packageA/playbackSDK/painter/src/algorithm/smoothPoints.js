/**
 * @file 涂鸦平滑算法
 * @author dujianhao
 * @date 2018/12/13
 */

'use strict';
// this fn depends on Point, but LinePathShape depends on it, so it can't be
// moved out of this file yet.
var bspline = function (points, order) {
    if (!order) {
        return points;
    }
    return bspline(_dual(_dual(_refine(points))), order - 1);
};

var _refine = function (points) {
    points = [points[0]].concat(points).concat(last(points));
    var refined = [];

    var index = 0;
    for (var point of points) {
        refined[index * 2] = point;
        if (points[index + 1]) {
            refined[index * 2 + 1] = _mid(point, points[index + 1]);
        }
        index += 1;
    }

    return refined;
};

var _dual = function (points) {
    var dualed = [];

    var index = 0;
    for (var point of points) {
        if (points[index + 1]) {
            dualed[index] = _mid(point, points[index + 1]);
        }
        index += 1;
    }

    return dualed;
};

var _mid = function (a, b) {
    return {
        x: a.x + (b.x - a.x) / 2,
        y: a.y + (b.y - a.y) / 2,
    };
};

function last(array, n = null) {
    if (n) {
        return Array.prototype.slice.call(array, Math.max(array.length - n, 0));
    }
    else {
        return array[array.length - 1];
    }
}

export default function (points, option) {
    option = option || {};
    var order = option.order || 3;
    var tailSize = option.tailSize || 3;
    var segmentSize = Math.pow(2, order);
    var sampleSize = tailSize + 1;

    var smoothedPoints = null;

    points.forEach(function (point, index) {
        var tempPoints = points.slice(0, index + 1);
        if (!smoothedPoints || tempPoints.length < sampleSize) {
            smoothedPoints = bspline(tempPoints, order);
        }
        else {
            var tail = last(bspline(last(tempPoints, sampleSize), order), segmentSize * tailSize);

            // Remove the last @tailSize - 1 segments from @smoothedPoints
            // then concat the tail. This is done because smoothed points
            // close to the end of the path will change as new points are
            // added.
            smoothedPoints = smoothedPoints.slice(
                0,
                smoothedPoints.length - segmentSize * (tailSize - 1)
            ).concat(tail);
        }
    });

    return smoothedPoints;
};
