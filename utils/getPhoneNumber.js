const getPhoneNumber = function (e, fn) {
  if (e.detail.errMsg.indexOf("fail") >= 0) {
    console.log(e.detail.errMsg)
    return false
  } else {
    wx.checkSession({
      success: function () {
        wx.getStorage({
          key: 'sign',
          success: function (res) {
            wx.request({
              url: 'https://wx.jianxuejy.net/index.php/api/addPhone',
              data: {
                encryptedData: e.detail.encryptedData,
                iv: e.detail.iv,
                sign: res.data
              },
              method: 'POST',
              header: {
                'content-type': 'application/json'
              },
              success: function (res) {
                if (res.data.code === 200) {
                  if (fn) fn(res.data.data.phone)
                } else {
                  console.log('addPhone接口请求失败')
                }
              }
            })
          }
        })
      },
      fail: function () {
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
                  wx.setStorage({
                    key: 'sign',
                    data: res.data.data['sign'],
                    success: function (res) {
                      //获取sign值
                      wx.getStorage({
                        key: 'sign',
                        success: function (res) {
                          wx.request({
                            url: 'https://wx.jianxuejy.net/index.php/api/addPhone',
                            data: {
                              encryptedData: e.detail.encryptedData,
                              iv: e.detail.iv,
                              sign: res.data
                            },
                            method: 'POST',
                            header: {
                              'content-type': 'application/json'
                            },
                            success: function (res) {
                              if (res.data.code === 200) {
                                if (fn) fn(res.data.data.phone)
                              } else {
                                console.log('addPhone接口请求失败')
                              }
                            }
                          })
                        }
                      })
                    }
                  })
                }
              }
            })
          }
        })
      }
    })
  }
}

module.exports.getPhoneNumber = getPhoneNumber;
