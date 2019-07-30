const common = require('../../utils/ajax.js')

Page({
  data: {
    baseUrl: 'https://wx.jianxuejy.net',
    header: {
      iconShow: true,
      title: '简公益'
    },
    imageHeight: 0
  },
  onLoad: function (options) {
    this.askData()
  },
  goDetail: function (e) {
    //console.log(e.currentTarget.dataset.jumpto)
    wx.navigateTo({
      url: e.currentTarget.dataset.jumpto
    })
  },
  askData: function (e) {
    var that = this
    //数据请求
    common.ajax({
      url: 'api/publicHelp',
      askType: 'POST'
    }, {}, function (msg) {
      if (msg.code === 200) {
        that.setData({
          welfare: msg.data
        })
      } else {
        console.log('数据请求失败')
      }
    })
  },
  imageLoad: function (e) {
    var that = this
    var imgwidth = e.detail.width,
        imgheight = e.detail.height,
        ratio = imgwidth / imgheight;
    
    wx.getSystemInfo({
      success: function (res) {
        console.log('高度：' + (res.screenWidth / ratio))
        //lala = ((res.screenWidth * 0.84) - 20)
        that.setData({
          imageHeight: ((res.screenWidth * 0.84) - 20) / ratio
        })
      }
    })
  }
})