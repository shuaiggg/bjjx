const app = getApp()
const common = require('../../utils/ajax.js')

Page({
  data: {
    header: {
      iconShow: false,
      title: '我的'
    },
    baseUrl: app.globalData.baseUrl,
    avatarUrl: '',
    nickName: '登录/注册',
    hasUserInfo: false,
    categoryText: '',
    showPay: false,
    categoryType: 0
  },
  onLoad: function () {
    let that = this

    let systemInfo = app.globalData.systemInfo
    that.setData({
      showPay: systemInfo.isIos
    })
  },
  onShow: function () {
    // 获取类别
    let that = this
    wx.getStorage({
      key: 'newcategory',
      success: function (res) {
        let categoryName = res.data.categoryName
        let temSer = 0
        if (categoryName.indexOf('药师') > -1) {
          temSer = 1
        }
        if (categoryName.indexOf('营养师') > -1) {
          temSer = 2
        }
        that.setData({
          categoryText: categoryName,
          categoryType: temSer
        })
      }
    })

    if (app.globalData.userInfo) {
      that.setData({
        hasUserInfo: true,
        avatarUrl: app.globalData.userInfo.avatarUrl,
        nickName: app.globalData.userInfo.nickName
      })
    }
  },
  getUserInfo: function (e) {
    var that = this
    // 引导用户授权
    if (e.detail.errMsg === 'getUserInfo:ok') {
      app.globalData.userInfo = e.detail.userInfo
      that.setData({
        hasUserInfo: true,
        avatarUrl: app.globalData.userInfo.avatarUrl,
        nickName: app.globalData.userInfo.nickName
      })
    }
  },

  onTabItemTap: function (item) {
    if (item.index === 3) {
      console.log(item)
      wx.navigateToMiniProgram({
        appId: 'wxe4482346c7bef727',
        path: '',
        envVersion: 'develop',
        success(res) {
          // 打开成功
        }
      })
    }
  }
})