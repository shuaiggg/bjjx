const common = require('../../utils/ajax.js')

Page({
  data: {
    baseUrl: 'https://wx.jianxuejy.net',
    header: {
      iconShow: true,
      title: '名师讲堂',
      isPlaceholder: true
    },
    famousTeachers: [],
  },
  onLoad: function (options) {
    this.askData()
  },
  askData: function () {
    var that = this
    common.ajax({
      url: 'api/getAllFamousTeacher',
      askType: 'POST'
    }, {}, function (msg) {
      if (msg.code === 200) {
        that.setData({
          famousTeachers: msg.data
        })
      } else {
        wx.showToast({
          title: '数据请求失败',
          icon: 'none',
          duration: 1000
        })
      }
    })
  }
})