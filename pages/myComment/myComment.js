const common = require('../../utils/ajax.js')
import $wuxPrompt from '../common/prompt/prompt'
const app = getApp()

Page({
  data: {
    baseUrl: app.globalData.baseUrl,
    header: {
      iconShow: true,
      title: '我的评论',
      isPlaceholder: true
    },
    commentArr: []
  },
  onLoad: function (options) {
    let that = this
    common.ajax({
      url: 'api/Comments/getMyCommentsInfo',
      askType: 'POST'
    }, {}, function (msg) {
      if (msg.status === 200) {
        that.setData({
          commentArr: msg.data
        })

        $wuxPrompt.init('msg1', {
          title: '空空如也',
          text: '暂时没有相关数据',
        }).show()
      }
    })
  },
  goPlayBack(e) {
    e.currentTarget.dataset.courseId
    wx.navigateTo({
      url: '/playback/playback?id=' + e.currentTarget.dataset.course_id,
    })
  }
})