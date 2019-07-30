/**
 * @file 串行操作
 * @author dujianhao
 */

'use strict';

/**
 * 串行操作
 *
 * @param {Array.<Function>} actions 函数数组
 * @param {number} interval 间隔时间
 * @return {Function} 中断函数
 */
export default function (actions, interval) {

    let index = 0;
    let timer;

    const handle = function () {
        if (actions[index]) {
            actions[index]();
            timer = setTimeout(
                function () {
                    timer = null;
                    index++;
                    handle();
                },
                interval
            );
        }
    };

    handle();

    return function () {
        if (timer) {
            clearTimeout(timer);
        }
    };

}