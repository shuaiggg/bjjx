/**
 * @file 文档翻页
 * @author zhujialu
 */

import eventEmitter from '../eventEmitter';
import auth from '../auth';
import docData from '../data/doc';


/**
 * 翻页有两套逻辑：
 *
 * 1. 老师或助教驱动的服务器端翻页，一旦触发，所有终端统一成相同页码
 *
 * 2. 学生驱动的客户端翻页，不广播，最大页码取决于服务器端页码
 *
 */

/**
 * 服务器端页码
 *
 * @inner
 * @type {number}
 */
let serverPage = 0;

let serverStep = 0;

/**
 * 客户端页码
 *
 * @inner
 * @type {number}
 */
let clientPage = 0;

let clientStep = 0;

/**
 * 最大可翻页页码
 *
 * @inner
 * @type {number}
 */
let maxPage = 0;

let maxStep = 0;


const init = function (page) {
    eventEmitter
        .on(
            eventEmitter.SERVER_PAGE_CHANGE,
            function (event, data) {
                serverPage = clientPage = docData.getSimplePage(data.docId, data.page).page;
                serverStep = clientStep = data.step;
            }
        )
        .on(
            eventEmitter.CLIENT_PAGE_CHANGE,
            function (event, data) {
                clientPage = docData.getSimplePage(data.docId, data.page).page;
                clientStep = data.step;
            }
        )
        .on(
            eventEmitter.MAX_PAGE_CHANGE,
            function (event, data) {
                maxPage = data.page;
                maxStep = data.step;
            }
        );
};


/**
 * 是否还有上一页（不能翻到白板）
 *
 * @param {number} page
 * @return {boolean}
 */
const hasPrevPage = function (page) {
    return page > 0;
};

/**
 * 是否还有下一页
 *
 * @param {number} page
 * @return {boolean}
 */
const hasNextPage = function (page) {

    /**
     * 以文档最大页码为限
     */
    const count = docData.getWhiteboardCount() + docData.getDocumentCount();
    return page < count - 1;
};

/**
 * 翻到上一页
 *
 * @return {boolean}
 */
const prevPage = function () {

    if (hasPrevPage(clientPage)) {
        clientPage--;
        return true;
    }

};

/**
 * 翻到下一页
 *
 * @return {boolean}
 */
const nextPage = function () {

    if (hasNextPage(clientPage)) {
        clientPage++;
        return true;
    }

};

/**
 * 获取客户端页码
 *
 * @return {number}
 */
const getClientPage = function () {
    return clientPage;
};

/**
 * 获取客户端步骤
 *
 * @return {number}
 */
const getClientStep = function () {
    return clientStep;
};

/**
 * 获取服务器端页码
 *
 * @return {number}
 */
const getServerPage = function () {
    return serverPage;
};

/**
 * 获取服务器端步骤
 *
 * @return {number}
 */
const getServerStep = function () {
    return serverStep;
};

/**
 * 获取最大可翻页页码
 *
 * @return {number}
 */
const getMaxPage = function () {
    return maxPage;
};

const getMaxStep = function () {
    return maxStep;
};

const getPageList = function (page) {
    const docInfo = docData.getComplexPage(page);
    const docPage = docInfo.page;
    const docId = +docInfo.docId;
    const res = [];
    let max;
    for (let i = 0; i <= docId; i++) {
        const docDetail = docData.getDocumentById(i);
        if (docDetail) {
            const pageList = docDetail.pageList;
            if (i === docId) {
                max = docPage + 1;
            }
            else {
                max = pageList.length;
            }

            for (let j = 0; j < max; j++) {
                const item = pageList[j];
                item.page = docData.getSimplePage(i, j).page;
                res.push(item);
            }
        }
    }
    return res;
};

export default {
    init,
    hasPrevPage,
    hasNextPage,
    prevPage,
    nextPage,
    getClientPage,
    getClientStep,
    getServerPage,
    getServerStep,
    getMaxPage,
    getMaxStep,
    getPageList,
};
