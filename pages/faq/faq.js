Page({
  data: {
    baseUrl: 'https://wx.jianxuejy.net',
    header: {
      iconShow: true,
      title: '疑问解答',
      isPlaceholder: true
    }
  },
  contactUs() {
    wx.makePhoneCall({
      phoneNumber: '4001618511'
    })
  }
})