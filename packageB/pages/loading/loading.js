// pages/loading/loading.js
var util = require('../util');
var bjy = require('../../sdk/bjy');
Page({

    /**
     * 页面的初始数据
     */
    data: {
        options: {
            activeColor: 'red',
            strokeWidth: '10',
            backgroundColor: 'blue'
        }
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        util.init();
    },
    roomLoadEnded: function () {
        bjy.info.tip('进入教室成功');
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {
        bjy.exit();
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})