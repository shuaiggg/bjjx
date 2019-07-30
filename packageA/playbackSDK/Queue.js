/**
 * @file 队列
 * @author musicode
 */

/**
 * 想象一个场景
 *
 * 当同一时刻接收到一堆消息，你需要一条接一条的滚动显示，它们头尾相接
 *
 * 这时必须有一个队列，控制出队的时机，类似这种问题还有很多，因此可抽象实现
 */

/**
 *
 * @param {Object} options
 * @property {Function} options.task 有两个参数 (item, callback)
 */
function Queue(options) {
    Object.assign(this, options);
    this.init();
}

const proto = Queue.prototype;

proto.init = function () {
    this.list = [];
};

proto.add = function (item) {

    const list = this.list;

    list.push(item);

    if (typeof this.waiting !== 'function') {

        const waiting = () => {
            this.waiting = null;
            remove();
        };

        const remove = () => {
            if (this.list) {
                const item = list.shift();
                if (item) {
                    this.waiting = waiting;
                    this.task(item, waiting);
                }
            }
        };

        remove();

    }

};

proto.size = function () {
    return this.list.length;
};

proto.clear = function () {
    this.list.length = 0;
};

proto.dispose = function () {
    this.list = this.waiting = null;
};

module.exports = Queue;

export default Queue;
