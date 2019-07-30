import $wuxPrompt from '../common/prompt/prompt'
import { $stopWuxRefresher } from '../components/index'
const common = require('../../utils/ajax.js')
const app = getApp()

Page({
  data: {
    baseUrl: 'https://wx.jianxuejy.net',
    header: {
      iconShow: true,
      title: '我的优惠券'
    },
    couponCode: '',
    courseId: '',
    couponType: 'myCoupon',
    useBtn: '',
    selecResult: {},
    radioItems: [],
    canUse: false
  },
  onLoad: function (options) {
    var that = this 
    if (options.couponType === 'allCoupon') {
      var str = "header.title"
      that.setData({
        [str]: '我的优惠券'
      })
    } else {
      var str = "header.title"
      that.setData({
        [str]: '优惠券（可用）',
        couponType: 'courseSelectCoupon',
        courseId: options.courseId,
        canUse: true
      })
    } 
    that.askData()
    $wuxPrompt.init('msg1', {
      title: '空空如也',
      text: '暂无任何数据',
    }).show()
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
  coupon: function (e) {
    var that = this
    if (that.data.couponCode == undefined || that.data.couponCode == '') {
      wx.showToast({
        title: '请填写兑换码',
        icon: 'none',
        duration: 1000
      })
      return
    } else {      
      common.ajax({
        url: 'api/reciveMyCoupon',
        askType: 'POST'
      }, {
        code: that.data.couponCode
      }, function (msg) {        
        if (msg.code === 200) {       
          that.setData({
            couponCode: ''
          })
          that.askData()
        }
        wx.showToast({
          title: msg.message,
          icon: 'none',
          duration: 1000
        })
      })
    }
  },
  doSearch: function (e) {
    console.log('搜索：' + e.detail) 
  },
  changeBlur: function (e) {
    this.setData({
      couponCode: e.detail.value
    })
  },
  aa: function (e) {
   // console.log(e.detail.value)
    this.setData({
      couponCode: e.detail.value
    })
  },
  radioChange: function (e) {
    var radioItems = this.data.radioItems
    var temResult = {}
    for (var i = 0, len = radioItems.length; i < len; ++i) {
      radioItems[i].checked = radioItems[i].id == e.detail.value;
    }
    this.setData({
      radioItems: radioItems
    })
  },
  goBack: function (e) {
    var radioItems = this.data.radioItems
    for (var i = 0, len = radioItems.length; i < len; ++i) {
      if (radioItems[i].checked !== false) {
        app.globalData.selecResult = radioItems[i]
        break;
      } 
    }

    if (app.globalData.selecResult == null) {
      wx.showToast({
        title: '请先选优惠券',
        icon: 'none',
        duration: 1000
      });
    } else {
      wx.navigateBack({
        delta: 1
      })
    }  
  },
  askData: function () {
    var that = this
    var url = 'api/' + that.data.couponType
    var temJson = {}
    if (that.data.couponType === 'courseSelectCoupon') {
      temJson.courseId = that.data.courseId
    } else {   
    }
    common.ajax({
      url: url,
      askType: 'POST'
    }, temJson, function (msg) {
      if (msg.code === 200) {
        if (msg.data.length > 0 && that.data.canUse === true) {
          that.setData({
            useBtn: 'selectCoupon'
          })
        }
        that.setData({
          radioItems: msg.data
        })
      } else {
        wx.showToast({
          title: '数据请求失败',
          icon: 'none',
          duration: 1000
        });
      }
    })
  }
})