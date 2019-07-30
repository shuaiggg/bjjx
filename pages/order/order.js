// pages/order/order.js
const app = getApp()
import $wuxPrompt from '../common/prompt/prompt'
import { $stopWuxRefresher } from '../components/index'
const common = require('../../utils/ajax.js')

Page({
  data: {
    baseUrl: 'https://wx.jianxuejy.net',
    header: {
      iconShow: true,
      title: '我的订单',
      isPlaceholder: false
    },
    navigaHeight: 0,
    tabs: ["已完成", "待完成", "已取消"],
    activeIndex: 0,
    sliderOffset: 0,
    sliderLeft: 0,
    paid: [],
    created: [],
    cancelled: [],
    isIos: false
  },
  onLoad: function (options) {
    var that = this
    let systemInfo = app.globalData.systemInfo
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          navigaHeight: (res.statusBarHeight - 20) / (res.windowWidth / 750),
          isIos: systemInfo.isIos
        })
      }
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
    }, 700)
  },
  tabClick: function (e) {
    this.askData()
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: e.currentTarget.id
    });
  },
  operateOrder: function (e) {
    var that = this
    var temAction = e.currentTarget.dataset['action']
    wx.showModal({
      title: '提示',
      content: temAction === 'cancelled' ? '确定取消订单？' : '确定删除订单？',
      success: function (res) {
        if (res.confirm) {
          common.ajax({
            url: 'api/operateOrder',
            askType: 'POST'
          }, {
              out_trade_no: e.currentTarget.dataset['sn'],
              action: temAction
            }, function (msg) {
              var resMsg = ''
              if (msg.code === 200) {
                if (e.currentTarget.dataset['action'] === 'cancelled') {
                  resMsg = '取消订单成功'
                } else {
                  resMsg = '删除订单成功'
                }
                that.askData()
              } else {
                if (e.currentTarget.dataset['action'] === 'cancelled') {
                  resMsg = '取消订单失败'
                } else {
                  resMsg = '删除订单失败'
                }
              }
              wx.showToast({
                title: resMsg,
                icon: resMsg.indexOf('成功') >= 0 ? 'success' : 'none',
                duration: 1000
              })
            })
        }
      }
    })
  },
  continuePay: function (e) {
    var that = this
    common.ajax({
      url: 'api/continuePay',
      askType: 'POST'
    }, {
      courseId: e.currentTarget.dataset['courseid'],
      sn: e.currentTarget.dataset['sn']
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
              that.askData()
              that.setData({
                sliderOffset: 0,
                activeIndex: 0
              });
            } else if (res.errMsg.indexOf('cancel') >= 0) {
              resTitle = '支付取消'
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
        console.log('待付款继续支付下单接口请求失败=====')
        wx.showToast({
          title: '下单失败',
          icon: 'none',
          duration: 1000
        })
      }
    })
  },
  askData: function () {
    var that = this
    //请求数据
    common.ajax({
      url: 'api/myOrder',
      askType: 'POST'
    }, {}, function (msg) {
      if (msg.code === 200) {
        var created = []
        var paid = []
        var cancelled = []
        //分拣数据
        for (var i = 0; i < msg.data.length; i++) {
          if (msg.data[i].status === 'created') {
            created.push(msg.data[i])
          } else if (msg.data[i].status === 'paid') {
            paid.push(msg.data[i])
          } else if (msg.data[i].status === 'cancelled') {
            cancelled.push(msg.data[i])
          } else {
          }
        }
        //更新数据
        that.setData({
          paid: paid,
          created: created,
          cancelled: cancelled
        })
        $wuxPrompt.init('msg1', {
          title: '空空如也',
          text: '暂时没有相关数据',
        }).show()
      } else {
        $wuxPrompt.init('msg1', {
          title: '空空如也',
          text: '暂时没有相关数据',
        }).show()
        wx.showToast({
          title: '数据请求失败',
          icon: 'none',
          duration: 1000
        });
      }
    })
  }
})