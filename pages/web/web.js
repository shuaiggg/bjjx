const common = require('../../utils/ajax.js')

Page({
  data: {
    nowTime: new Date().getTime(),
    navigaHeight: 0,
    fullUrl: '',     
  },
  onLoad: function (options) {
    var that = this
    
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          navigaHeight: (res.statusBarHeight - 20) / (res.windowWidth / 750)
        })
        // console.log(res.version)
        if (options.playBackRoomId && options.playBackRoomId != '') {
          that.setData({
            fullUrl: 'https://wx.jianxuejy.net/index.php/index/index/playBackByBackRoomid?playBackRoomId=' + options.playBackRoomId + '&phone=' + options.phone + '&version=' + res.version +'&date=' + that.data.nowTime
          })
        } else if (options.lessionId) {
          that.setData({
            fullUrl: 'https://wx.jianxuejy.net/index.php/index/index/lessonLive?lessionId=' + options.lessionId + '&phone=' + options.phone + '&version=' + res.version + '&date=' + that.data.nowTime
          })
        } else {
          that.setData({
            fullUrl: 'https://wx.jianxuejy.net/index.php/index/index/live?roomId=' + options.liveRoomId + '&phone=' + options.phone + '&version=' + res.version + '&date=' + that.data.nowTime
          })
        }
        console.log('百家云播放地址：' + that.data.fullUrl)
      }
    })
  }
})