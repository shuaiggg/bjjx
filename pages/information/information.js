const app = getApp()
const common = require('../../utils/ajax.js')
const getPhone = require('../../utils/getPhoneNumber.js')
import { $wuxSelect, $wuxDialog } from '../components/index'

Page({
  data: {
    baseUrl: 'https://wx.jianxuejy.net',
    header: {
      iconShow: false,
      title: '填写信息'
    },
    value2: '',
    title2: '',
    fromType: '',
    hasPhoneNumber: '',
    fillItem: []
  },
  onLoad: function (options) {
    var that = this
    if (options.from && options.from === 'me') {
      var str = "header.title"
      var str2 = "header.iconShow"
      that.setData({
        [str]: '个人信息',
        fromType: options.from,
        [str2]: true
      })
    }
    wx.login({
      success: function (res) {
        wx.request({
          url: 'https://wx.jianxuejy.net/index.php/api/getOpenIdAndSessionKeyByCode',
          data: {
            code: res.code
          },
          header: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          method: 'PUT',
          success: function (res) {
            var sign = res.data.data['sign']
            if (res.data.code === 200) {
              wx.setStorage({
                key: 'sign',
                data: sign,
                success: function (res) {
                  common.ajax({
                    url: 'api/getUserMessageBySign',
                    askType: 'POST'
                  }, {
                    sign: sign
                  }, function (msg) {
                      console.log(msg)
                      that.setData({
                        fillItem: msg.data
                      })
                  })
                }
              })
            }
          }
        })
      }
    })
  },
  onClick2: function (e) {
    var serial = e.currentTarget.dataset.serial
    var temJson = this.data.fillItem[serial].checkItem
    $wuxSelect('#wux-select2').open({
      value: this.data.value2,
      options: temJson,
      onConfirm: (value, index, options) => {
        console.log(value, index, options)
        var str = "fillItem[" + serial + "].itemValue"
        this.setData({
          [str]: options[index].title
        })
      },
    })
  },
  getPhoneNumber: function (e) {
    var that = this
    var serial = e.currentTarget.dataset.serial
    getPhone.getPhoneNumber(e,function(msg){
      var str = "fillItem[" + serial + "].itemValue"
      that.setData({
        [str]: msg
      })
    })
  },
  prompt: function (e) {
    var that = this
    var serial = e.currentTarget.dataset.serial
    const alert = (content) => {
      $wuxDialog('#wux-dialog--alert').alert({
        resetOnClose: true,
        title: '提示',
        content: content,
      })
    }
    $wuxDialog().prompt({
      resetOnClose: true,
      title: '请填写',
      fieldtype: 'text',
      maxlength: 8,
      onConfirm(e, response) {
        var str = "fillItem[" + serial + "].itemValue"
        that.setData({
          [str]: response
        })
      },
    })
  },
  subInfo: function (e) {
    var that = this
    var temFillItem = that.data.fillItem
    var temData = {}
    for (var i = 0; i < temFillItem.length; i++) {
      temData[temFillItem[i].name] = temFillItem[i].itemValue
    }
    console.log(temData)
    common.ajax({
      url: 'api/addUserInfoBySign',
      askType: 'POST'
    }, temData, function (msg) {
      console.log(msg)
      if (msg.code == 200) {
        wx.showToast({
          title: '提交成功',
          icon: 'none',
          duration: 1000
        })

        if (that.data.fromType === 'me') {
          wx.navigateBack({
            delta: 1
          })
        } else {
          wx.redirectTo({
            url: '../category/category'
          })
        }
      } else {
        wx.showToast({
          title: msg.message,
          icon: 'none',
          duration: 1000
        })
      }  
    })
  }
})