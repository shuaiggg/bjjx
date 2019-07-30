/**
 * @file 设备信息
 * @author Lingling Yan yanlingling@baijiahulian.com
 */
const sysInfo = wx.getSystemInfoSync();
const model = sysInfo.model;
const system = sysInfo.system.toLowerCase();

const isIphoneX = function () {
    return model.indexOf('iPhone X') !== -1;
};

const isAndroid = function () {
    return system.indexOf('android') !== -1;
};

export default {
    isIphoneX,
    isAndroid,
}