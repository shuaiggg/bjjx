// pages/list/list.js
import $wuxPrompt from '../common/prompt/prompt'
import { $stopWuxRefresher } from '../components/index'
const common = require('../../utils/ajax.js')

Page({
  data: {
    baseUrl: 'https://wx.jianxuejy.net',
    header: {
      iconShow: true,
      title: '我的课程',
      isPlaceholder: true
    },
    lesson: [],
    pageNumber: 1
  },
  onLoad: function (options) {
    var that = this
    common.ajax({
      url: 'api/myCourse',
      askType: 'POST'
    }, {}, function (msg) {
      if (msg.code === 200) {
        that.setData({
          lesson: msg.data
        })
        $wuxPrompt.init('msg1', {
          title: '空空如也',
          text: '暂无任何数据',
        }).show()
      } else {
        console.log('数据请求失败')
      }
    })
  },
  onPulling: function () {
  },
  onRefresh() {
    setTimeout(() => {
      $stopWuxRefresher()
      wx.showToast({
        title: '刷新成功',
        icon: 'none',
        duration: 1000
      })
    }, 1500)
  },
  onReady: function () {
    this.header = this.selectComponent("#header");
  }
})