const common = require('../../utils/ajax.js')
const app = getApp()
import { $stopWuxRefresher } from '../components/index'

Page({
  data: {
    baseUrl: app.globalData.baseUrl,
    header: {
      iconShow: false,
      title: '简精品'
    },
    intoView: '',
    current: '',
    freeCourse: [],
    category1: [],
    secondaryTabs: [],
    allItem: [],
    threeItem: [],
    active: true,
    arrowDown: true,
    arrowText: '更多',
    navigaHeight: 0,
    isIos: false
  },
  onLoad: function (options) {
    let that = this
    that.setData({
      navigaHeight: app.globalData.systemInfo.navigaHeight,
      isIos: app.globalData.systemInfo.isIos
    })

    that.askData()
  },
  onPulling: function () {
  },
  onRefresh: function () {
    setTimeout(() => {
      $stopWuxRefresher()
      wx.showToast({
        title: '刷新成功',
        icon: 'none',
        duration: 1000
      })
    }, 1500)
  },
  //简精品二级数据请求
  secondaryTab: function (e) {
    let that = this
    var serial2 = e.currentTarget.dataset.serial
    common.ajax({
      url: 'api/changeCategory2',
      askType: 'POST'
    }, {
      categoryId: e.currentTarget.dataset.categoryid
    }, function (msg) {
      if (msg.code === 200) {
        that.setData({
          freeCourse: msg.data.courseInfo,
          arrowDown: true, 
          arrowText: '更多',
          secondaryTabs: that.data.threeItem
        })
      } else {
        console.log('数据请求失败')
      }
    })

    if (serial2 === 'first') {
      var temArr = that.data.secondaryTabs
      for (var i = 0; i < temArr.length; i++) {
        temArr[i].active = false
      }
      that.setData({
        active: true,
        secondaryTabs: temArr
      })
    } else {
      var temArr = that.data.secondaryTabs
      for (var i = 0; i < temArr.length; i++) {
        if (serial2 === i) {
          temArr[i].active = true
        } else {
          temArr[i].active = false
        }
      }
      that.setData({
        active: false,
        secondaryTabs: temArr
      })
    }
  },
  //二级 全部 请求数据
  clickAll: function (e) {
    let that = this
    common.ajax({
      url: 'api/changeCategory1',
      askType: 'POST'
    }, {
      categoryId: that.data.current
    }, function (msg) {
      if (msg.code === 200) {
        var total = msg.data.category2
        for (var i = 0; i < total.length; i++) {
          total[i].active = false
        }
        that.setData({
          allItem: total,
          threeItem: total.slice(0, 3),
          secondaryTabs: total.slice(0, 3),
          freeCourse: msg.data.courseInfo,
          active: true,
          arrowDown: true,
          arrowText: '更多'
        })
      } else {
        console.log('数据请求失败')
      }
    })
  },
  clickMore: function (e) {
    var that = this
    if (that.data.arrowDown === true) {
      that.setData({
        arrowDown: false,
        arrowText: '收起',
        secondaryTabs: that.data.allItem
      })
    } else {
      that.setData({
        arrowDown: true,
        arrowText: '更多',
        secondaryTabs: that.data.threeItem
      })
    }
  },
  askCourses: function (e) {
    var that = this
    common.ajax({
      url: 'api/changeCategory1',
      askType: 'POST'
    }, {
      categoryId: e.currentTarget.dataset.into
    }, function (msg) {
      if (msg.code === 200) {
        var total = msg.data.category2
        for (var i = 0; i < total.length; i++) {
          total[i].active = false
        }
        that.setData({
          allItem: total,
          threeItem: total.slice(0, 3),
          secondaryTabs: total.slice(0, 3),
          arrowDown: true,
          arrowText: '更多',
          active: true,
          freeCourse: msg.data.courseInfo,
          intoView: 'id' + e.currentTarget.dataset.into,
          current: e.currentTarget.dataset.into
        })
      } else {
        console.log('数据请求失败')
      }
    })
  },
  goPlayBackPay: function (e) {
    var that = this
    var serial = e.currentTarget.dataset.serial
    var temJson = that.data.freeCourse[serial]
    wx.navigateTo({
      url: '../playback/playback?type=2&id=' + temJson.id + '&imgUrl=' + temJson.largePicture + '&price=' + temJson.salePrice
    })
  },
  askData: function () {
    var that = this
    common.ajax({
      url: 'api/specialCourse',
      askType: 'POST'
    }, {}, function (msg) {
      if (msg.code === 200) {
        var total = msg.data.category2
        for (var i = 0; i < total.length;i++) {
          total[i].active = false
        }
        that.setData({
          allItem: total,
          threeItem: total.slice(0, 3),
          secondaryTabs: total.slice(0, 3),
          freeCourse: msg.data.courseInfo,
          category1: msg.data.category1,
          current: msg.data.category1[0].id
        })
      } else {
        console.log('请求失败')
      }
    })
  },
  onTabItemTap: function (item) {
    if (item.index === 3) {
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