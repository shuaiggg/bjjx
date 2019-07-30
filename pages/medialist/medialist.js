const common = require('../../utils/ajax.js')

Page({
  data: {
    baseUrl: 'https://wx.jianxuejy.net',
    header: {
      iconShow: true,
      title: '预约看课',
      isPlaceholder: true
    },
    imgUrl: '',
    teacherId: '',
    courseList: [],
    backCourse: [],
    teacherInfo: ''
  },
  onLoad: function (options) {
    this.setData({
      teacherId: options.teacherId
    })
    this.askData()
  },
  onShow: function (e) {
  },
  goDetail: function (e) {
    var serial = e.currentTarget.dataset.serial 
    wx.navigateTo({
      url: '../mediadetail/mediadetail?liveCourseId=' + serial   
    })
  },
  askData: function () {
    var that = this
    common.ajax({
      url: 'api/getAllLiveCourseByTeacherId',
      askType: 'POST'
    }, {
        teacherId: that.data.teacherId
      }, function (msg) {
        if (msg.code === 200) {
          var live = msg.data.liveingCourse
          var future = msg.data.futureCourse
          var temArr = []
          for (var i = 0; i < live.length; i++) {
            var temJson = {}
            temJson.playTime = live[i].beginTime
            temJson.endTime = live[i].endTime
            temJson.peopleNum = live[i].reserveNum
            temJson.playType = 1
            temJson.liveRoomId = live[i].liveRoomId
            temJson.status = ''
            temJson.status = live[i].status
            temJson.playImg = live[i].picture
            temJson.aboutImg = live[i].about
            temJson.playTitle = live[i].title
            temJson.id = live[i].id
            temArr.push(temJson)
          }
          for (var i = 0; i < future.length; i++) {
            var temJson = {}
            temJson.playTime = future[i].beginTime
            temJson.endTime = future[i].endTime
            temJson.peopleNum = future[i].reserveNum
            temJson.playType = 2
            temJson.liveRoomId = ''           
            temJson.status = future[i].status
            temJson.playImg = future[i].picture
            temJson.aboutImg = future[i].about
            temJson.playTitle = future[i].title
            temJson.id = future[i].id
            temArr.push(temJson)
          }

          that.setData({
           courseList: temArr,
           backCourse: msg.data.backCourse,
           teacherInfo: msg.data.teacherInfo
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