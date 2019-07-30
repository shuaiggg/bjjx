const app = getApp()

Component({
  properties: {
    title: {
      type: String,
      value: '首页'
    },
    isShow: {
      type: Boolean,
      value: false
    },
    rotate: {
      type: Boolean,
      value: false
    },
    isPlaceholder: {
      type: Boolean,
      value: true
    }
  },
  data: {
    isRotate: false,
    delta: 1,
    navigaHeight: 0,
    statusBarHeight: 0
  },
  attached: function () {
    let that = this
    let systemInfo = app.globalData.systemInfo
    that.setData({
      navigaHeight: systemInfo.navHeight,
      statusBarHeight: systemInfo.statusBarHeight
    })
     
  },
  methods: {
    back: function (e) {
      var sence = this.data.delta
      if (sence && sence == '3') {
        wx.reLaunch({
          url: '../coursesList/coursesList'
        })
      } else {
        wx.navigateBack({
          delta: this.data.delta
        })
      } 
    },
    showRotate: function () {
      this.setData({
        isRotate: true
      })
    },
    colseRotate: function () {
      this.setData({
        isRotate: false
      })
    },
    deltaNum: function (e) {
      this.setData({
        delta: e
      })
    }
  }
})
