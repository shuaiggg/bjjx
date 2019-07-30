/**
 * @file 存储文档数据
 * @author zhujialu
 */

import config from '../config';
import storage from '../storage';

/**
 * 原始数据格式
 *
 * @inner
 * @type {Object}
 */
let raw = [];

/**
 * 设置项
 *
 * @inner
 * @type {Object}
 */
let settings = {};


/**
 * 课件图片适应模式
 *
 * @type {string}
 */
const LOCAL_DOC_FIT = 'bjy_doc_image_fit';


/**
 * 简单页码到复杂页码
 *
 * @inner
 * @param {number} page
 * @return {Object}
 */
function simple2Complex(page) {


    // 范围检测：包括 start，不包括 end
    let start = 0;
    let end;

    const doc = raw.find(item => {
        end = start + item.pageList.length;
        if (page >= start && page < end) {
            return true;
        }

        start = end;
    }) || {};

    return {
        docId: doc.id || -1,
        page: page - start,
        pptUrl: doc.pptUrl || '',
        pageList: doc.pageList || []
    };
}

function complex2Simple(docId, page) {

    let result = {page: -1};

    raw.find(doc => {
        if (doc.id === docId) {
            result.pptUrl = doc.pptUrl;
            result.page += page + 1;
            return true;
        }
        else {
            result.page += doc.pageList.length;
        }
    });

    return result;

}

/**
 * 初始化
 */
const init = function () {

    clear();

    settings.quality = config.DOC_QUALITY_LOW;

    settings.fit = +storage.get(LOCAL_DOC_FIT) || config.DOC_FIT_VIEW;

};

/**
 * 清空所有数据
 */
const clear = function () {
    raw = [];
};

/**
 * 往后追加文档
 *
 * @param {Array} data
 */
const add = function (data) {

    if (!Array.isArray(data)) {
        data = [data];
    }

    raw = raw.concat(data);
};

/**
 * 更新文档
 *
 * @param {string} docId
 * @param {Object} extra
 */
const update = function (docId, extra) {

    const doc = getDocumentById(docId);
    if (!doc) {
        return;
    }
    doc.extra = extra;

};

/**
 * 删除文档
 *
 * @param {string} docId
 * @return {boolean}
 */
const remove = function (docId) {


    const index = raw.findIndex(doc => doc.id === docId);

    if (~index) {
        return raw.splice(index, 1)[0];
    }

    return false;

};

/**
 * 获取课件质量
 *
 * @return {number}
 */
const getQuality = function () {
    return settings.quality;
};

/**
 * 设置课件质量
 *
 * @param {number} quality
 */
const setQuality = function (quality) {
    settings.quality = quality;
    // storage.set(LOCAL_DOC_QUALITY, quality);
};

/**
 * 获取课件自适应方式
 *
 * @return {number}
 */
const getFit = function () {
    return settings.fit;
};

/**
 * 设置课件自适应方式
 *
 * @param {number} fit
 */
const setFit = function (fit) {
    settings.fit = fit;
    storage.set(LOCAL_DOC_FIT, fit);
};

/**
 * 获取白板页码数量
 *
 * @return {number}
 */
const getWhiteboardCount = function () {
    // 白板文档数量始终都是 1
    return 1;
};

/**
 * 获取文档页码数量
 *
 * @return {number}
 */
const getDocumentCount = function () {

    let count = 0;
    getDocumentList().forEach(doc => {
        count += doc.pageList.length;
    });

    return count;

};

/**
 * 获取白板列表
 *
 * @return {Array}
 */
const getWhiteboardList = function () {
    return raw.slice(0, getWhiteboardCount());
};

/**
 * 获取文档列表
 *
 * @return {Array}
 */
const getDocumentList = function () {
    return raw.slice(getWhiteboardCount()
    );
};

/**
 * 获取页码对应的信息
 *
 * @param {number} page 从 0 开始，0 表示白板
 * @return {Object}
 */
const getPageInfoByPage = function (page) {
    const data = simple2Complex(page);
    return getPageInfoByDoc(data.docId, data.page);
};

/**
 * 获取文档
 *
 * @param {string} id
 * @return {Object}
 */
const getDocumentById = function (id) {
    return raw.find(doc => id === doc.id);
};

/**
 * 获取页码对应的信息
 *
 * @param {string} docId
 * @param {number} page
 * @return {Object}
 */
const getPageInfoByDoc = function (docId, page) {
    const doc = getDocumentById(docId);
    return doc.pageList[page];
};


/**
 * 获得简单的从 0 开始的页码
 *
 * @param {string} docId
 * @param {number} page
 * @return {Object}
 */
const getSimplePage = function (docId, page) {
    return complex2Simple(docId, page);
};

/**
 * 获得服务器端使用的稍复杂的翻页数据
 *
 * @param {number} page
 * @return {Object}
 */
const getComplexPage = function (page) {
    return simple2Complex(page);
};

export default {
    init,
    clear,
    add,
    update,
    remove,
    getQuality,
    setQuality,
    getFit,
    setFit,
    getWhiteboardCount,
    getDocumentCount,
    getWhiteboardList,
    getDocumentList,
    getPageInfoByPage,
    getPageInfoByDoc,
    getDocumentById,
    getSimplePage,
    getComplexPage,
};