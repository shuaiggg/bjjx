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
    shareInfo: {},
    activityItem: '',
    phone: '',
    assisting: [],
    part1: [],
    part2: [],
    assistedFriends: [],
    isMe: 1,
    helped: 0,
    finished: 0,
    havePhone: 0,
    newPhone: '',
    newNickName: '',
    newAvatarUrl: ''
  },
  onLoad: function (options) {
    var that = this
    var srt = 'header.iconShow'
    this.setData({
      activityItem: options.item,
      phone: options.phone,
      [srt]: options.scene === '666' ? false : true
    })

    wx.getStorage({
      key: 'sign',
      success: function (res) {
        console.log('老用户')
        common.ajax({
          url: 'api/shengdanShare',
          askType: 'POST'
        }, {
            level: that.data.activityItem,
            phone: that.data.phone
        }, function (msg) {
          console.log(msg)
          that.setData({
            isMe: msg.data.isMe,
            helped: msg.data.helped,
            finished: msg.data.finished,
            // assistedFriends: msg.data.firstPart,
            assisting: msg.data.secondPart,
            part1: msg.data.secondPart.slice(0, 3),
            part2: msg.data.secondPart.slice(3, 5),
            havePhone: msg.data.havePhone,
            shareInfo: Object.assign({}, that.data.shareInfo, msg.data.shareInfo)
          })
        }) 
      },
      fail: function () {
        console.log('新用户')
        common.ajax({
          url: 'api/shengdanShare',
          askType: 'POST',
          noGo: '../assist/assist?item=' + that.data.activityItem + '&phone=' + that.data.phone + '&scene=' + 666
        }, {
            level: that.data.activityItem,
            phone: that.data.phone
        }, function (msg) {
          console.log(msg)  
        })
      }
    })
  },
  onShareAppMessage: function (res) {
    var temItem = this.data.activityItem
    var temPhone = this.data.phone
    var temTitle = ''
    var temPath = ''
    var temImgUrl = ''
    
    if (temItem === 'shengdan2' || temItem === 'shengdan3') {
      temTitle = '我正在解锁圣诞奇遇第二层抽奖机会，快来帮我助力！'
      temPath = '/pages/assist/assist?item=' + temItem + '&phone=' + temPhone + '&scene=' + 666
      temImgUrl = 'https://wx.jianxuejy.net/static/icon/christmas/christmas.jpg'
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
      common.ajax({
        url: 'api/addShengdanShare',
        askType: 'POST'
      }, {
        level: that.data.activityItem,
        phone: that.data.phone,
        newNickName: temJson.nickName,
        newAvatarUrl: temJson.avatarUrl
      }, function (msg) {
        console.log(msg)
        if (msg.code === 200) {
          that.data.assisting.push({
            headImage: temJson.avatarUrl,
            nickName: temJson.nickName
          })
          if (that.data.assisting.length >= 3) {
            that.data.part2.push({
              headImage: temJson.avatarUrl,
              nickName: temJson.nickName
            })
          } else {
            that.data.part1.push({
              headImage: temJson.avatarUrl,
              nickName: temJson.nickName
            })
          }
          that.setData({
            helped: 1,
            assisting: that.data.assisting,
            part1: that.data.part1,
            part2: that.data.part2
          })
          wx.showToast({
            title: '助力成功',
            icon: 'none',
            duration: 1000
          })
        } else {
          wx.showToast({
            title: '助力失败',
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