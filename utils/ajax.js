const ajax = function (base, parameter, fn) {
  const app = getApp()
  const lastUrl = 'https://wx.jianxuejy.net/index.php/' + base.url 

  const login = function () {
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
            if (res.data.code === 200) {
              if (base.noGo) {
                wx.setStorage({
                  key: 'sign',
                  data: res.data.data['sign'],
                  success: function (res) {
                    wx.redirectTo({
                      url: base.noGo
                    })
                  }
                })  
              } else {
                wx.setStorage({
                  key: 'sign',
                  data: res.data.data['sign'],
                  success: function (res) {
                    wx.redirectTo({
                      url: '../category/category'
                    })
                  }
                })
              }
            }
          }
        })
      }
    })
  }
  wx.showLoading({
    title: '加载中',
    mask: true
  })
  // 校验用户当前session_key是否有效
  wx.checkSession({
    success: function () {
      wx.getStorage({
        key: 'sign',
        success: function (res) {
          parameter.sign = res.data
          // console.log('请求地址：' + lastUrl)
          // console.log('请求参数：' + JSON.stringify(parameter))
            wx.request({
              url: lastUrl,
              data: parameter,
              header: {
                'content-type': 'application/json'
              },
              method: base.askType,
              success: function (res) {
                wx.hideLoading()
                // console.log('请求结果：' + res.data.code)
                if (res.data.code === 201) {
                  login()
                } else {
                  if (fn) fn(res.data)
                }
              }
            })
        },
        fail: function () {
          login()
        }
      })
    },
    fail: function () {
      login()
    }
  })
}
module.exports.ajax = ajax;