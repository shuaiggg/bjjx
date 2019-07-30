// pages/category/category.js
const app = getApp()
const common = require('../../utils/ajax.js')

Page({
  data: {
    baseUrl: 'https://wx.jianxuejy.net',
    header: {
      iconShow: true,
      title: '选课中心'
    },
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    rightSlider: [],
    navigaHeight: app.globalData.systemInfo.navigaHeight
  },
  onLoad: function (options) {
    var that = this
    wx.getSetting({
      success: function (res) {
        if (res.authSetting['scope.userInfo']) {
          console.log('已授权')
          if (options.type) {
            // console.log('从个人中心进来')
            that.askData()
          } else {
            //console.log('不是从个人中心进来')
            common.ajax({
              url: 'api/getAllCategorys',
              askType: 'GET'
            }, {}, function (msg) {
              if (msg.code === 200) {
                that.setData({
                  rightSlider: msg.data
                })
                var allcategorys = []
                for (var i = 0; i < msg.data.length; i++) {
                  var temJson = {}
                  temJson.text = msg.data[i].name
                  temJson.categoryId = msg.data[i].id
                  allcategorys.push(temJson)
                }
                wx.setStorage({
                  key: "allcategorys",
                  data: allcategorys,
                  success: function () {
                    wx.switchTab({
                      url: '../coursesList/coursesList'
                    })
                  }
                })
              } else {
                console.log('科目数据请求失败')
              }
            })
          }
        } else {
          console.log('未授权')
          var str = "header.iconShow"
          that.setData({
            [str]: false
          })
          that.askData() 
        }
      }
    })
  },
  getUserInfo: function (e) {
    var that = this
    var category = {}
    category.categoryId = e.currentTarget.dataset['categoryid']
    category.categoryName = e.currentTarget.dataset['category']
    wx.setStorage({
      key: 'newcategory',
      data: category,
      success: function () {
        console.log('newcategory存储成功')
        common.ajax({
          url: 'api/updateSelectCategoryId',
          askType: 'POST'
        }, {
            categoryId: e.currentTarget.dataset['categoryid']
        }, function (msg) {
          if (msg.code === 200) {
            console.log('记录成功')
            // 引导用户授权
            if (e.detail.errMsg === 'getUserInfo:ok') {
              app.globalData.userInfo = e.detail.userInfo
              app.globalData.refreshFlag = true
              wx.switchTab({
                url: '../coursesList/coursesList'
              })
            }
          } else {
            console.log('请求失败')
          }
        })

      }
    })
  },
  askData: function () {
    var that = this
    common.ajax({
      url: 'api/getAllCategorys',
      askType: 'GET'
    }, {}, function (msg) {
      if (msg.code === 200) {
        that.setData({
          rightSlider: msg.data
        })
        var allcategorys = []
        for (var i = 0; i < msg.data.length; i++) {
          var temJson = {}
          temJson.text = msg.data[i].name
          temJson.categoryId = msg.data[i].id
          allcategorys.push(temJson)
        }
        wx.setStorage({
          key: "allcategorys",
          data: allcategorys,
          success: function () {
            console.log('储存所有分类成功')
          }
        })
      } else {
        console.log('科目数据请求失败')
      }
    })
  }
})