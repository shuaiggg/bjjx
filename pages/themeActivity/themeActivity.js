const common = require('../../utils/ajax.js')
const getPhone = require('../../utils/getPhoneNumber.js')
const app = getApp()

Page({
  data: {
    baseUrl: 'https://wx.jianxuejy.net',
    header: {
      iconShow: true,
      title: '圣诞节',
      isPlaceholder: false,
    },
    hasPhoneNumber: '',
    avatarUrl: '',
    nickName: '',
    activityItem: '',
    peopleNum: [12364, 23568]
  },
  onLoad: function (options) {
    var that = this
    // 是否授权过手机号
    if (app.globalData.phoneNumber !== '') {
      that.setData({
        hasPhoneNumber: app.globalData.phoneNumber,
        avatarUrl: app.globalData.userInfo.avatarUrl,
        nickName: app.globalData.userInfo.nickName
      })
    }
  },
  getPhoneNumber: function (e) {
    var that = this
    getPhone.getPhoneNumber(e, function (msg) {
      that.setData({
        hasPhoneNumber: msg
      })
      wx.navigateTo({
        url: '../activity/activity?item=' + that.data.activityItem + '&avatarUrl=' + that.data.avatarUrl + '&nickName=' + that.data.nickName + '&phone=' + that.data.hasPhoneNumber
      })
    })
  }
})