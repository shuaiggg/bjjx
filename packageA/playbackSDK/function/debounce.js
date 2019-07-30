/**
 * @file 节流函数
 * @author dujianhao
 */

/**
 * 节流调用
 *
 * @param {Function} fn 需要节制调用的函数
 * @param {number=} delay 调用的时间间隔，默认 50ms
 * @param {boolean=} immediate 是否立即执行函数
 * @return {Function}
 */
function debounce(fn, delay, immediate) {

    delay = +delay || 50;

    let timer;

    return function (...data) {

        if (!timer) {
            const context = this;

            if (immediate) {
                fn.apply(context, data);
            }

            timer = setTimeout(
                function () {
                    timer = null;
                    if (!immediate) {
                        fn.apply(context, data);
                    }
                },
                delay
            );

        }

    };

}

module.exports = debounce;

export default debounce;

