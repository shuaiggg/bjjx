const common = require('../../utils/ajax.js')
const app = getApp()

Page({
  data: {
    baseUrl: 'https://wx.jianxuejy.net',
    header: {
      iconShow: true,
      title: '课程名称',
      isPlaceholder: true
    },
    playImg: '',
    aboutImg: '',
    liveCourseId: '',
    liveStatus: '',
    reserve: '',
    title: '',
    hasPhoneNumber: '',
    playBackRoomId: '',
    liveRoomId: ''
  },
  onLoad: function (options) {
    if (options.scene && options.scene == '3') {
      this.header = this.selectComponent("#header");
      this.header.deltaNum(options.scene);
    }
    
    this.setData({
      liveCourseId: options.liveCourseId,
    })
    this.askData()
  },
  formSubmit: function (e) {
    console.log(e.detail.formId)
    var that = this
    common.ajax({
      url: 'api/reserve',
      askType: 'POST'
    }, {
      liveCourseId: that.data.liveCourseId,
      formId: e.detail.formId
    }, function (msg) {
      console.log(msg.data.status)
      var resTitle = ''
      if (msg.code === 200) {
        if (msg.data.status == 'cancel') {
          resTitle = '已取消预约'
        } else {
          resTitle = '预约成功'
        }
      } else {
        resTitle = '操作失败'
      }
      that.setData({
        reserve: msg.data.status,
      })
      wx.showToast({
        title: resTitle,
        icon: 'none',
        duration: 1000
      })
    })
  },
  goPlay: function (e) {
    let that = this
    
    that.data.liveRoomId
    common.ajax({
      url: 'api/live/live',
      askType: 'POST'
    }, {
      roomId: that.data.liveCourseId
    }, function (msg) {
      if (msg.code === 200) {
        // 有token说明是百家云回放回放
        if (msg.data.token) {
          wx.navigateTo({
            url: '/packageA/pages/playback/playback?parameter=' + JSON.stringify(msg.data)
          })
        } else {
          wx.navigateTo({
            url: '/packageB/pages/teacherPlayer/teacherPlayer?parameter=' + JSON.stringify(msg.data)
          })
        }
      }
    })
  },
  askData: function () {
    var that = this
    common.ajax({
      url: 'api/getLiveCourseInfo',
      askType: 'POST'
    }, {
      liveCourseId: that.data.liveCourseId
    }, function (msg) {
      if (msg.code === 200) {        
        that.setData({
          playImg: msg.data.picture,
          aboutImg: msg.data.about,
          reserve: msg.data.reserve,
          title: msg.data.title,
          liveStatus: msg.data.live,
          playBackRoomId: msg.data.playBackRoomId,
          liveRoomId: msg.data.liveRoomId,
          hasPhoneNumber: app.globalData.phoneNumber === '' ? '' : app.globalData.phoneNumber
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