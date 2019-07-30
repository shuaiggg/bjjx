const common = require('../../utils/ajax.js')
const app = getApp()

Page({
  data: {
    baseUrl: app.globalData.baseUrl,
    header: {
      iconShow: false,
      title: '走进简学',
      isPlaceholder: true
    },
    images: []
  },
  onLoad: function (options) {
    let that = this
    common.ajax({
      url: 'api/Specialty/getIntroduceInfo',
      askType: 'POST'
    }, {}, function (msg) {
      if (msg.status === 200) {
        that.setData({
          images: msg.data
        })
      }
    })
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