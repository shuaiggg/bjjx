const set = function (key, data) {
    wx.setStorageSync(key, data);

};
const get = function (key) {
    return wx.getStorageSync(key);
};
const remove = function (key) {
    wx.removeStorageSync(key);
};

export default {
    set,
    get,
    remove
}