// pages/components/header.js
Component({
  options: {
    multipleSlots: true 
  },
  properties: {
    title: {
      type: String,
      value: '栏目栏目栏目栏目栏目栏目'
    },
    lImg: {
      type: String,
      value: 'https://wx.jianxuejy.net/static/opencourse/zyyscjxks.jpg'
    },
    sImg: {
      type: String,
      value: 'https://wx.jianxuejy.net/static/teacherPhoto/zhangyuanhang.jpg'
    },
    lTitle: {
      type: String,
      value: '张远航'
    },
    rTitle: {
      type: String,
      value: '￥66'
    },
    rColor: {
      type: String,
      value: 'right-color'
    },
    isLive: {
      type: Boolean,
      value: false
    }
  },
  data: {
    
  },
  methods: {
    _goUrl: function (e) {
      this.triggerEvent('gourl')
    }
  }
})
