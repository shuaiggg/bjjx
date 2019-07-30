const common = require('../../utils/ajax.js')
const getPhone = require('../../utils/getPhoneNumber.js')
const app = getApp()

Page({
  data: {
    baseUrl: 'https://wx.jianxuejy.net',
    header: {
      iconShow: true,
      title: '许愿支持',
      isPlaceholder: false,
    },
    shareInfo: {
      headImage: '',
      nickName: ''
    },
    activityItem: '',
    phone: '',
    isMe: 0,
    helped: 0,
    finished: 0,
    havePhone: 0,
    newPhone: '',
    newNickName: '',
    newAvatarUrl: '',
    count: 0
  },
  onLoad: function (options) {
    var that = this
    var srt = 'header.iconShow'
    this.setData({
      activityItem: options.item,
      phone: options.phone,
      [srt]: options.scene === '666' ? false : true
    })
    
    common.ajax({
      url: 'api/yuandanShare',
      askType: 'POST'
    }, {
      phone: that.data.phone
    }, function (msg) {
      console.log(msg)
      that.setData({
        isMe: msg.data.isMe,
        helped: msg.data.helped,
        havePhone: msg.data.havePhone,
        count: msg.data.count,
        shareInfo: Object.assign({}, that.data.shareInfo, msg.data.shareInfo)
      })
    })
  },
  onShareAppMessage: function (res) {
    var temItem = this.data.activityItem
    var temPhone = this.data.phone
    var temTitle = ''
    var temPath = ''
    var temImgUrl = ''

    if (temItem === 'yuandan') {
      temTitle = '我在许愿墙上许了一个愿望，让我的愿望成真吧！'
      temPath = '/pages/assist2/assist2?item=' + temItem + '&phone=' + temPhone + '&scene=' + 666
      temImgUrl = 'https://wx.jianxuejy.net/static/icon/christmas/wish.jpg'
    } else {
      temTitle = '化繁为简，为梦而学'
      temPath = '/pages/coursesList/coursesList'
      temImgUrl = 'https://wx.jianxuejy.net/static/banner/share.jpg'
    }
    return {
      title: temTitle,
      path: temPath,
      imageUrl: temImgUrl
    }
  },
  getUserInfo: function (e) {
    var that = this
    if (e.detail.errMsg === 'getUserInfo:ok') {
      var temJson = JSON.parse(e.detail.rawData)
      // console.log(temJson)

      common.ajax({
        url: 'api/addyuandanShare',
        askType: 'POST'
      }, {
        phone: that.data.phone,
        newPhone: that.data.newPhone,
        newNickName: temJson.nickName,
        newAvatarUrl: temJson.avatarUrl
      }, function (msg) {
        console.log(msg)
        if (msg.code === 200) {
          that.setData({
            helped: 1,
            count: that.data.count + 1
          })
          wx.showToast({
            title: '支持成功',
            icon: 'none',
            duration: 1000
          })
        } else {
          wx.showToast({
            title: '支持失败',
            icon: 'none',
            duration: 1000
          })
        }
      })
    } else {
      wx.showToast({
        title: '授权后，才能助力哦',
        icon: 'none',
        duration: 1000
      })
    }
  },
  getPhoneNumber: function (e) {
    var that = this
    getPhone.getPhoneNumber(e, function (msg) {
      that.setData({
        havePhone: 1,
        newPhone: msg
      })
    })
  },
  goHome: function () {
    wx.reLaunch({
      url: '../category/category'
    })
  }
})