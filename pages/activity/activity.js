const common = require('../../utils/ajax.js')

Page({
  data: {
    nowTime: new Date().getTime(),
    activityItem: '',  
    fullUrl: 'https://wx.jianxuejy.net/index.php/index/index/',
  },
  onLoad: function (options) {
    console.log(options)
    var that = this
    var temStr = ''
    for (var key in options) {
      if (key === 'item') {
      } else {
        temStr =  temStr + key + '=' + options[key] + '&'
      }
    }
    temStr = that.data.fullUrl + options.item + '?' + temStr + 'time=' + that.data.nowTime
    temStr = encodeURI(temStr)
    console.log('网址：' + temStr)
    that.setData({
      fullUrl: temStr
    })
  },
  handleGetMessage: function (e) {
    console.log(e)
  }
})