/**
 * @file 标注数据
 * @author zhujialu
 */

import eventEmitter from '../eventEmitter';


/**
 * 加载过完整标注数据的表
 *
 * @type {Object}
 */
var loadMap;

/**
 * 获取 loadMap 中的 key
 *
 * @inner
 * @param {Object} data
 * @property {string} data.docId
 * @property {number} data.page
 * @return {string}
 */
function getLoadKey(data) {
    return data.docId + '-' + data.page;
}

/**
 * 获取标注列表
 *
 * @inner
 * @param {Object} data
 * @property {string} data.docId
 * @property {number} data.page
 * @return {Array?}
 */
function getShapeList(data) {
    return loadMap[getLoadKey(data)];
}

/**
 * 初始化
 */
const init = function () {
    loadMap = {};

    eventEmitter
        .on(
            eventEmitter.RECORD_SHAPE_CLEAN,
            function () {
                loadMap = {};
            }
        );
};

/**
 * 添加标注
 *
 * @param {string} docId
 * @param {number} page
 * @param {Object|Array} shape
 */
const add = function (docId, page, shape) {

    const shapeList = get(docId, page);

    if (Array.isArray(shapeList)) {
        if (!Array.isArray(shape)) {
            shape = [shape];
        }

        const shapeMap = {};

        shapeList.forEach(item => {
            shapeMap[item.id] = item;
        });

        shape.forEach(item => {

            if (!shapeMap[item.id]) {
                shapeList.push(item);
            }
        });
    }

};

/**
 * 删除标注
 *
 * @param {string} docId
 * @param {number} page
 * @param {string} shapeId
 */
const remove = function (docId, page, shapeId) {

    const shapeList = get(docId, page);

    if (Array.isArray(shapeList)) {

        let index = -1;
        shapeList.forEach((shape, i) => {
            if (shape.id === shapeId) {
                index = i;
                return false;
            }
        });

        if (index >= 0) {
            shapeList.splice(index, 1);
        }

    }

};

/**
 * 更新标注
 *
 * @param {string} docId
 * @param {number} page
 * @param {Object|Array} shape
 */
const update = function (docId, page, shape) {

    const shapeList = getShapeList({
        docId: docId,
        page: page
    });

    if (Array.isArray(shapeList)) {

        if (!Array.isArray(shape)) {
            shape = [shape];
        }

        const shapeMap = {};

        shapeList.forEach(item => {
            shapeMap[item.id] = item;
        });

        shape.forEach(newShape => {
            const shape = shapeMap[newShape.id];
            if (shape) {
                Object.assign(shape, newShape);
            }
        });
    }

};

const get = function (docId, page) {
    return getShapeList({
        docId: docId,
        page: page,
    });
};

/**
 * 清空标注
 *
 * @param {string} docId
 * @param {number} page
 */
const clear = function (docId, page) {
    if (docId != null && page != null) {
        const shapeList = get(docId, page);
        const pageData = {
            docId: docId,
            page: page
        };

        const loadKey = getLoadKey(pageData);
        
        if (Array.isArray(shapeList)) {
            shapeList.length = 0;
            loadMap[loadKey] = [];
        }
    }
    else {
        loadMap = {};
    }
};

/**
 * 获得某一页的标注
 *
 * @param {string} docId
 * @param {number} page
 * @return {Promise}
 */
const load = function (docId, page) {

    const pageData = {
        docId: docId,
        page: page
    };

    const loadKey = getLoadKey(pageData);
    const shapeList = loadMap[loadKey] || {};

    const promise = new Promise(resolve => {

        if (shapeList.done) {
            return shapeList;
        }

        if (Array.isArray(shapeList)) {
            shapeList.done = true;
            resolve(shapeList);
        }
        else {

            loadMap[loadKey] = promise;

            eventEmitter
                .one(
                    eventEmitter.SHAPE_ALL_RES,
                    function (event, data) {
                        if (data.docId === pageData.docId
                            && data.page === pageData.page
                        ) {
                            const shapeList = data.shapeList;

                            // 标记该页已加载
                            loadMap[loadKey] = shapeList;

                            // 存储标注数据
                            add(pageData.docId, pageData.page, shapeList);

                            promise.done = true;
                            resolve(shapeList);

                        }
                    }
                )
                .trigger(
                    eventEmitter.SHAPE_ALL_REQ,
                    pageData
                );
        }
    });


    return promise;

};

export default {
    init,
    add,
    remove,
    update,
    get,
    clear,
    load,
}
