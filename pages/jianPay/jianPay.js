const app = getApp()

Page({
  data: {
    header: {
      iconShow: true,
      title: '简支付'
    },
    baseUrl: app.globalData.baseUrl,
    payWay: [
      {
        pawTitle: '银行转账',
        payQcode: 'https://wx.jianxuejy.net/static/icon/pay_way/pay_wx.jpg'
      },
      {
        pawTitle: '微信转账',
        payQcode: 'https://wx.jianxuejy.net/static/icon/pay_way/pay_wx.jpg'
      },
      {
        pawTitle: '富友扫码',
        payQcode: 'https://wx.jianxuejy.net/static/icon/pay_way/pay_fysm.jpg'
      },
      {
        pawTitle: '小恒收钱',
        payQcode: 'https://wx.jianxuejy.net/static/icon/pay_way/pay_xh.jpg'
      },
      {
        pawTitle: '库分期',
        payQcode: 'https://wx.jianxuejy.net/static/icon/pay_way/pay_kfq.jpg'
      },
      {
        pawTitle: '蜡笔分期',
        payQcode: 'https://wx.jianxuejy.net/static/icon/pay_way/pay_lb.jpg'
      },
      {
        pawTitle: '民生银行',
        payQcode: 'https://wx.jianxuejy.net/static/icon/pay_way/pay_ms.jpg'
      },
      {
        pawTitle: '小通分期（A渠道）',
        payQcode: 'https://wx.jianxuejy.net/static/icon/pay_way/pay_xta.jpg'
      },
      {
        pawTitle: '小通分期（B渠道）',
        payQcode: 'https://wx.jianxuejy.net/static/icon/pay_way/pay_xtb.jpg'
      }
    ],
    copyList: [
      {
        title: '开户名称',
        content: '北京简学教育科技有限公司',
      },
      {
        title: '开户银行',
        content: '华夏银行股份有限公司北京首体支行',
      },
      {
        title: '开户账号',
        content: '10271000000714144'
      }
    ],
    isShow: false
  },
  onLoad: function () {
  },
  previewImage(e) {
    let ser = e.currentTarget.dataset.index
    let qcode = e.currentTarget.dataset.qcode
    if (ser === 0) {
      this.setData({
        isShow: true
      })
    } else {
      wx.previewImage({
        current: qcode, 
        urls: [qcode] 
      })
    }
  },
  doCopy(e) {
    let ser = e.currentTarget.dataset.index
    wx.setClipboardData({
      data: this.data.copyList[ser].content,
      success(res) {
        wx.getClipboardData({
          success(res) {
            console.log(res.data)
          }
        })
      }
    })
  },
  closeCopr() {
    this.setData({
      isShow: false
    })
  }
})