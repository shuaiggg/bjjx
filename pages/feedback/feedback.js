// pages/feedback/feedback.js
const app = getApp()
const common = require('../../utils/ajax.js')
Page({
  data: {
    baseUrl: app.globalData.baseUrl,
    header: {
      iconShow: true,
      title: '意见反馈',
      isPlaceholder: true
    },
    radioColor:'#e86e21',
    result:false
  },
  formSubmit:function(e){
    let that = this
    let textarea = e.detail.value.textarea
    let phone = e.detail.value.phone
    if (textarea === "" ) {
      wx.showToast({
        title: '意见不能为空',
        icon: 'none'
      })
      return false;
    } else {
      if (phone) {
        if (!(/^(((13[0-9]{1})|(16[0-9]{1})|(19[0-9]{1})|(15([0-9]{1}))|(18[0-9]{1})|(17+(0|1|2|4|5|3|6|7|8))|(14+(5|6|7|8|9)))+\d{8})$/.test(phone))) {
          wx.showToast({
            title: '手机号格式错误',
            icon: 'none'
          });
          return false;
        } 
      }

      common.ajax({
        url: 'api/Specialty/createFeedbackInfo',
        askType: 'POST'
      }, {
        text: textarea,
        mobile: phone
      },function (msg) {
        if (msg.status == 200) {
          that.setData({
            result: true
          })
        }
      })
    }
  }
})