const app = getApp()
const common = require('../../utils/ajax.js')

Page({
  data: {
    baseUrl: 'https://wx.jianxuejy.net',
    header: {
      iconShow: true,
      title: '限时福利',
      isPlaceholder: true
    },
    navigaHeight: 44,
    categoryType: 1,
    total: 999,
    current: 0,
    percent: 0,
    showPop: false
  },
  onLoad: function (options) {
    let that = this
    common.ajax({
      url: 'api/School/numberGetControl',
      askType: 'POST'
    }, {}, function (msg) {
      if (msg.status === 200) {
        let systemInfo = app.globalData.systemInfo
        that.setData({
          navigaHeight: systemInfo.navHeight,
          current: msg.data.number,
          percent: msg.data.number / 999 * 100,
          categoryType: parseInt(options.type)
        })
      } else {
        console.log('数据请求失败')
      }
    })
  },
  doCopy(e) {
    let that = this
    let wechatNum = e.currentTarget.dataset.msg
    common.ajax({
      url: 'api/School/numberSaveControl',
      askType: 'POST'
    }, {}, function (msg) {
      if (msg.status === 200) {
        that.setData({
          current: msg.data.number
        })
        wx.setClipboardData({
          data: wechatNum,
          success(res) {
            wx.hideToast()
            that.setData({
              showPop: true
            })
          }
        })
      } else {
        console.log('数据请求失败')
      }
    })
    
  },
  closeAD() {
    this.setData({
      showPop: false
    })
  }
})