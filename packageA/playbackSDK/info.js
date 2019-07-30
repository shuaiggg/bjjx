/**
 * 定义一些提示模板
 */
import getLanguage from './language/main';
import config from './config';
import store from './store';
import deviceInfo from './deviceInfo';

const alert = function (title) {
    wx.showModal({
        title: getLanguage().INFO_ALERT_TITLE,
        content: title,
        showCancel: false,
        confirmText: getLanguage().INFO_ALERT_CONFIRM
    });
};

const success = function (title) {
    wx.showToast({
        title: title,
        icon: 'success',
        duration: 2000
    });
};
const tip = function (title) {
    if (store.get('hasDefaultTip', true)) {
        wx.showToast({
            title: title,
            icon: 'none',
            duration: config.TOAST_DURATION
        });
    }
};
const confirm = function (params) {
    return new Promise((resolve, reject) => {

        const options = {
            content: params.content,
            title: params.title ? params.title : getLanguage().INFO_ALERT_TITLE,
            success: function (res) {
                if (res.confirm) {
                    resolve();
                }
                else if (res.cancel) {
                    reject();
                }
            }
        };
        if (params.cancelText) {
            options.cancelText = params.cancelText;
        }
        if (params.cancelColor) {
            options.cancelColor = params.cancelColor;
        }
        if (params.confirmText) {
            options.confirmText = params.confirmText;
        }
        if (params.confirmColor) {
            options.confirmColor = params.confirmColor;
        }

        wx.showModal(options);
    });
};
const showLoading = function () {
    wx.showLoading({
        title: getLanguage().LOADING,
        mask: true
    });
};
const hideLoading = function () {
    wx.hideLoading();
};

let showingActionSheet = false;
const showActionSheet = function (obj) {
    if (showingActionSheet) {
        return;
    }
    const itemList = obj.itemList;
    if (itemList.length) {
        if (deviceInfo.isAndroid()) {
            itemList.push(getLanguage().CLOSE);
        }
        showingActionSheet = true;
        wx.showActionSheet({
            itemList: itemList,
            itemColor: obj.itemColor,
            success: res => {
                obj.success && obj.success(res);
            },
            fail: res => {
                obj.fail && obj.fail(res);
            },
            complete: res => {
                showingActionSheet = false;
                obj.complete && obj.complete(res);
            }
        });
    }
};

export default {
    alert,
    success,
    tip,
    confirm,
    showLoading,
    hideLoading,
    showActionSheet,
}