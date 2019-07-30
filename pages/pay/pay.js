const common = require('../../utils/ajax.js')
const app = getApp()

Page({
  data: {
    baseUrl: 'https://wx.jianxuejy.net',
    header: {
      iconShow: true,
      title: '确认订单'
    },
    imgUrl: '',
    title: '',
    price: 0,
    priceLater: 0,
    couponId: 0,
    courseId: '',
    cancelPay: false,
    sn: '',
    defWord: '请选择优惠券'
  },
  onLoad: function (options) {
    var that = this
    //请求课程详情
    common.ajax({
      url: 'api/joinCourse',
      askType: 'POST'
    }, {
      courseId: options.lessonId
    }, function (msg) {
      console.log(msg)
      if (msg.code === 200) {
        that.setData({
          imgUrl: msg.data[0].largePicture,
          title: msg.data[0].title,
          courseId: msg.data[0].id,
          price: msg.data[0].salePrice,
          priceLater: msg.data[0].salePrice
        })
      }
    })
  },
  onShow: function () {
    console.log(app.globalData.selecResult)
    if (app.globalData.selecResult != null) {
      var defWord = '已优惠' + app.globalData.selecResult.price + '元'
      console.log(this.data.price)
      console.log(app.globalData.selecResult.price)
      console.log(Number(this.data.price) - app.globalData.selecResult.price)     
      this.setData({
        defWord: defWord,
        priceLater: (Number(this.data.price) - app.globalData.selecResult.price).toFixed(2),
        couponId: app.globalData.selecResult.id
      })
      app.globalData.selecResult = null
    } 
  },
  doPay: function (e) {
    var that = this
    common.ajax({
      url: 'api/getOrder',
      askType: 'POST'
    }, {
      courseId: that.data.courseId,
      couponId: that.data.couponId
    }, function (msg) {
      console.log(msg);
      if (msg.code === 200) {
        console.log(msg.data.nonceStr.length)
        wx.requestPayment({
          'timeStamp': msg.data.timeStamp,
          'nonceStr': msg.data.nonceStr,
          'package': msg.data.package,
          'signType': 'MD5',
          'paySign': msg.data.paySign,
          'complete': function (res) {
            var resTitle = ''
            if (res.errMsg.indexOf('ok') >= 0) {
              resTitle = '支付成功'
              wx.navigateTo({
                url: '../list/list?type=4'
              })
            } else if (res.errMsg.indexOf('cancel') >= 0) {
              resTitle = '支付取消'
              that.setData({
                cancelPay: true,
                sn: msg.data.sn
              })
            } else {
              resTitle = '支付失败'
            }
            wx.showToast({
              title: resTitle,
              icon: resTitle === '支付成功' ? 'success' : 'none',
              duration: 1000
            })
          }
        })
      } else if (msg.code === 202) {
        wx.showToast({
          title: '支付成功',
          icon: 'success',
          duration: 1000
        })
        wx.navigateTo({
          url: '../list/list?type=4'
        })
      } else {
        wx.showToast({
          title: '下单失败',
          icon: 'none',
          duration: 1000
        })
      }
    })
  },
  cancelPay: function (e) {
    var that = this
    wx.showModal({
      title: '提示',
      content: '是否要取消订单？',
      success: function (res) {
        if (res.confirm) {
          if (!that.data.sn || that.data.sn === '') {
            return false
          } else {
            common.ajax({
              url: 'api/operateOrder',
              askType: 'POST'
            }, {
                out_trade_no:that.data.sn,
                action: 'cancelled'
              }, function (msg) {
                var resMsg = ''
                if (msg.code === 200) {
                  that.setData({
                    cancelPay: false,
                    sn: ''
                  })
                  wx.showToast({
                    title: '订单已取消',
                    icon: 'none',
                    duration: 1000
                  })
                } else {
                  wx.showToast({
                    title: '取消失败',
                    icon: 'none',
                    duration: 1000
                  })
                }
              })
          }
        }
      }
    })
  },
  continuePay: function (e) {
    var that = this
    wx.showModal({
      title: '提示',
      content: '是否要继续付款？',
      success: function (res) {
        if (res.confirm) {
          common.ajax({
            url: 'api/continuePay',
            askType: 'POST'
          }, {
              courseId: that.data.courseId,
              sn: that.data.sn
            }, function (msg) {
              if (msg.code === 200) {
                wx.requestPayment({
                  'timeStamp': msg.data.timeStamp,
                  'nonceStr': msg.data.nonceStr,
                  'package': msg.data.package,
                  'signType': 'MD5',
                  'paySign': msg.data.paySign,
                  'complete': function (res) {
                    console.log('=====' + res.errMsg)
                    var resTitle = ''
                    if (res.errMsg.indexOf('ok') >= 0) {
                      resTitle = '支付成功'
                      wx.navigateTo({
                        url: '../list/list?type=4'
                      })
                    } else if (res.errMsg.indexOf('cancel') >= 0) {
                      resTitle = '支付取消'
                      that.setData({
                        cancelPay: true
                      })
                    } else {
                      resTitle = '支付失败'
                    }
                    wx.showToast({
                      title: resTitle,
                      icon: resTitle === '支付成功' ? 'success' : 'none',
                      duration: 1000
                    })
                  }
                })
              } else {
                console.log('继续支付下单接口请求失败=====')
                wx.showToast({
                  title: '下单失败',
                  icon: 'none',
                  duration: 1000
                })
              }
            })
        }
      }
    })
  }
})