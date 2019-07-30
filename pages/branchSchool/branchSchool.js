const common = require('../../utils/ajax.js')
const app = getApp()

Page({
  data: {
    baseUrl: app.globalData.baseUrl,
    header: {
      iconShow: true,
      title: '全国分校',
      isPlaceholder: true
    },
    schoolArr: []
  },
  onLoad: function (options) {
    let that = this
    common.ajax({
      url: 'api/School/getBranchSchool',
      askType: 'POST'
    }, {}, function (msg) {
      if (msg.status === 200) {
        that.setData({
          schoolArr: msg.data
        })
      }
    })
  },
  goMap(e) {
    let activeCard = this.data.schoolArr[e.currentTarget.dataset.cardindex]
    wx.openLocation({
      latitude: parseFloat(activeCard.latitude),
      longitude: parseFloat(activeCard.longitude),
      scale: 16,
      name: activeCard.name,
      address: activeCard.address,
      success: res => {
        console.log(res)
      }
    })
  },
  makePhone(e) {
    wx.makePhoneCall({
      phoneNumber: e.currentTarget.dataset.phonenum
    })
  }
})