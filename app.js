//app.js
const common = require('utils/ajax.js')

App({
  onLaunch: function (options) {
    let that = this
    
    const updateManager = wx.getUpdateManager()
    updateManager.onCheckForUpdate(function (res) {
      console.log(res.hasUpdate)
    })
    updateManager.onUpdateReady(function () {
      wx.showModal({
        title: '更新提示',
        content: '新版本已经准备好，是否重启应用？',
        success: function (res) {
          if (res.confirm) {
            updateManager.applyUpdate()
          }
        }
      })
    })
    updateManager.onUpdateFailed(function () {
      console.log('新的版本下载失败')
    })

    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            success: res => {
              that.globalData.userInfo = res.userInfo
              if (that.userInfoReadyCallback) {
                that.userInfoReadyCallback(res)
              }
            }
          })
        } else {
        }
      }
    })

    //获取系统信息
    wx.getSystemInfo({
      success: function (res) {
        let screenHeight = res.screenHeight
        let screenWidth = res.screenWidth
        let isIos = res.system.indexOf('iOS') > -1 ? true : false
        let statusBarHeight = res.statusBarHeight
        let capsuleBtn = wx.getMenuButtonBoundingClientRect()
        let navHeight = ((capsuleBtn.top - statusBarHeight) * 2) + capsuleBtn.height + statusBarHeight
        let navigaHeight = (res.statusBarHeight - 20) / (res.windowWidth / 750)
        that.globalData.systemInfo = { 
          screenHeight, 
          screenWidth, 
          isIos, 
          statusBarHeight, 
          navigaHeight,
          navHeight 
        }
      }
    })
  
  },
  globalData: {
    userInfo: null,
    refreshFlag: false,
    selecResult: null,
    systemInfo: null,
    phoneNumber: '',
    isGoodClass: false,
    baseUrl: 'https://wx.jianxuejy.net'
  }
})